import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import app from "../src/app.js";
import { config } from "../src/config/env.config.js";
import { hashPassword, verifyPassword } from "../src/utils/password.js";
import { checkTokenConfig, signToken, verifyToken } from "../src/utils/token.js";

test("password hashes verify the right password and reject malformed hashes", async () => {
  const hash = await hashPassword("ExamplePass123!");
  assert.equal(await verifyPassword("ExamplePass123!", hash), true);
  assert.equal(await verifyPassword("WrongPass123!", hash), false);
  assert.equal(await verifyPassword("ExamplePass123!", "invalid"), false);
});

test("access and refresh tokens are signed, typed and time limited", () => {
  checkTokenConfig();
  const access = signToken(42, "access");
  const refresh = signToken(42, "refresh");
  assert.equal(verifyToken(access, "access"), 42);
  assert.equal(verifyToken(refresh, "refresh"), 42);
  assert.throws(() => verifyToken(refresh, "access"), { statusCode: 401 });
  const changed = access.at(-1) === "x" ? "y" : "x";
  assert.throws(() => verifyToken(`${access.slice(0, -1)}${changed}`, "access"), { statusCode: 401 });

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: "42", type: "access", iat: now - 901, exp: now - 1 }))
    .toString("base64url");
  const input = `${header}.${payload}`;
  const signature = createHmac("sha256", config.auth.accessSecret).update(input).digest("base64url");
  assert.throws(() => verifyToken(`${input}.${signature}`, "access"), { statusCode: 401 });
});

test("auth routes validate bodies and protect /me", async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, method = "GET", body, headers = {}) => {
    const response = await fetch(`${address}${path}`, {
      method, headers: { "content-type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, json: await response.json() };
  };
  try {
    assert.equal((await request("/auth/register", "POST", {
      name: "A", email: "bad", password: "short", role: "ADMIN",
    })).status, 400);
    assert.equal((await request("/auth/login", "POST", { email: "bad", password: "short" })).status, 400);
    assert.equal((await request("/auth/refresh", "POST", { refreshToken: "bad" })).status, 401);
    assert.equal((await request("/auth/me")).status, 401);
    assert.equal((await request("/auth/me", "GET", undefined, {
      authorization: `Bearer ${signToken(42, "refresh")}`,
    })).status, 401);
  } finally {
    server.close();
  }
});
