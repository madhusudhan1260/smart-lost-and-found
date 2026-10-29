// File: src/components/ui/Icon.jsx
// Purpose: Wrapper for Material Symbols icons (bundled locally, works offline).
// Used by: components/claims/ClaimCard.jsx, components/claims/ClaimForm.jsx, components/claims/ClaimReview.jsx,
//          components/claims/ClaimTimeline.jsx, components/claims/CollectionInstructions.jsx,
//          components/ui/DashboardCard.jsx, components/ui/EmptyState.jsx, components/items/FilterPanel.jsx,
//          components/items/ImageUploader.jsx, components/items/ItemCard.jsx, components/items/ItemForm.jsx,
//          components/items/ItemImage.jsx, components/matching/MatchCard.jsx, components/matching/MatchPairList.jsx,
//          components/layout/ModeSwitcher.jsx, components/layout/Navbar.jsx, components/ui/Notification.jsx,
//          components/layout/PageHeader.jsx, components/layout/ReportLayout.jsx, components/items/SearchBar.jsx,
//          components/ui/StatCard.jsx, components/ui/StatusBadge.jsx, components/ui/TipTicker.jsx,
//          pages/ClaimItem.jsx, pages/ClaimReview.jsx, pages/DossDashboard.jsx,
//          pages/FoundItems.jsx, pages/Home.jsx, pages/ItemDetails.jsx, pages/LostItems.jsx,
//          pages/MyClaims.jsx, pages/SmartMatch.jsx, pages/StudentDashboard.jsx

import { cx } from '../../utils/helpers';

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
