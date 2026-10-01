// File: src/components/ScrollToTop.jsx
// Purpose: Scrolls back to the top whenever the route changes.
// Used by: App.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router keeps the scroll position between pages; reset it on navigation
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
