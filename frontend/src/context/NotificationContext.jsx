// File: src/context/NotificationContext.jsx
// Purpose: Shared notify() function for toast messages.
// Used by: components/claims/ClaimForm.jsx, components/items/ItemForm.jsx, components/layout/ModeSwitcher.jsx,
//          main.jsx, pages/doss/ClaimReview.jsx, pages/doss/DossDashboard.jsx, pages/public/ItemDetails.jsx,
//          pages/student/MyClaims.jsx

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Notification from '../components/ui/Notification';

// Toast messages ("Report saved!") that any page can trigger
const NotificationContext = createContext(null);

const MAX_TOASTS = 3; // older toasts make room so the screen never fills up

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const dismiss = useCallback((id) => {
    setNotifications((previous) => previous.filter((note) => note.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = `${Date.now()}-${Math.random()}`;
      // The toast removes itself when its countdown animation ends (see Notification.jsx),
      // so hovering over it pauses the countdown.
      setNotifications((previous) => [
        // the same message twice in a row (e.g. a double click) is shown once
        ...previous.filter((note) => note.message !== message),
        { id, message, type, duration },
      ].slice(-MAX_TOASTS));
    },
    [],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Notification notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification() must be used inside <NotificationProvider>');
  return context;
}
