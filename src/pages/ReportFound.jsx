// File: src/pages/ReportFound.jsx
// Purpose: Page /report-found – report a found item (Student mode).
// Used by: App.jsx

import ReportLayout from '../components/ReportLayout';
import ModeGate from '../components/ModeGate';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { MODES } from '../data/constants';

export default function ReportFound() {
  useDocumentTitle('Report Found Item');
  return (
    <ModeGate mode={MODES.STUDENT}>
      <ReportLayout type="found" />
    </ModeGate>
  );
}
