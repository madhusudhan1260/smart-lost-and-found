// Handlers for /api/auth  (DOSS staff login)
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import HttpError from '../utils/HttpError.js';

// POST /api/auth/login  { email, password }  →  { token, user }
export async function login(req, res) {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  if (!email || !password) throw new HttpError(400, 'Email and password are required.');

  // passwordHash is hidden by default, so ask for it explicitly
  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message for "no such user" and "wrong password" – does not reveal which emails exist
  if (!user || !(await user.checkPassword(password))) throw new HttpError(401, 'Incorrect email or password.');

  res.json({ token: signToken(user), user: user.toJSON() });
}

// GET /api/auth/me  – who is logged in (checks the token is still valid)
export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(401, 'Account no longer exists.');
  res.json({ user });
}
