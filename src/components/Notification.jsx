// File: src/components/Notification.jsx
// Purpose: Toast (snackbar) messages shown at the bottom of the screen.
// Used by: context/NotificationContext.jsx

import Icon from './Icon';

const ICONS = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };

// Stack of toast messages at the bottom of the screen
export default function Notification({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {notifications.map(({ id, message, type, duration = 3500 }) => (
        <div key={id} className={`toast toast--${type}`} role={type === 'error' ? 'alert' : 'status'}
          style={{ '--toast-duration': `${duration}ms` }}>
          <Icon name={ICONS[type] ?? ICONS.info} className="toast__icon" filled />
          <p className="toast__message">{message}</p>
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => onDismiss(id)} aria-label="Dismiss notification">
            <Icon name="close" />
          </button>
          <span className="toast__timer" aria-hidden="true" onAnimationEnd={() => onDismiss(id)} />
        </div>
      ))}
    </div>
  );
}
