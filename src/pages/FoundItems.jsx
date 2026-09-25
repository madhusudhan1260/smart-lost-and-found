import { Link } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import PageHeader from '../components/PageHeader';
import ItemsBrowser from '../components/ItemsBrowser';
import Icon from '../components/Icon';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function FoundItems() {
  useDocumentTitle('Found Items');
  const { isStudent } = useMode();

  return (
    <>
      <PageHeader icon="inventory_2" tone="green" eyebrow="Found items" title="Items waiting for their owners"
        subtitle="Recognise your item? Click “This is my item” and prove ownership – DOSS will verify your claim.">
        {isStudent && <Link to="/report-found" className="btn btn--primary"><Icon name="add" /> Report found item</Link>}
      </PageHeader>
      <div className="container page-body">
        <ItemsBrowser type="found" />
      </div>
    </>
  );
}
