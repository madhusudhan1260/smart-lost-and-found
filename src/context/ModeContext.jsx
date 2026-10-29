// File: src/context/ModeContext.jsx
// Purpose: Shared Student / DOSS mode (saved in localStorage).
// Used by: App.jsx, components/ItemCard.jsx, components/ItemsBrowser.jsx,
//          components/MatchCard.jsx, components/ModeGate.jsx, components/ModeSwitcher.jsx,
//          components/Navbar.jsx, main.jsx, pages/FoundItems.jsx, pages/Home.jsx,
//          pages/ItemDetails.jsx, pages/LostItems.jsx, pages/Login.jsx

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { MODES, STORAGE_KEYS } from '../data/constants';
import { useAuth } from './AuthContext';

// STUDENT / DOSS switch. Anyone can use the student view; the DOSS view needs a staff login.
const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useLocalStorage(STORAGE_KEYS.MODE, MODES.STUDENT);
  const { isStaff, checking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Logged out (or the token expired) while in DOSS mode → back to the student view
  useEffect(() => {
    if (!checking && !isStaff && mode === MODES.DOSS) setMode(MODES.STUDENT);
  }, [checking, isStaff, mode, setMode]);

  // Change mode. DOSS without a staff login → the login page (DOSS tab), which comes back here.
  // `onDone` runs after the switch.
  const switchMode = useCallback(
    (nextMode, onDone) => {
      if (nextMode === MODES.DOSS && !isStaff) {
        const next = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?role=doss&next=${next}`);
        return;
      }
      setMode(nextMode);
      onDone?.();
    },
    [isStaff, location.pathname, location.search, navigate, setMode],
  );

  // Used by the login page straight after a staff login (the check above has not re-rendered yet).
  // Safe: isDoss below is still false for non-staff accounts.
  const enterMode = useCallback((nextMode) => setMode(nextMode), [setMode]);

  const isDoss = mode === MODES.DOSS && isStaff;
  const value = useMemo(
    () => ({ mode: isDoss ? MODES.DOSS : MODES.STUDENT, switchMode, enterMode, isDoss, isStudent: !isDoss }),
    [isDoss, switchMode, enterMode],
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode() must be used inside <ModeProvider>');
  return context;
}
