// File: src/components/ui/LoadingSpinner.jsx
// Purpose: Loading spinner and skeleton cards shown while data loads.
// Used by: components/items/ItemsBrowser.jsx, pages/student/ClaimItem.jsx, pages/doss/ClaimReview.jsx,
//          pages/doss/DossClaims.jsx, pages/doss/DossDashboard.jsx, pages/public/Home.jsx, pages/public/ItemDetails.jsx,
//          pages/student/MyClaims.jsx, pages/public/ResolvedItems.jsx, pages/public/SmartMatch.jsx,
//          pages/student/StudentDashboard.jsx

export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

// Grey placeholder cards shown while a list is loading
export function SkeletonGrid({ count = 6, label = 'Loading items…' }) {
  return (
    <div>
      <span className="sr-only" role="status" aria-live="polite">
        {label}
      </span>
      <div className="item-grid" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton skeleton--media" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--short" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Placeholder layout for the dashboards: a row of stat tiles and two panels
export function DashboardSkeleton({ stats = 4 }) {
  return (
    <div className="container page-body" aria-busy="true" aria-label="Loading dashboard">
      <div className="stat-grid">
        {Array.from({ length: stats }, (_, index) => <div key={index} className="skeleton skeleton--stat" />)}
      </div>
      <div className="two-col section">
        <div className="skeleton skeleton--panel" />
        <div className="skeleton skeleton--panel" />
      </div>
    </div>
  );
}
