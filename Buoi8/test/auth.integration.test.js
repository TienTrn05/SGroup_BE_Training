import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import app from "../src/app.js";
import pool from "../src/config/db.config.js";

test("register, login, me and refresh work with PostgreSQL", {
  skip: process.env.RUN_DB_TEST !== "1",
}, async () => {
  const email = `auth-test-${randomUUID()}@example.com`;
  const password = "ExamplePass123!";
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, method, body, token) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, data: await response.json() };
  };

  try {
    const registered = await request("/auth/register", "POST", { name: "Auth Test", email, password });
    assert.equal(registered.status, 201);
    assert.equal(registered.data.data.role, "MEMBER");
    assert.equal(registered.data.data.password_hash, undefined);

    const stored = await pool.query("SELECT password_hash FROM public.users WHERE email = $1", [email]);
    assert.notEqual(stored.rows[0].password_hash, password);

    const wrong = await request("/auth/login", "POST", { email, password: "WrongPass123!" });
    assert.equal(wrong.status, 401);

    const loggedIn = await request("/auth/login", "POST", { email: email.toUpperCase(), password });
    assert.equal(loggedIn.status, 200);
    assert.equal(loggedIn.data.data.user.password_hash, undefined);
    const { accessToken, refreshToken } = loggedIn.data.data;

    const me = await request("/auth/me", "GET", undefined, accessToken);
    assert.equal(me.status, 200);
    assert.equal(me.data.data.email, email);

    const refreshed = await request("/auth/refresh", "POST", { refreshToken });
    assert.equal(refreshed.status, 200);
    assert.notEqual(refreshed.data.data.accessToken, accessToken);
    assert.equal((await request("/auth/me", "GET", undefined, refreshed.data.data.accessToken)).status, 200);
    assert.equal((await request("/auth/me", "GET", undefined, refreshToken)).status, 401);
  } finally {
    await pool.query("DELETE FROM public.users WHERE email = $1", [email]);
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  }
});
