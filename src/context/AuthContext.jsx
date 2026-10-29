// Purpose: Login state (JWT token + user) shared with the whole app.
// Used by: main.jsx, context/ModeContext.jsx, context/ItemContext.jsx, components/layout/Navbar.jsx,
//          pages/auth/Login.jsx, pages/admin/AdminUsers.jsx, components/claims/ClaimForm.jsx
//
// Three kinds of account: student, DOSS staff and super admin (see pages/auth/Login.jsx).
// Browsing, reporting and claiming still work without logging in.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import useLocalStorage from '../hooks/useLocalStorage';
import { ROLES, STAFF_ROLES, STORAGE_KEYS } from '../data/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken, removeToken] = useLocalStorage(STORAGE_KEYS.TOKEN, null);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(token && !user)); // true while a saved token is verified

  // On page load: is the saved token still valid? (tokens expire after 8 hours)
  useEffect(() => {
    if (!token || user) return;
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((data) => { if (!cancelled) setUser(data.user); })
      .catch(() => { if (!cancelled) removeToken(); }) // expired → forget it
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [token, user, removeToken]);

  const startSession = useCallback(
    (data) => {
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [setToken],
  );

  const login = useCallback(
    async (email, password, portal) => startSession(await authService.login(email, password, portal)),
    [startSession],
  );

  const register = useCallback(async (fields) => startSession(await authService.register(fields)), [startSession]);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, [removeToken]);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isStaff: STAFF_ROLES.includes(user?.role),
      isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
      isStudentAccount: user?.role === ROLES.STUDENT,
      checking,
      login,
      register,
      logout,
    }),
    [user, checking, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth() must be used inside <AuthProvider>');
  return context;
}
