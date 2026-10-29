import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPasswordStrength, validateAccount, validateLogin } from '../src/utils/authValidation.js';

test('validateLogin needs a valid email and a password', () => {
  assert.deepEqual(Object.keys(validateLogin({ email: '', password: '' })), ['email', 'password']);
  assert.ok(validateLogin({ email: 'not-an-email', password: 'x' }).email);
  assert.deepEqual(validateLogin({ email: 'doss@college.edu', password: 'Doss@123' }), {});
});

test('validateAccount checks every sign-up field', () => {
  const errors = validateAccount({ name: 'R2D2', email: 'bad', rollNumber: '12', password: 'short', confirmPassword: 'other' });
  assert.deepEqual(Object.keys(errors).sort(), ['confirmPassword', 'email', 'name', 'password', 'rollNumber']);

  const ok = { name: 'Priya Nair', email: 'priya@college.edu', rollNumber: '22-ECE-017', password: 'Priya2024' };
  assert.deepEqual(validateAccount({ ...ok, confirmPassword: 'Priya2024' }), {});
  assert.equal(validateAccount({ ...ok, confirmPassword: 'Priya2025' }).confirmPassword, 'Passwords do not match');
});

test('staff accounts do not need a roll number', () => {
  assert.deepEqual(validateAccount({ name: 'Anita Rao', email: 'anita@college.edu', password: 'Staff2024' }, { needsRoll: false }), {});
});

test('getPasswordStrength grows with length and variety', () => {
  assert.equal(getPasswordStrength('').score, 0);
  assert.ok(getPasswordStrength('abc').score <= 1);
  assert.ok(getPasswordStrength('Campus#Found2024').score >= 3);
});
