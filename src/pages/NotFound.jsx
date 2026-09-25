import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container page-body">
      <EmptyState icon="explore_off" title="404 – This page got lost too" message="The page you are looking for does not exist.">
        <Link to="/" className="btn btn--primary">Go home</Link>
      </EmptyState>
    </div>
  );
}
