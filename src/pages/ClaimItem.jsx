// File: src/pages/ClaimItem.jsx
// Purpose: Page /items/:id/claim – item summary + claim form (Student mode).
// Used by: App.jsx

import { Link, useParams } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { MODES } from '../data/constants';
import { canBeClaimed } from '../utils/claimUtils';
import { formatDate } from '../utils/dateUtils';
import PageHeader from '../components/PageHeader';
import ClaimForm from '../components/ClaimForm';
import ItemImage from '../components/ItemImage';
import StatusBadge from '../components/StatusBadge';
import ModeGate from '../components/ModeGate';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';

function ClaimPageContent() {
  const { id } = useParams(); // /items/:id/claim
  const { loading, getItemById } = useItems();
  const item = getItemById(id);
  useDocumentTitle(item ? `Claim ${item.name}` : 'Claim item');

  if (loading) return <div className="container page-body"><LoadingSpinner /></div>;

  if (!item) {
    return (
      <div className="container page-body">
        <EmptyState icon="search_off" tone="error" title="Item not found" message={`No report exists with ID "${id}".`}>
          <Link to="/found" className="btn btn--primary">Browse found items</Link>
        </EmptyState>
      </div>
    );
  }

  // Invalid claim: lost reports, or items already returned, cannot be claimed
  if (!canBeClaimed(item)) {
    return (
      <div className="container page-body">
        <EmptyState icon="block" tone="error" title="This item cannot be claimed"
          message={item.type === 'lost'
            ? 'This is a lost report. Only found items can be claimed.'
            : 'DOSS has already verified an owner for this item.'}>
          <Link to={`/items/${id}`} className="btn btn--outline">View item</Link>
          <Link to="/found" className="btn btn--primary">Browse found items</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <PageHeader icon="front_hand" tone="yellow" eyebrow="Ownership claim" title="Claim This Item"
        subtitle="Prove that this item is yours. DOSS will compare your answers with private details only the owner would know." />
      <div className="container page-body claim-layout">
        <aside className="claim-summary card">
          <ItemImage item={item} className="claim-summary__image" />
          <StatusBadge status={item.status} size="sm" />
          <h2>{item.name}</h2>
          <ul className="claim-summary__meta">
            <li><Icon name="sell" /> {item.category} · {item.color}</li>
            <li><Icon name="location_on" /> Found at {item.location}</li>
            <li><Icon name="calendar_today" /> {formatDate(item.date)}</li>
          </ul>
          <p className="muted">{item.description}</p>
          <p className="hidden-note"><Icon name="visibility_off" /> The finder’s private notes are hidden. Describe what you know – do not guess.</p>
        </aside>
        <ClaimForm item={item} />
      </div>
    </>
  );
}

export default function ClaimItem() {
  return (
    <ModeGate mode={MODES.STUDENT}>
      <ClaimPageContent />
    </ModeGate>
  );
}
