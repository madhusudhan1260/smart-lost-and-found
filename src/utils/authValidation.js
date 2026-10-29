// File: src/utils/authValidation.js
// Used by: pages/Login.jsx, pages/AdminUsers.jsx
// Checks for the login, sign-up and "add staff" forms. Same rules as the API.
import { PATTERNS } from './validation.js';

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/; // 8+ characters, a letter and a number

// 0–4 score for the strength meter under the password box
export function getPasswordStrength(password = '') {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  if (!PASSWORD_RULE.test(password)) score = Math.min(score, 1); // too weak to be accepted
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] };
}

// Returns { field: 'message' } for every problem ({} when everything is fine)
export function validateLogin({ email = '', password = '' }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Enter your email';
  else if (!PATTERNS.email.test(email.trim())) errors.email = 'Enter a valid email, e.g. name@college.edu';
  if (!password) errors.password = 'Enter your password';
  return errors;
}

// Student sign-up (also used for new accounts made by the super admin)
export function validateAccount({ name = '', email = '', rollNumber = '', password = '', confirmPassword }, { needsRoll = true } = {}) {
  const errors = {};
  const cleanName = name.trim();
  if (!cleanName) errors.name = 'Enter your full name';
  else if (cleanName.length < 2 || !PATTERNS.personName.test(cleanName)) errors.name = 'Name should contain letters only';

  if (!email.trim()) errors.email = 'Enter your email';
  else if (!PATTERNS.email.test(email.trim())) errors.email = 'Enter a valid email, e.g. name@college.edu';

  if (needsRoll) {
    const roll = rollNumber.replace(/[\s\-_/]/g, '');
    if (!roll) errors.rollNumber = 'Enter your roll number / USN';
    else if (!PATTERNS.rollNumber.test(roll)) errors.rollNumber = 'Use 6–12 letters and digits, e.g. 22CSE045';
  }

  if (!password) errors.password = 'Choose a password';
  else if (!PASSWORD_RULE.test(password)) errors.password = 'Use at least 8 characters with a letter and a number';

  if (confirmPassword !== undefined && password && confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
}
