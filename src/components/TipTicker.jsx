// File: src/components/TipTicker.jsx
// Purpose: Rotating campus tips loaded with fetch() and setInterval().
// Used by: pages/Home.jsx

import { useEffect, useState } from 'react';
import { getCampusTips } from '../services/itemService';
import Icon from './Icon';

const FALLBACK_TIPS = [{ icon: 'lightbulb', text: 'Report lost items as early as possible for the best chance of a match.' }];
const ROTATE_EVERY_MS = 5000;

// Loads tips with fetch() and rotates them with setInterval()
export default function TipTicker() {
  const [tips, setTips] = useState(FALLBACK_TIPS);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false); // stop rotating while the user is reading

  useEffect(() => {
    let cancelled = false; // ignore the result if the component unmounted meanwhile

    getCampusTips()
      .then((data) => { if (!cancelled && Array.isArray(data) && data.length) setTips(data); })
      .catch((error) => console.warn('Using fallback tips:', error.message));

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (tips.length < 2 || paused) return undefined;
    const intervalId = setInterval(() => {
      setIndex((current) => (current + 1) % tips.length);
    }, ROTATE_EVERY_MS);
    return () => clearInterval(intervalId); // stop the timer when leaving the page
  }, [tips, paused]);

  const tip = tips[index] ?? FALLBACK_TIPS[0];

  return (
    <div className="tip-ticker" aria-live="polite" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Icon name={tip.icon} className="tip-ticker__icon" />
      <p key={index} className="tip-ticker__text">{tip.text}</p>
      <div className="tip-ticker__dots" aria-hidden="true">
        {tips.map((_, dotIndex) => <span key={dotIndex} className={dotIndex === index ? 'is-active' : ''} />)}
      </div>
    </div>
  );
}
