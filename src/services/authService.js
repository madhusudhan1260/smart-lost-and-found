// Purpose: Login, sign-up and session calls (/api/auth).
// Used by: context/AuthContext.jsx
import { request } from './apiClient';

// portal = the login tab used ('student' | 'doss' | 'superadmin'). Returns { token, user }
export const login = (email, password, portal) =>
  request('/auth/login', { method: 'POST', body: { email, password, portal } });

// Student sign-up. Returns { token, user }
export const register = (fields) => request('/auth/register', { method: 'POST', body: fields });

// Returns { user } – fails with 401 when the saved token has expired
export const getCurrentUser = () => request('/auth/me');
