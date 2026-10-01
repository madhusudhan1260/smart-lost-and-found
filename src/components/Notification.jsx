// File: src/components/Notification.jsx
// Purpose: Toast (snackbar) messages shown at the bottom of the screen.
// Used by: context/NotificationContext.jsx

import Icon from './Icon';

const ICONS = { success: 'check_circle', error: 'error', info: 'info' };

// Stack of toast messages at the bottom of the screen
export default function Notification({ notifications, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {notifications.map(({ id, message, type }) => (
        <div key={id} className={`toast toast--${type}`} role={type === 'error' ? 'alert' : 'status'}>
          <Icon name={ICONS[type] ?? ICONS.info} className="toast__icon" filled />
          <p className="toast__message">{message}</p>
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => onDismiss(id)} aria-label="Dismiss notification">
            <Icon name="close" />
          </button>
        </div>
      ))}
    </div>
  );
}
