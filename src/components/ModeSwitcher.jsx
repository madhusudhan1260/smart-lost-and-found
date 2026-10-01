// File: src/components/ModeSwitcher.jsx
// Purpose: The [ STUDENT ] [ DOSS ] toggle in the top bar.
// Used by: components/Navbar.jsx

import { useNavigate } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { useNotification } from '../context/NotificationContext';
import { MODES } from '../data/constants';
import { cx } from '../utils/helpers';
import Icon from './Icon';

const OPTIONS = [
  { value: MODES.STUDENT, label: 'Student', icon: 'school' },
  { value: MODES.DOSS, label: 'DOSS', icon: 'shield_person' },
];

// [ STUDENT ] [ DOSS ] – switches the interface. Not a login.
export default function ModeSwitcher({ onSwitch }) {
  const { mode, setMode } = useMode();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const handleSwitch = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    notify(`Switched to ${nextMode === MODES.DOSS ? 'DOSS' : 'Student'} mode`, 'info', 2000);
    navigate(nextMode === MODES.DOSS ? '/dashboard' : '/');
    onSwitch?.();
  };

  return (
    <div className="mode-switch" role="radiogroup" aria-label="Interface mode">
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mode === value}
          className={cx('mode-switch__option', mode === value && 'is-active')}
          onClick={() => handleSwitch(value)}
        >
          <Icon name={icon} />
          {label}
        </button>
      ))}
    </div>
  );
}
