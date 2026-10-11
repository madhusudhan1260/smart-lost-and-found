// User collection: DOSS staff accounts. Students do not need an account.
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PATTERNS } from '../config/constants.js';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: [true, 'Name is required'] },
    email: {
      type: String, trim: true, lowercase: true, unique: true, required: [true, 'Email is required'],
      match: [PATTERNS.email, 'Enter a valid email'],
    },
    // Only the bcrypt hash is stored – never the password itself. Hidden from queries by default.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['doss'], default: 'doss' },
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
