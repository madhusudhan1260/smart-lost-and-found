// Purpose: Account management for the super admin (/api/users).
// Used by: pages/AdminUsers.jsx
import { request } from './apiClient';

export const getUsers = () => request('/users');
export const createUser = (fields) => request('/users', { method: 'POST', body: fields });
export const updateUser = (id, changes) => request(`/users/${id}`, { method: 'PATCH', body: changes });
export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });
