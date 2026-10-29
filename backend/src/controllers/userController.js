// Handlers for /api/users  – super admin manages accounts
import User from '../models/User.js';
import { PASSWORD_RULE, ROLES } from '../config/constants.js';
import HttpError from '../utils/HttpError.js';
import { pick } from '../utils/pick.js';

// GET /api/users?role=doss  – newest first
export async function listUsers(req, res) {
  const filter = req.query.role ? { role: String(req.query.role) } : {};
  res.json(await User.find(filter).sort({ createdAt: -1 }));
}

// POST /api/users  { name, email, password, role, rollNumber? }
export async function createUser(req, res) {
  const fields = pick(req.body, ['name', 'email', 'password', 'role', 'rollNumber']);
  const details = {};
  if (!PASSWORD_RULE.test(String(fields.password ?? ''))) details.password = 'Use at least 8 characters with a letter and a number';
  if (!ROLES.includes(fields.role)) details.role = 'Choose a role';
  if (fields.role === 'student' && !fields.rollNumber) details.rollNumber = 'Roll number / USN is required for students';
  if (Object.keys(details).length) throw new HttpError(400, 'Please check the highlighted fields.', details);

  const user = await User.create({
    name: fields.name,
    email: fields.email,
    role: fields.role,
    rollNumber: fields.role === 'student' ? fields.rollNumber : undefined,
    passwordHash: await User.hashPassword(String(fields.password)),
  });
  res.status(201).json(user);
}

// PATCH /api/users/:id  { active?, role?, password? }
export async function updateUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found.');
  const changes = pick(req.body, ['active', 'role', 'password']);
  const isSelf = String(user._id) === req.user.id;

  // A super admin cannot lock themselves out
  if (isSelf && (changes.active === false || (changes.role && changes.role !== 'superadmin'))) {
    throw new HttpError(400, 'You cannot disable or demote your own account.');
  }
  if (changes.active !== undefined) user.active = Boolean(changes.active);
  if (changes.role !== undefined) {
    if (!ROLES.includes(changes.role)) throw new HttpError(400, 'Unknown role.');
    user.role = changes.role;
  }
  if (changes.password !== undefined) {
    if (!PASSWORD_RULE.test(String(changes.password))) {
      throw new HttpError(400, 'Please check the highlighted fields.', { password: 'Use at least 8 characters with a letter and a number' });
    }
    user.passwordHash = await User.hashPassword(String(changes.password));
  }
  await user.save();
  res.json(user);
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  if (req.params.id === req.user.id) throw new HttpError(400, 'You cannot delete your own account.');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new HttpError(404, 'User not found.');
  res.json({ message: `Deleted ${user.email}.`, id: String(user._id) });
}
