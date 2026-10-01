// File: src/context/ModeContext.jsx
// Purpose: Shared Student / DOSS mode (saved in localStorage).
// Used by: App.jsx, components/ItemCard.jsx, components/ItemsBrowser.jsx,
//          components/MatchCard.jsx, components/ModeGate.jsx, components/ModeSwitcher.jsx,
//          components/Navbar.jsx, main.jsx, pages/FoundItems.jsx, pages/Home.jsx,
//          pages/ItemDetails.jsx, pages/LostItems.jsx

import { createContext, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { MODES, STORAGE_KEYS } from '../data/constants';

// STUDENT / DOSS switch. This is NOT a login – just two views of the same data.
const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useLocalStorage(STORAGE_KEYS.MODE, MODES.STUDENT);

  const value = useMemo(
    () => ({ mode, setMode, isDoss: mode === MODES.DOSS, isStudent: mode === MODES.STUDENT }),
    [mode, setMode],
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode() must be used inside <ModeProvider>');
  return context;
}
