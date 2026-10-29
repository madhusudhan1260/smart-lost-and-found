// Purpose : One place that talks HTTP to the Express API.
// Every service function goes through request(), which adds the JSON headers and the
// DOSS login token, and turns API errors into normal JavaScript Errors.
import { STORAGE_KEYS } from '../data/constants';
import { readFromStorage } from '../utils/storage';

// In development Vite forwards /api to the Express server (see vite.config.js).
// In production set VITE_API_URL, e.g. https://lost-found-api.onrender.com/api
const API_URL = import.meta.env.VITE_API_URL || '/api';

// An Error that also remembers the HTTP status and the per-field messages from the server
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details; // e.g. { name: 'Item name is required' }
  }
}

// Fired when the server rejects a saved token (expired after 8 hours, or the account was
// disabled). AuthContext listens for it, signs the user out and explains why.
export const SESSION_EXPIRED_EVENT = 'lf:session-expired';
const isSignInCall = (path) => path.startsWith('/auth/login') || path.startsWith('/auth/register');

export async function request(path, { method = 'GET', body } = {}) {
  const token = readFromStorage(STORAGE_KEYS.TOKEN);
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch only rejects when the network request itself failss
    throw new ApiError('Cannot reach the server. Is the API running? (npm run dev starts both)', 0);
  }

  const data = await response.json().catch(() => null);
  // 502/503/504 without a JSON body = the dev proxy could not reach the API
  if (!data && response.status >= 502) {
    throw new ApiError('Cannot reach the server. Is the API running? (npm run dev starts both)', response.status);
  }
  if (response.status === 401 && token && !isSignInCall(path)) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  if (!response.ok) {
    throw new ApiError(data?.error ?? `Request failed (HTTP ${response.status})`, response.status, data?.details);
  }
  return data;
}
