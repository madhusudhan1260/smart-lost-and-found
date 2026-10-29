// Turns every error into a consistent JSON response: { error: "message", details?: {...} }
import mongoose from 'mongoose';
import HttpError from '../utils/HttpError.js';

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Express recognises error handlers by their 4 parameters
export function errorHandler(error, _req, res, _next) {
  // Mongoose schema validation → 400 with one message per field
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(Object.entries(error.errors).map(([field, err]) => [field, err.message]));
    return res.status(400).json({ error: 'Please check the highlighted fields.', details });
  }
  // Duplicate unique key (e.g. same email twice)
  if (error.code === 11000) {
    if (error.keyValue?.email) {
      return res.status(409).json({ error: 'An account with this email already exists.', details: { email: 'This email is already registered' } });
    }
    return res.status(409).json({ error: 'That record already exists.' });
  }
  // Malformed JSON body
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request is too large – try a smaller photo.' });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message, ...(error.details ? { details: error.details } : {}) });
  }

  console.error('Unexpected error:', error);
  return res.status(500).json({ error: 'Something went wrong on the server.' });
}
