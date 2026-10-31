// Purpose: Floating button that appears after scrolling down and jumps back to the top.
// Used by: App.jsx

import { useEffect, useState } from 'react';
import { cx } from '../../utils/helpers';
import Icon from '../ui/Icon';

const SHOW_AFTER_PX = 600;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100 % of the page scrolled

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button type="button" className={cx('back-to-top', visible && 'is-visible')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={`Back to top (${progress}% scrolled)`} tabIndex={visible ? 0 : -1}
      style={{ '--progress': `${progress}%` }}>
      <Icon name="arrow_upward" />
    </button>
  );
}
