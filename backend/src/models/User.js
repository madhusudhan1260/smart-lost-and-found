// User collection: every account that can log in.
//   student    – optional account; pre-fills claim forms and keeps claims together
//   doss       – DOSS office staff: review claims, see private details
//   superadmin – everything DOSS can do, plus managing staff accounts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PATTERNS, ROLES } from '../config/constants.js';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, trim: true, required: [true, 'Name is required'],
      minlength: [2, 'Name is too short'], maxlength: [60, 'Name is too long'],
      match: [PATTERNS.personName, 'Name should contain letters only'],
    },
    email: {
      type: String, trim: true, lowercase: true, unique: true, required: [true, 'Email is required'],
      match: [PATTERNS.email, 'Enter a valid email'],
    },
    // Only the bcrypt hash is stored – never the password itself. Hidden from queries by default.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'student' },
    // Students only, e.g. "22CSE045"
    rollNumber: {
      type: String, trim: true, default: undefined,
      set: (v) => (typeof v === 'string' && v ? v.replace(/[\s\-_/]/g, '').toUpperCase() : undefined),
      match: [PATTERNS.rollNumber, 'Use 6–12 letters and digits, e.g. 22CSE045'],
    },
    active: { type: Boolean, default: true }, // a super admin can disable an account
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

userSchema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model('User', userSchema);
