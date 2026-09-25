import { useEffect, useState } from 'react';

/**
 * DEBOUNCING: returns `value` only after it has stopped changing for `delay` ms.
 * While the user is still typing, every keystroke clears the previous timer,
 * so the expensive filtering runs once at the end instead of on every key.
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timerId); // cleanup runs before the next effect
  }, [value, delay]);

  return debouncedValue;
}
