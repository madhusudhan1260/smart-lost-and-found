import { useEffect } from 'react';

// Purpose: Material-style "ripple" when any .btn is pressed.
// One listener on the document (event delegation) instead of one per button.
export default function useRipple() {
  useEffect(() => {
    const handlePointerDown = (event) => {
      const button = event.target.closest?.('.btn');
      if (!button || button.disabled) return;

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);
}
