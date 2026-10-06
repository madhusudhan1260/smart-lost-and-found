// File: src/utils/validation.js
// Used by: components/ClaimForm.jsx, components/ImageUploader.jsx, components/ItemForm.jsx
// Form validation for the report forms and the claim form.
import { daysBetween, formatDate, isFutureDate, toISODate } from './dateUtils';

// REGULAR EXPRESSIONS
export const PATTERNS = {
  itemName: /^[a-zA-Z0-9\s\-'&().,/+]+$/, // letters, numbers and common punctuation
  personName: /^[a-zA-Z\s.]+$/, // "Rahul K. Sharma"
  color: /^[a-zA-Z\s/-]+$/, // "Dark Blue", "Black/Red"
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, // something@domain.xx
  phone: /^(\+91)?[6-9]\d{9}$/, // Indian mobile, optional +91
  rollNumber: /^[A-Z0-9]{6,12}$/i, // e.g. 22CSE045 or 1RV22CS045
  time: /^([01]\d|2[0-3]):[0-5]\d$/, // 24-hour HH:MM
  imageType: /^image\/(png|jpe?g|webp|gif)$/,
};

export const MAX_IMAGE_SIZE_MB = 5;

// Reusable small rules (each returns '' when valid)
const required = (text, message) => (text ? '' : message);

const minLength = (text, length, label) =>
  text.length < length ? `${label} is too short (${text.length}/${length} characters)` : '';

function validateContact(text) {
  const str = String(text ?? '').trim();
  if (!str) return 'Contact information is required';
  const isEmail = PATTERNS.email.test(str);
  const isPhone = PATTERNS.phone.test(str.replace(/[\s\-()]/g, ''));
  return isEmail || isPhone ? '' : 'Enter a valid email or 10-digit mobile number';
}

function validatePastDate(text, label = 'Date') {
  if (!text) return `${label} is required`;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return `${label} is not a valid date`;
  if (isFutureDate(text)) return `${label} cannot be in the future`;
  if (daysBetween(text, toISODate()) > 365) return `${label} must be within the last year`;
  return '';
}

/**
 * Validate ONE field of the Report Lost / Report Found form.
 * `type` matters for privateDetails: required for lost reports, optional for found ones.
 */
export function validateField(name, value = '', type = 'lost') {
  const text = typeof value === 'string' ? value.trim() : (value != null ? String(value).trim() : '');

  switch (name) {
    case 'name':
      if (!text) return 'Item name is required';
      if (text.length < 3) return 'Item name must be at least 3 characters';
      if (text.length > 50) return 'Item name must be under 50 characters';
      return PATTERNS.itemName.test(text) ? '' : 'Item name contains invalid characters';

    case 'category':
      return required(text, 'Please choose a category');

    case 'description':
      if (!text) return 'Description is required';
      if (text.length > 400) return 'Description must be under 400 characters';
      return minLength(text, 10, 'Description');

    case 'color':
      if (!text) return 'Colour is required';
      return PATTERNS.color.test(text) ? '' : 'Colour should contain letters only';

    case 'location':
      return required(text, 'Please choose a location');

    case 'date': {
      const label = type === 'found' ? 'Date found' : 'Date lost';
      return validatePastDate(text, label);
    }

    case 'time':
      return !text || PATTERNS.time.test(text) ? '' : 'Enter a valid time (HH:MM)';

    case 'contactName':
      if (!text) return 'Your name is required';
      return PATTERNS.personName.test(text) ? '' : 'Name should contain letters only';

    case 'contact':
      return validateContact(text);

    case 'privateDetails':
      if (!text) {
        return type === 'lost' ? 'Add at least one private detail so DOSS can verify the owner' : '';
      }
      return minLength(text, 10, 'Private details');

    default:
      return ''; // optional fields such as additionalInfo / handedTo
  }
}

// Validate every field → { fieldName: 'error message' }
export function validateItemForm(values, type = 'lost') {
  const errors = {};
  for (const field of Object.keys(values)) {
    const message = validateField(field, values[field], type);
    if (message) errors[field] = message;
  }
  return errors;
}

/**
 * Validate ONE field of the claim form.
 * `foundDate` is the date the item was found – you cannot lose something after it was found.
 */
export function validateClaimField(name, value = '', { foundDate } = {}) {
  const text = typeof value === 'string' ? value.trim() : value;

  switch (name) {
    case 'claimantName':
      if (!text) return 'Your name is required';
      return PATTERNS.personName.test(text) ? '' : 'Name should contain letters only';

    case 'rollNumber':
      if (!text) return 'Roll number / USN is required';
      return PATTERNS.rollNumber.test(text.replace(/[\s\-_/]/g, '')) ? '' : 'Use 6–12 letters and digits, e.g. 22CSE045';

    case 'contact':
      return validateContact(text);

    case 'reason':
      if (!text) return 'Please explain why this item belongs to you';
      if (text.length > 500) return 'Explanation must be under 500 characters';
      return minLength(text, 20, 'Explanation');

    case 'uniqueFeature':
      if (!text) return 'Describe a unique feature – this is how DOSS verifies ownership';
      if (text.length > 300) return 'Unique feature must be under 300 characters';
      return minLength(text, 10, 'Unique feature');

    case 'lostLocation':
      return required(text, 'Tell us where you lost it');

    case 'lostDate': {
      const dateError = validatePastDate(text, 'Date lost');
      if (dateError) return dateError;
      // Date comparison: losing it more than a day AFTER it was found makes no sense
      if (foundDate && daysBetween(foundDate, text) > 1) {
        return `This item was found on ${formatDate(foundDate)} – it must have been lost before that`;
      }
      return '';
    }

    case 'additionalProof':
      return text && text.length > 500 ? 'Additional proof must be under 500 characters' : '';

    default:
      return ''; // lostItemId is optional
  }
}

export function validateClaimForm(values, context) {
  const errors = {};
  for (const field of Object.keys(values)) {
    const message = validateClaimField(field, values[field], context);
    if (message) errors[field] = message;
  }
  return errors;
}

// every() → true only if no field has an error message
export const isFormValid = (errors) => {
  if (!errors || typeof errors !== 'object') return true;
  return Object.values(errors).every((message) => !message);
};

export function validateImageFile(file) {
  if (!file) return '';
  if (file.size === 0) return 'Selected image file is empty';
  if (!PATTERNS.imageType.test(file.type)) return 'Only PNG, JPG, WEBP or GIF images are allowed';
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB`;
  }
  return '';
}
