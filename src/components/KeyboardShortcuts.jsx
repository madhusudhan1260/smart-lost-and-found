// Purpose: Global keyboard shortcuts and the "?" help dialog that lists them.
// Used by: App.jsx

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

// Single-key shortcuts → route to open
const ROUTE_KEYS = { h: '/', l: '/lost', f: '/found', m: '/smart-match', d: '/dashboard' };

const HELP = [
  ['/', 'Focus the search box'],
  ['Esc', 'Clear search · close dialogs'],
  ['h', 'Home'],
  ['l', 'Lost items'],
  ['f', 'Found items'],
  ['m', 'Smart Match'],
  ['d', 'Dashboard'],
  ['?', 'Show this help'],
];

const isTyping = () => ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

export default function KeyboardShortcuts() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleKey = (event) => {
      if (isTyping() || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === '?') {
        setOpen(true);
      } else if (ROUTE_KEYS[event.key] && !document.querySelector('.modal')) {
        navigate(ROUTE_KEYS[event.key]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  return (
    <Modal isOpen={open} title="Keyboard shortcuts" confirmText="Got it" hideCancel onConfirm={close} onCancel={close}>
      <dl className="shortcuts">
        {HELP.map(([key, label]) => (
          <div key={key}>
            <dt><kbd>{key}</kbd></dt>
            <dd>{label}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
