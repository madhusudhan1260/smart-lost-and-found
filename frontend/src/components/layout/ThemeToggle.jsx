// File: src/components/layout/ThemeToggle.jsx
// Purpose: Navbar button that cycles the theme: device setting → light → dark.
// Used by: components/layout/Navbar.jsx

import Icon from '../ui/Icon';

const CYCLE = ['system', 'light', 'dark'];
const META = {
  system: { icon: 'brightness_auto', label: 'Device theme' },
  light: { icon: 'light_mode', label: 'Light theme' },
  dark: { icon: 'dark_mode', label: 'Dark theme' },
};

export default function ThemeToggle({ preference, onChange }) {
  const next = CYCLE[(CYCLE.indexOf(preference) + 1) % CYCLE.length];
  const { icon, label } = META[preference] ?? META.system;
  return (
    <button type="button" className="icon-btn theme-toggle" onClick={() => onChange(next)}
      aria-label={`${label}. Switch to ${META[next].label.toLowerCase()}`} title={`${label} – click for ${META[next].label.toLowerCase()}`}>
      <Icon name={icon} />
    </button>
  );
}
