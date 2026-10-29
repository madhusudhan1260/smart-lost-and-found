// JWT authentication and role checks.
// The React app sends:  Authorization: Bearer <token>
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { STAFF_ROLES } from '../config/constants.js';
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

// Public routes: works without a token, but recognises who is logged in
// (e.g. GET /api/items includes private details only for staff).
export function optionalAuth(req, _res, next) {
  req.user = readUser(req);
  next();
}

// requireRole('superadmin') → 401 without a valid token, 403 with the wrong role.
// requireRole() with no roles → any logged-in account.
export const requireRole = (...roles) => (req, _res, next) => {
  req.user = readUser(req);
  if (!req.user) return next(new HttpError(401, 'Please log in to do this.'));
  if (roles.length && !roles.includes(req.user.role)) {
    return next(new HttpError(403, 'Your account is not allowed to do this.'));
  }
  next();
};

export const requireAuth = requireRole();
export const requireDoss = requireRole(...STAFF_ROLES); // DOSS staff and super admins
export const requireSuperAdmin = requireRole('superadmin');

export const isDoss = (req) => STAFF_ROLES.includes(req.user?.role);
