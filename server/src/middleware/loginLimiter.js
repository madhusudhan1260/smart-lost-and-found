// Slows down password guessing: after 5 failed logins for the same email
// from the same IP, further attempts are blocked for 15 minutes.
// Kept in memory – enough for one server; a bigger deployment would use Redis.
import HttpError from '../utils/HttpError.js';

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map(); // "ip|email" → { count, firstAt }

const keyFor = (req) => `${req.ip}|${String(req.body?.email ?? '').trim().toLowerCase()}`;

export function loginLimiter(req, _res, next) {
  const entry = failures.get(keyFor(req));
  if (entry && Date.now() - entry.firstAt > WINDOW_MS) failures.delete(keyFor(req));
  else if (entry && entry.count >= MAX_FAILURES) {
    const minutes = Math.ceil((entry.firstAt + WINDOW_MS - Date.now()) / 60000);
    return next(new HttpError(429, `Too many failed attempts. Try again in ${minutes} minute(s).`));
  }
  next();
}

export function recordFailure(req) {
  const key = keyFor(req);
  const entry = failures.get(key) ?? { count: 0, firstAt: Date.now() };
  entry.count += 1;
  failures.set(key, entry);
}

export const clearFailures = (req) => failures.delete(keyFor(req));
