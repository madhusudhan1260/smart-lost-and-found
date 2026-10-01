// File: src/components/SearchBar.jsx
// Purpose: Google-style search box ("/" to focus, Esc to clear).
// Used by: components/ItemsBrowser.jsx, pages/DossClaims.jsx, pages/Home.jsx

import { useEffect, useRef } from 'react';
import Icon from './Icon';

// Controlled, Google-style search box. Press "/" anywhere on the page to focus it.
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  id = 'search',
  large = false,
  ariaLabel = 'Search items',
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const typingInField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (event.key === '/' && !typingInField) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form className={`search-bar ${large ? 'search-bar--large' : ''}`} role="search" onSubmit={handleSubmit}>
      <label htmlFor={id} className="sr-only">{ariaLabel}</label>
      <Icon name="search" className="search-bar__icon" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onChange('')} // Esc clears the search
        placeholder={placeholder}
        autoComplete="off"
      />
      {value ? (
        <button
          type="button"
          className="icon-btn icon-btn--sm"
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          aria-label="Clear search"
        >
          <Icon name="close" />
        </button>
      ) : (
        <kbd className="search-bar__hint" aria-hidden="true">/</kbd>
      )}
    </form>
  );
}
