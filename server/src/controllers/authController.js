// Handlers for /api/auth  (login for students, DOSS staff and super admins)
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { clearFailures, recordFailure } from '../middleware/loginLimiter.js';
import { PASSWORD_RULE, ROLES, STAFF_ROLES } from '../config/constants.js';
import HttpError from '../utils/HttpError.js';
import { pick } from '../utils/pick.js';

const PORTAL_NAMES = { student: 'Student', doss: 'DOSS staff', superadmin: 'Super Admin' };

// Which accounts may use each login tab (a super admin may also use the DOSS tab)
const PORTAL_ROLES = { student: ['student'], doss: STAFF_ROLES, superadmin: ['superadmin'] };

// POST /api/auth/login  { email, password, portal? }  →  { token, user }
export async function login(req, res) {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const portal = req.body?.portal ? String(req.body.portal) : null;
  if (!email || !password) throw new HttpError(400, 'Email and password are required.');
  if (portal && !ROLES.includes(portal)) throw new HttpError(400, 'Unknown login type.');

  // passwordHash is hidden by default, so ask for it explicitly
  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message for "no such user" and "wrong password" – does not reveal which emails exist
  if (!user || !(await user.checkPassword(password))) {
    recordFailure(req);
    throw new HttpError(401, 'Incorrect email or password.');
  }
  clearFailures(req);

  if (!user.active) throw new HttpError(403, 'This account has been disabled. Please contact the DOSS office.');
  if (portal && !PORTAL_ROLES[portal].includes(user.role)) {
    throw new HttpError(403, `This is a ${PORTAL_NAMES[user.role]} account. Please use the ${PORTAL_NAMES[user.role]} tab.`);
  }

  user.lastLoginAt = new Date();
  await user.save();
  res.json({ token: signToken(user), user: user.toJSON() });
}

// POST /api/auth/register  { name, email, rollNumber, password }  – students only
export async function register(req, res) {
  const fields = pick(req.body, ['name', 'email', 'rollNumber', 'password']);
  const password = String(fields.password ?? '');
  if (!PASSWORD_RULE.test(password)) {
    throw new HttpError(400, 'Please check the highlighted fields.', {
      password: 'Use at least 8 characters with a letter and a number',
    });
  }
  if (!fields.rollNumber) {
    throw new HttpError(400, 'Please check the highlighted fields.', { rollNumber: 'Roll number / USN is required' });
  }

  const user = await User.create({
    name: fields.name,
    email: fields.email,
    rollNumber: fields.rollNumber,
    role: 'student', // never taken from the request – nobody can sign up as staff
    passwordHash: await User.hashPassword(password),
    lastLoginAt: new Date(),
  });
  res.status(201).json({ token: signToken(user), user: user.toJSON() });
}

// GET /api/auth/me  – who is logged in (checks the token is still valid)
export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user || !user.active) throw new HttpError(401, 'Your session has ended. Please log in again.');
  res.json({ user });
}
