import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Notification from '../components/Notification';

// Toast messages ("Report saved!") that any page can trigger
const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const dismiss = useCallback((id) => {
    setNotifications((previous) => previous.filter((note) => note.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((previous) => [...previous, { id, message, type }]);
      setTimeout(() => dismiss(id), duration); // auto-hide
    },
    [dismiss],
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
