import { UnauthorizedError } from "../core/error.response.js";
import { verifyToken } from "../utils/token.js";

export const requireAuth = (req, res, next) => {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? "");
  if (!match) return next(new UnauthorizedError("Bearer access token is required"));
  try {
    req.userId = verifyToken(match[1], "access");
    return next();
  } catch (error) {
    return next(error);
  }
};
