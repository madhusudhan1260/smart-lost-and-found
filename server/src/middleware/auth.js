// JWT authentication for DOSS staff.
// The React app sends:  Authorization: Bearer <token>
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import HttpError from '../utils/HttpError.js';

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role, name: user.name }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

function readUser(req) {
  const header = req.get('Authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return { id: payload.sub, role: payload.role, name: payload.name };
  } catch {
    return null; // expired or tampered token
  }
}

// Public routes: works without a token, but recognises DOSS staff when one is sent
// (e.g. GET /api/items includes private details only for DOSS).
export function optionalAuth(req, _res, next) {
  req.user = readUser(req);
  next();
}

// DOSS-only routes: 401 without a valid token
export function requireDoss(req, _res, next) {
  req.user = readUser(req);
  if (!req.user) return next(new HttpError(401, 'Please log in as DOSS staff to do this.'));
  if (req.user.role !== 'doss') return next(new HttpError(403, 'Only DOSS staff can do this.'));
  next();
}

export const isDoss = (req) => req.user?.role === 'doss';
