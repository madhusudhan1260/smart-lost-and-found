import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Purpose: In DOSS mode, prefix the browser tab title with the number of pending
// claims – e.g. "(3) DOSS Dashboard · Smart Lost & Found" – like an unread count.
// Runs after the page's own useDocumentTitle (parent effects run after child effects).
export default function usePendingTitleBadge(pendingCount, enabled) {
  const { pathname } = useLocation();

  useEffect(() => {
    const baseTitle = document.title.replace(/^\(\d+\)\s/, ''); // remove an old badge
    document.title = enabled && pendingCount > 0 ? `(${pendingCount}) ${baseTitle}` : baseTitle;
  }, [pendingCount, enabled, pathname]);
}
