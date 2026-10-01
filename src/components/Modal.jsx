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

  useEffect(() => {
    if (!isOpen) return undefined;

    confirmButtonRef.current?.focus(); // keyboard users land on the main action
    const handleKey = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden'; // stop the page scrolling behind the modal

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, busy, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
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
          >
            {busy ? 'Please wait…' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
