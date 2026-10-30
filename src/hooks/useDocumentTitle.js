 // File: src/hooks/useDocumentTitle.js
// Purpose: Custom hook: sets the browser tab title for each page.
// Used by: pages/student/ClaimItem.jsx, pages/doss/ClaimReview.jsx, pages/doss/DossClaims.jsx,
//          pages/doss/DossDashboard.jsx, pages/public/FoundItems.jsx, pages/public/Home.jsx, pages/public/ItemDetails.jsx,
//          pages/public/LostItems.jsx, pages/student/MyClaims.jsx, pages/public/NotFound.jsx, pages/student/ReportFound.jsx,
//          pages/student/ReportLost.jsx, pages/public/ResolvedItems.jsx, pages/public/SmartMatch.jsx,
//          pages/student/StudentDashboard.jsx

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
