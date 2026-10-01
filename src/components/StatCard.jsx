// File: src/components/StatCard.jsx
// Purpose: Statistic tile with an animated count-up number.
// Used by: pages/DossDashboard.jsx, pages/Home.jsx, pages/StudentDashboard.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

// Animates a number from 0 up to `target` (the "count-up" effect)
function useCountUp(target, duration = 800) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let frameId;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out curve
      setValue(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, prefersReducedMotion]);

  return prefersReducedMotion ? target : value;
}

// tone: blue | red | yellow | green | grey
export default function StatCard({ label, value, icon, tone = 'blue', hint, to }) {
  const displayValue = useCountUp(value);

  const content = (
    <>
      <span className="stat-card__icon"><Icon name={icon} /></span>
      <span className="stat-card__text">
        <span className="stat-card__value">{displayValue}</span>
        <span className="stat-card__label">{label}</span>
        {hint && <span className="stat-card__hint">{hint}</span>}
      </span>
    </>
  );

  // Conditional rendering: clickable card only when a link is given
  return to ? (
    <Link to={to} className={`stat-card stat-card--${tone} stat-card--link`}>{content}</Link>
  ) : (
    <div className={`stat-card stat-card--${tone}`}>{content}</div>
  );
}
