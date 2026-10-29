// Values the API validates against. Keep in sync with src/data/constants.js (frontend).

export const CATEGORIES = [
  'Electronics', 'Books', 'ID Cards', 'Wallets', 'Bags', 'Keys', 'Watches', 'Documents', 'Accessories', 'Other',
];

export const LOCATIONS = [
  'Main Block', 'Library', 'Cafeteria', 'Computer Lab', 'CSE Block', 'Auditorium', 'Sports Ground',
  'Parking Area', 'Hostel', 'Seminar Hall', 'Laboratory', 'Administration Block', 'DOSS Office',
];

export const ITEM_TYPES = ['lost', 'found'];

export const STATUS = {
  LOST: 'LOST',
  FOUND: 'FOUND',
  CLAIM_PENDING: 'CLAIM_PENDING',
  CLAIM_ACCEPTED: 'CLAIM_ACCEPTED',
  CLAIM_REJECTED: 'CLAIM_REJECTED',
  READY_FOR_COLLECTION: 'READY_FOR_COLLECTION',
  COLLECTED: 'COLLECTED',
  RESOLVED: 'RESOLVED',
};

export const ITEM_STATUSES = [
  STATUS.LOST, STATUS.FOUND, STATUS.CLAIM_PENDING, STATUS.READY_FOR_COLLECTION, STATUS.COLLECTED, STATUS.RESOLVED,
];

export const CLAIM_STATUSES = [
  STATUS.CLAIM_PENDING, STATUS.CLAIM_ACCEPTED, STATUS.CLAIM_REJECTED, STATUS.COLLECTED, STATUS.RESOLVED,
];

export const HANDED_TO = ['Handed over to DOSS Office', 'With the finder'];

// Regular expressions shared by the Mongoose schemas
export const PATTERNS = {
  itemName: /^[a-zA-Z0-9\s\-'&().,/+]+$/,
  personName: /^[a-zA-Z\s.]+$/,
  color: /^[a-zA-Z\s/-]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^(\+91)?[6-9]\d{9}$/,
  rollNumber: /^[A-Z0-9]{6,12}$/,
  isoDate: /^\d{4}-\d{2}-\d{2}$/,
  time: /^(|([01]\d|2[0-3]):[0-5]\d)$/,
  imageDataUrl: /^data:image\/(png|jpe?g|webp|gif);base64,/,
};

// Account roles. Staff roles can open the DOSS interface.
export const ROLES = ['student', 'doss', 'superadmin'];
export const STAFF_ROLES = ['doss', 'superadmin'];

// At least 8 characters with a letter and a number
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;
