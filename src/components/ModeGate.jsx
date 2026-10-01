// File: src/components/ModeGate.jsx
// Purpose: Shows a page only in the right mode (Student or DOSS).
// Used by: pages/ClaimItem.jsx, pages/ClaimReview.jsx, pages/DossClaims.jsx, pages/MyClaims.jsx,
//          pages/ReportFound.jsx, pages/ReportLost.jsx

import { useMode } from '../context/ModeContext';
import { MODES } from '../data/constants';
import EmptyState from './EmptyState';

// Shows a page only in the right mode. This is NOT security – just keeps each
// interface focused. The user can switch modes with one click.
export default function ModeGate({ mode: requiredMode, children }) {
  const { mode, setMode } = useMode();

  if (mode === requiredMode) return children;

  const isDossPage = requiredMode === MODES.DOSS;
  return (
    <div className="container page-body">
      <EmptyState
        icon={isDossPage ? 'shield_person' : 'school'}
        title={isDossPage ? 'This page is part of the DOSS interface' : 'This page is part of the Student interface'}
        message={`Switch to ${isDossPage ? 'DOSS' : 'Student'} mode to continue.`}
      >
        <button type="button" className="btn btn--primary" onClick={() => setMode(requiredMode)}>
          Switch to {isDossPage ? 'DOSS' : 'Student'} mode
        </button>
      </EmptyState>
    </div>
  );
}
