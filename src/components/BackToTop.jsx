// Purpose: Floating button that appears after scrolling down and jumps back to the top.
// Used by: App.jsx

import { useEffect, useState } from 'react';
import { cx } from '../utils/helpers';
import Icon from './Icon';

const SHOW_AFTER_PX = 600;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button type="button" className={cx('back-to-top', visible && 'is-visible')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top" tabIndex={visible ? 0 : -1}>
      <Icon name="arrow_upward" />
    </button>
  );
}
