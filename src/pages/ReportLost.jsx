import ReportLayout from '../components/ReportLayout';
import ModeGate from '../components/ModeGate';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { MODES } from '../data/constants';

export default function ReportLost() {
  useDocumentTitle('Report Lost Item');
  return (
    <ModeGate mode={MODES.STUDENT}>
      <ReportLayout type="lost" />
    </ModeGate>
  );
}
