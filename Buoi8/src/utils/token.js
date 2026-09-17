import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { config } from "../config/env.config.js";
import { UnauthorizedError } from "../core/error.response.js";

const lifetimes = { access: 15 * 60, refresh: 7 * 24 * 60 * 60 };

const secretFor = (type) => {
  const secret = type === "access" ? config.auth.accessSecret : config.auth.refreshSecret;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error(`JWT_${type.toUpperCase()}_SECRET must contain at least 32 bytes`);
  }
  return secret;
};

export const checkTokenConfig = () => {
  secretFor("access");
  secretFor("refresh");
  if (config.auth.accessSecret === config.auth.refreshSecret) {
    throw new Error("JWT access and refresh secrets must differ");
  }
};

const signature = (input, secret) => createHmac("sha256", secret).update(input).digest();

export const signToken = (userId, type) => {
  if (!Object.hasOwn(lifetimes, type)) throw new Error("Invalid token type");
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: String(userId), type, iat: now, exp: now + lifetimes[type], jti: randomUUID(),
  })).toString("base64url");
  const input = `${header}.${payload}`;
  return `${input}.${signature(input, secretFor(type)).toString("base64url")}`;
};

export const verifyToken = (token, type) => {
  if (!Object.hasOwn(lifetimes, type) || typeof token !== "string") {
    throw new UnauthorizedError("Invalid or expired token");
  }
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) {
    throw new UnauthorizedError("Invalid or expired token");
  }
  const [headerPart, payloadPart, signaturePart] = parts;
  const input = `${headerPart}.${payloadPart}`;
  const expected = signature(input, secretFor(type));
  const actual = Buffer.from(signaturePart, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new UnauthorizedError("Invalid or expired token");
  }
  try {
    const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== "HS256" || header.typ !== "JWT" || payload.type !== type ||
        !/^[1-9]\d*$/.test(payload.sub) || !Number.isSafeInteger(Number(payload.sub)) ||
        !Number.isInteger(payload.iat) || payload.iat > now ||
        !Number.isInteger(payload.exp) || payload.exp <= now ||
        payload.exp - payload.iat !== lifetimes[type]) {
      throw new Error("Invalid claims");
    }
    return Number(payload.sub);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
};
