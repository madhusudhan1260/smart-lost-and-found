import { cx } from '../utils/helpers';

// Material Symbols icon (the font is bundled locally, so it works offline)
export default function Icon({ name, className, filled = false, label }) {
  return (
    <span
      className={cx('icon material-symbols-outlined', filled && 'icon--filled', className)}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  );
}
