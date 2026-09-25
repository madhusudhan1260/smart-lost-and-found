import { useEffect } from 'react';

// Updates the browser tab title for each page
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Smart Lost & Found` : 'Smart Lost & Found';
  }, [title]);
}
