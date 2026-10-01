// File: src/components/Icon.jsx
// Purpose: Wrapper for Material Symbols icons (bundled locally, works offline).
// Used by: components/ClaimCard.jsx, components/ClaimForm.jsx, components/ClaimReview.jsx,
//          components/ClaimTimeline.jsx, components/CollectionInstructions.jsx,
//          components/DashboardCard.jsx, components/EmptyState.jsx, components/FilterPanel.jsx,
//          components/ImageUploader.jsx, components/ItemCard.jsx, components/ItemForm.jsx,
//          components/ItemImage.jsx, components/MatchCard.jsx, components/MatchPairList.jsx,
//          components/ModeSwitcher.jsx, components/Navbar.jsx, components/Notification.jsx,
//          components/PageHeader.jsx, components/ReportLayout.jsx, components/SearchBar.jsx,
//          components/StatCard.jsx, components/StatusBadge.jsx, components/TipTicker.jsx,
//          pages/ClaimItem.jsx, pages/ClaimReview.jsx, pages/DossDashboard.jsx,
//          pages/FoundItems.jsx, pages/Home.jsx, pages/ItemDetails.jsx, pages/LostItems.jsx,
//          pages/MyClaims.jsx, pages/SmartMatch.jsx, pages/StudentDashboard.jsx

import { cx } from '../utils/helpers';

// Material Symbols icon (the font is bundled locally, so it works offline)
export default function Icon({ name, className, filled = false, label }) {
  return (
    <span
      className={cx('icon material-symbols-outlined', filled && 'icon--filled', className)}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  );
}
