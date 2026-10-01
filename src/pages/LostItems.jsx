// File: src/pages/LostItems.jsx
// Purpose: Page /lost – list of all lost reports.
// Used by: App.jsx

import { Link } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import PageHeader from '../components/PageHeader';
import ItemsBrowser from '../components/ItemsBrowser';
import Icon from '../components/Icon';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function LostItems() {
  useDocumentTitle('Lost Items');
  const { isStudent } = useMode();

  return (
    <>
      <PageHeader icon="search" tone="blue" eyebrow="Lost items" title="Things students are looking for"
        subtitle="Search, filter and sort every lost report on campus. Seen one of these? Report it as found.">
        {isStudent && <Link to="/report-lost" className="btn btn--primary"><Icon name="add" /> Report lost item</Link>}
      </PageHeader>
      <div className="container page-body">
        <ItemsBrowser type="lost" />
      </div>
    </>
  );
}
