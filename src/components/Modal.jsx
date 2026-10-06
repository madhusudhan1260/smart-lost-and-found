// File: src/components/Modal.jsx
// Purpose: Confirmation dialog (Escape / backdrop to close) rendered with a portal.
// Used by: components/ClaimCard.jsx, pages/ClaimReview.jsx, pages/DossDashboard.jsx,
//          pages/ItemDetails.jsx

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Confirmation dialog. Closes with Escape or by clicking the dark backdrop.
export default function Modal({
  isOpen,
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'primary',
  busy = false,
  hideCancel = false,
  confirmDisabled = false,
}) {
  const confirmButtonRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    confirmButtonRef.current?.focus(); // keyboard users land on the main action
    const previouslyFocused = document.activeElement; // give focus back when the dialog closes
    const handleKey = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();

      // Focus trap: Tab / Shift+Tab cycle inside the dialog instead of the page behind it
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button:not(:disabled), textarea, input, select, a[href]');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden'; // stop the page scrolling behind the modal

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [isOpen, busy, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title" className="modal__title">{title}</h2>
        <div className="modal__body">{children}</div>
        <div className="modal__actions">
          {!hideCancel && (
            <button type="button" className="btn btn--text" onClick={onCancel} disabled={busy}>
              {cancelText}
            </button>
          )}
          <button
            ref={confirmButtonRef}
            type="button"
            className={`btn btn--${tone}`}
            onClick={onConfirm}
            disabled={busy || confirmDisabled}
            aria-busy={busy}
          >
            {busy ? 'Please wait…' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
