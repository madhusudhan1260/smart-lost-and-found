// File: src/hooks/useDocumentTitle.js
// Purpose: Custom hook: sets the browser tab title for each page.
// Used by: pages/ClaimItem.jsx, pages/ClaimReview.jsx, pages/DossClaims.jsx,
//          pages/DossDashboard.jsx, pages/FoundItems.jsx, pages/Home.jsx, pages/ItemDetails.jsx,
//          pages/LostItems.jsx, pages/MyClaims.jsx, pages/NotFound.jsx, pages/ReportFound.jsx,
//          pages/ReportLost.jsx, pages/ResolvedItems.jsx, pages/SmartMatch.jsx,
//          pages/StudentDashboard.jsx

import { useEffect } from 'react';

// Updates the browser tab title for each page
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Smart Lost & Found` : 'Smart Lost & Found';
  }, [title]);
}
