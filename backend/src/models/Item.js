// Item collection: one document per lost or found report.
import mongoose from 'mongoose';
import { CATEGORIES, HANDED_TO, ITEM_STATUSES, ITEM_TYPES, LOCATIONS, PATTERNS } from '../config/constants.js';
import { daysBetween, isFutureDate, toISODate } from '../utils/dates.js';

const isContact = (value) =>
  typeof value === 'string' &&
  (PATTERNS.email.test(value.trim()) || PATTERNS.phone.test(value.replace(/[\s\-()]/g, '')));

const itemSchema = new mongoose.Schema(
  {
    // Readable IDs such as "LF-1001" instead of ObjectIds – easy to say out loud at the DOSS counter
    _id: { type: String },
    type: { type: String, enum: ITEM_TYPES, required: [true, 'Report type is required'] },
    name: {
      type: String, trim: true, required: [true, 'Item name is required'],
      minlength: [3, 'Item name must be at least 3 characters'], maxlength: [50, 'Item name must be under 50 characters'],
      match: [PATTERNS.itemName, 'Item name contains invalid characters'],
    },
    category: { type: String, enum: { values: CATEGORIES, message: 'Unknown category' }, required: [true, 'Category is required'] },
    color: {
      type: String, trim: true, required: [true, 'Colour is required'], maxlength: 30,
      match: [PATTERNS.color, 'Colour should contain letters only'],
    },
    description: {
      type: String, trim: true, required: [true, 'Description is required'],
      minlength: [10, 'Description is too short'], maxlength: [400, 'Description must be under 400 characters'],
    },
    location: { type: String, enum: { values: LOCATIONS, message: 'Unknown campus location' }, required: [true, 'Location is required'] },
    // Stored as "YYYY-MM-DD" text, exactly what the date input sends
    date: {
      type: String, required: [true, 'Date is required'],
      match: [PATTERNS.isoDate, 'Date must look like YYYY-MM-DD'],
      validate: [
        { validator: (value) => !isFutureDate(value), message: 'Date cannot be in the future' },
        { validator: (value) => daysBetween(value, toISODate()) <= 365, message: 'Date must be within the last year' },
      ],
    },
    time: { type: String, default: '', match: [PATTERNS.time, 'Enter a valid time (HH:MM)'] },
    // PRIVATE: never returned unless a query asks for it with .select('+privateDetails') (DOSS only)
    privateDetails: { type: String, trim: true, default: '', maxlength: 500, select: false },
    additionalInfo: { type: String, trim: true, default: '', maxlength: 500 },
    contactName: {
      type: String, trim: true, required: [true, 'Your name is required'],
      match: [PATTERNS.personName, 'Name should contain letters only'],
    },
    contact: {
      type: String, trim: true, required: [true, 'Contact information is required'],
      validate: { validator: isContact, message: 'Enter a valid email or 10-digit mobile number' },
    },
    image: {
      type: String, default: null,
      set: (value) => (value === '' ? null : value),
      validate: {
        validator: (value) => value === null || value === undefined || PATTERNS.imageDataUrl.test(value),
        message: 'Image must be a PNG, JPG, WEBP or GIF data URL',
      },
    },
    handedTo: { type: String, enum: HANDED_TO },
    status: { type: String, enum: ITEM_STATUSES, required: true },
    claimId: { type: String, ref: 'Claim', default: null },
    collectedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    versionKey: false,
    toJSON: {
      // Send "id" instead of MongoDB's "_id" so the React app keeps using item.id
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

// Indexes for the queries the app runs most often
itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ createdAt: -1 });

// Private details are required for LOST reports (the owner's proof), optional for FOUND ones
itemSchema.path('privateDetails').validate(function requireForLost(value) {
  return this.type !== 'lost' || (value && value.trim().length >= 10);
}, 'Add at least one private detail (10+ characters) so DOSS can verify the owner');

export default mongoose.model('Item', itemSchema);
