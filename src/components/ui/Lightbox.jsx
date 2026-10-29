// Purpose: Full-screen photo viewer. Closes with Escape, the X button or a click outside.
// Used by: pages/ItemDetails.jsx

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handleKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close photo">
        <Icon name="close" />
      </button>
      <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
    </div>,
    document.body,
  );
}
