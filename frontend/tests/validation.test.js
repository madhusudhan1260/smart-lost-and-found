// Unit test suite for form validation utilities
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateField,
  validateClaimField,
  validateItemForm,
  validateClaimForm,
  validateImageFile,
  isFormValid,
} from '../src/utils/validation.js';

test('validateField validates item name properly', () => {
  assert.equal(validateField('name', ''), 'Item name is required');
  assert.equal(validateField('name', 'AB'), 'Item name must be at least 3 characters');
  assert.equal(validateField('name', 'A'.repeat(51)), 'Item name must be under 50 characters');
  assert.equal(validateField('name', 'Valid Laptop Charger'), '');
  assert.equal(validateField('name', 'Invalid <script> Name'), 'Item name contains invalid characters');
});

test('validateField validates description length and presence', () => {
  assert.equal(validateField('description', ''), 'Description is required');
  assert.equal(validateField('description', 'Short'), 'Description is too short (5/10 characters)');
  assert.equal(validateField('description', 'A'.repeat(401)), 'Description must be under 400 characters');
  assert.equal(validateField('description', 'This is a sufficiently long valid item description.'), '');
});

test('validateField validates category and location', () => {
  assert.equal(validateField('category', ''), 'Please choose a category');
  assert.equal(validateField('category', 'Electronics'), '');
  assert.equal(validateField('location', ''), 'Please choose a location');
  assert.equal(validateField('location', 'Library'), '');
});

test('validateField validates contacts (email and Indian mobile numbers)', () => {
  assert.equal(validateField('contact', ''), 'Contact information is required');
  assert.equal(validateField('contact', 'invalid-contact'), 'Enter a valid email or 10-digit mobile number');
  assert.equal(validateField('contact', 'student@college.edu'), '');
  assert.equal(validateField('contact', '9876543210'), '');
  assert.equal(validateField('contact', '+91 9876543210'), '');
  assert.equal(validateField('contact', '(987) 654-3210'), '');
});

test('validateField enforces private details on lost items, optional on found', () => {
  assert.equal(validateField('privateDetails', '', 'lost'), 'Add at least one private detail so DOSS can verify the owner');
  assert.equal(validateField('privateDetails', 'Too short', 'lost'), 'Private details is too short (9/10 characters)');
  assert.equal(validateField('privateDetails', 'Sticker of a dragon on the back cover', 'lost'), '');
  assert.equal(validateField('privateDetails', '', 'found'), '');
});

test('validateClaimField validates claim reasons and unique features', () => {
  assert.equal(validateClaimField('reason', ''), 'Please explain why this item belongs to you');
  assert.equal(validateClaimField('reason', 'Short reason'), 'Explanation is too short (12/20 characters)');
  assert.equal(validateClaimField('reason', 'This belongs to me because I purchased it last semester and forgot it.'), '');

  assert.equal(validateClaimField('uniqueFeature', ''), 'Describe a unique feature – this is how DOSS verifies ownership');
  assert.equal(validateClaimField('uniqueFeature', 'Scratch'), 'Unique feature is too short (7/10 characters)');
  assert.equal(validateClaimField('uniqueFeature', 'Three small scratches on the lower edge'), '');
});

test('validateClaimField handles roll numbers with delimiters', () => {
  assert.equal(validateClaimField('rollNumber', ''), 'Roll number / USN is required');
  assert.equal(validateClaimField('rollNumber', '123'), 'Use 6–12 letters and digits, e.g. 22CSE045');
  assert.equal(validateClaimField('rollNumber', '22CSE045'), '');
  assert.equal(validateClaimField('rollNumber', '22-CSE-045'), '');
  assert.equal(validateClaimField('rollNumber', '1RV 22 CS 045'), '');
});

test('validateClaimField checks loss date relative to found date', () => {
  assert.equal(validateClaimField('lostDate', ''), 'Date lost is required');
  assert.equal(validateClaimField('lostDate', '2099-01-01'), 'Date lost cannot be in the future');
  // Lost 3 days after it was found is invalid
  const error = validateClaimField('lostDate', '2026-03-15', { foundDate: '2026-03-10' });
  assert.ok(error.includes('must have been lost before that'));
  // Lost before it was found is valid
  assert.equal(validateClaimField('lostDate', '2026-03-08', { foundDate: '2026-03-10' }), '');
});

test('validateImageFile checks file type and size limit', () => {
  assert.equal(validateImageFile(null), '');
  assert.equal(validateImageFile({ size: 0, type: 'image/png' }), 'Selected image file is empty');
  assert.equal(validateImageFile({ size: 1024, type: 'application/pdf' }), 'Only PNG, JPG, WEBP or GIF images are allowed');
  assert.equal(validateImageFile({ size: 6 * 1024 * 1024, type: 'image/jpeg' }), 'Image must be smaller than 5 MB');
  assert.equal(validateImageFile({ size: 1024 * 1024, type: 'image/png' }), '');
});

test('isFormValid detects presence of any error messages', () => {
  assert.equal(isFormValid({}), true);
  assert.equal(isFormValid({ name: '', description: '' }), true);
  assert.equal(isFormValid({ name: 'Error message', description: '' }), false);
});

test('validateItemForm validates all fields of an item report', () => {
  const errors = validateItemForm({ name: '', description: '', category: '' }, 'lost');
  assert.ok(errors.name);
  assert.ok(errors.description);
  assert.ok(errors.category);
});

test('validateClaimForm validates all fields of a claim', () => {
  const errors = validateClaimForm({ claimantName: '', reason: '', uniqueFeature: '' });
  assert.ok(errors.claimantName);
  assert.ok(errors.reason);
  assert.ok(errors.uniqueFeature);
});
