// File: src/components/LoadingSpinner.jsx
// Purpose: Loading spinner and skeleton cards shown while data loads.
// Used by: components/ItemsBrowser.jsx, pages/ClaimItem.jsx, pages/ClaimReview.jsx,
//          pages/DossClaims.jsx, pages/DossDashboard.jsx, pages/Home.jsx, pages/ItemDetails.jsx,
//          pages/MyClaims.jsx, pages/ResolvedItems.jsx, pages/SmartMatch.jsx,
//          pages/StudentDashboard.jsx

export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

// Grey placeholder cards shown while a list is loading
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="item-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton skeleton--media" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      ))}
    </div>
  );
}
