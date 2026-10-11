// File: src/context/ModeContext.jsx
// Purpose: Shared Student / DOSS mode (saved in localStorage).
// Used by: App.jsx, components/ItemCard.jsx, components/ItemsBrowser.jsx,
//          components/MatchCard.jsx, components/ModeGate.jsx, components/ModeSwitcher.jsx,
//          components/Navbar.jsx, main.jsx, pages/FoundItems.jsx, pages/Home.jsx,
//          pages/ItemDetails.jsx, pages/LostItems.jsx

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { MODES, STORAGE_KEYS } from '../data/constants';
import { useAuth } from './AuthContext';

// STUDENT / DOSS switch. Students need no account; DOSS mode needs a staff login.
const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useLocalStorage(STORAGE_KEYS.MODE, MODES.STUDENT);
  const { isLoggedIn, checking, requestLogin } = useAuth();

  // Logged out (or the token expired) while in DOSS mode → back to the student view
  useEffect(() => {
    if (!checking && !isLoggedIn && mode === MODES.DOSS) setMode(MODES.STUDENT);
  }, [checking, isLoggedIn, mode, setMode]);

  // Change mode; DOSS asks for a login first. `onDone` runs after the switch.
  const switchMode = useCallback(
    (nextMode, onDone) => {
      const apply = () => {
        setMode(nextMode);
        onDone?.();
      };
      if (nextMode === MODES.DOSS && !isLoggedIn) requestLogin(apply);
      else apply();
    },
    [isLoggedIn, requestLogin, setMode],
  );

  const isDoss = mode === MODES.DOSS && isLoggedIn;
  const value = useMemo(
    () => ({ mode: isDoss ? MODES.DOSS : MODES.STUDENT, switchMode, isDoss, isStudent: !isDoss }),
    [isDoss, switchMode],
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode() must be used inside <ModeProvider>');
  return context;
}
