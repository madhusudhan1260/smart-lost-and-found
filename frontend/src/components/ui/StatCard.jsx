// File: src/components/ui/StatCard.jsx
// Purpose: Statistic tile with an animated count-up number.
// Used by: pages/doss/DossDashboard.jsx, pages/public/Home.jsx, pages/student/StudentDashboard.jsx

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

// Animates a number up (or down) to `target` – the "count-up" effect.
// It starts from the value already on screen, so a data refresh does not reset it to 0.
function useCountUp(target, duration = 800) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const [value, setValue] = useState(0);
  const shownRef = useRef(0); // the number currently on screen

  useEffect(() => {
    if (prefersReducedMotion) return;

    let frameId;
    const start = performance.now();
    const from = shownRef.current;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out curve
      shownRef.current = Math.round(from + (target - from) * eased);
      setValue(shownRef.current);
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
        {/* screen readers get the final number, not every step of the animation */}
        <span className="stat-card__value" aria-hidden="true">{displayValue}</span>
        <span className="sr-only">{value}</span>
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
