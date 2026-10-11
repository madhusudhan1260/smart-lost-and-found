// Purpose: DOSS staff login calls (/api/auth). Students never need to log in.
// Used by: context/AuthContext.jsx
import { request } from './apiClient';

// Returns { token, user }
export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } });

// Returns { user } – fails with 401 when the saved token has expired
export const getCurrentUser = () => request('/auth/me');
