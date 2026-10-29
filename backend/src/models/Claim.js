// Claim collection: a student's request to take a FOUND item, with proof of ownership.
import mongoose from 'mongoose';
import { CLAIM_STATUSES, LOCATIONS, PATTERNS } from '../config/constants.js';
import { isFutureDate } from '../utils/dates.js';

const isContact = (value) =>
  typeof value === 'string' &&
  (PATTERNS.email.test(value.trim()) || PATTERNS.phone.test(value.replace(/[\s\-()]/g, '')));

const claimSchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "CL-3001"
    // References to the Item collection (string ids) – can be filled in with .populate()
    itemId: { type: String, ref: 'Item', required: [true, 'Item is required'] },
    lostItemId: { type: String, ref: 'Item', default: null },
    status: { type: String, enum: CLAIM_STATUSES, required: true },
    claimantName: {
      type: String, trim: true, required: [true, 'Your name is required'],
      match: [PATTERNS.personName, 'Name should contain letters only'],
    },
    rollNumber: {
      type: String, trim: true, uppercase: true, required: [true, 'Roll number / USN is required'],
      set: (v) => (typeof v === 'string' ? v.replace(/[\s\-_/]/g, '').toUpperCase() : v),
      match: [PATTERNS.rollNumber, 'Use 6–12 letters and digits, e.g. 22CSE045'],
    },
    contact: {
      type: String, trim: true, required: [true, 'Contact information is required'],
      validate: { validator: isContact, message: 'Enter a valid email or 10-digit mobile number' },
    },
    reason: {
      type: String, trim: true, required: [true, 'Please explain why this item belongs to you'],
      minlength: [20, 'Explanation is too short (20+ characters)'], maxlength: [500, 'Explanation must be under 500 characters'],
    },
    uniqueFeature: {
      type: String, trim: true, required: [true, 'Describe a unique feature'],
      minlength: [10, 'Unique feature is too short (10+ characters)'], maxlength: [300, 'Unique feature must be under 300 characters'],
    },
    lostLocation: { type: String, enum: { values: LOCATIONS, message: 'Unknown campus location' }, required: [true, 'Tell us where you lost it'] },
    lostDate: {
      type: String, required: [true, 'Date lost is required'],
      match: [PATTERNS.isoDate, 'Date must look like YYYY-MM-DD'],
      validate: { validator: (value) => !isFutureDate(value), message: 'Date lost cannot be in the future' },
    },
    additionalProof: { type: String, trim: true, default: '', maxlength: 500 },
    reviewNote: { type: String, trim: true, default: '', maxlength: 500 },
    reviewedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    collectedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

claimSchema.index({ status: 1, createdAt: -1 });
claimSchema.index({ itemId: 1 });

// Fields anyone may see. Personal details (name, roll number, contact, answers) are DOSS-only.
export const PUBLIC_CLAIM_FIELDS =
  'itemId lostItemId status reviewNote createdAt updatedAt reviewedAt acceptedAt collectedAt resolvedAt';

export default mongoose.model('Claim', claimSchema);
