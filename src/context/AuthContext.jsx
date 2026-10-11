// Purpose: DOSS staff login state (JWT token + user) shared with the whole app.
// Used by: main.jsx, context/ModeContext.jsx, context/ItemContext.jsx, components/Navbar.jsx
//
// Students never log in. Only DOSS actions (reviewing claims, private details) need a token.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as authService from '../services/authService';
import useLocalStorage from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/constants';
import LoginDialog from '../components/LoginDialog';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken, removeToken] = useLocalStorage(STORAGE_KEYS.TOKEN, null);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(token)); // true while a saved token is verified
  const [loginOpen, setLoginOpen] = useState(false);
  const afterLoginRef = useRef(null); // what to do once the user has logged in

  // On page load: is the saved token still valid? (tokens expire after 8 hours)
  useEffect(() => {
    if (!token || user) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((data) => { if (!cancelled) setUser(data.user); })
      .catch(() => { if (!cancelled) removeToken(); }) // expired → forget it
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [token, user, removeToken]);

  const login = useCallback(
    async (email, password) => {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [setToken],
  );

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, [removeToken]);

  // Ask for a login, then run `onSuccess` (used when switching to DOSS mode)
  const requestLogin = useCallback((onSuccess) => {
    afterLoginRef.current = onSuccess;
    setLoginOpen(true);
  }, []);

  const handleLoggedIn = useCallback(() => {
    setLoginOpen(false);
    afterLoginRef.current?.();
    afterLoginRef.current = null;
  }, []);

  const value = useMemo(
    () => ({ user, isLoggedIn: Boolean(user), checking, login, logout, requestLogin }),
    [user, checking, login, logout, requestLogin],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginDialog isOpen={loginOpen} onLogin={login} onSuccess={handleLoggedIn} onCancel={() => setLoginOpen(false)} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth() must be used inside <AuthProvider>');
  return context;
}
