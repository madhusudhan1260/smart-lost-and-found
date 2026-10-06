// File: src/hooks/useDocumentTitle.js
// Purpose: Custom hook: sets the browser tab title for each page.
// Used by: pages/ClaimItem.jsx, pages/ClaimReview.jsx, pages/DossClaims.jsx,
//          pages/DossDashboard.jsx, pages/FoundItems.jsx, pages/Home.jsx, pages/ItemDetails.jsx,
//          pages/LostItems.jsx, pages/MyClaims.jsx, pages/NotFound.jsx, pages/ReportFound.jsx,
//          pages/ReportLost.jsx, pages/ResolvedItems.jsx, pages/SmartMatch.jsx,
//          pages/StudentDashboard.jsx

import { useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import { useItems } from '../context/ItemContext';
import { STATUS } from '../data/constants';

// Updates the browser tab title for each page.
// In DOSS mode the number of pending claims is shown first, like an unread count:
// "(3) Claims · Smart Lost & Found"
export default function useDocumentTitle(title) {
  const { isDoss } = useMode();
  const { claims } = useItems();
  const pending = claims.filter((claim) => claim.status === STATUS.CLAIM_PENDING).length;

  useEffect(() => {
    const base = title ? `${title} · Smart Lost & Found` : 'Smart Lost & Found';
    document.title = isDoss && pending > 0 ? `(${pending}) ${base}` : base;
  }, [title, isDoss, pending]);
}
