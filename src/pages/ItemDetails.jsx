// File: src/pages/ItemDetails.jsx
// Purpose: Page /items/:id – full report details and actions.
// Used by: App.jsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useMode } from '../context/ModeContext';
import { useNotification } from '../context/NotificationContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useLocalStorage from '../hooks/useLocalStorage';
import { STATUS, STORAGE_KEYS } from '../data/constants';
import { findMatches } from '../utils/matching';
import { canBeClaimed } from '../utils/claimUtils';
import { formatDate, formatDateTime, formatTime, timeAgo } from '../utils/dateUtils';
import { copyToClipboard, pluralize } from '../utils/helpers';
import ItemImage from '../components/ItemImage';
import StatusBadge, { TypeChip } from '../components/StatusBadge';
import ClaimCard from '../components/ClaimCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ScoreRing from '../components/ScoreRing';
import Icon from '../components/Icon';
import Breadcrumbs from '../components/Breadcrumbs';
import Lightbox from '../components/Lightbox';

// Which DOSS action is possible for the current status (switch on status)
function getDossAction(item) {
  switch (item.status) {
    case STATUS.READY_FOR_COLLECTION:
      return { key: 'collect', label: 'Mark as collected', icon: 'handshake' };
    case STATUS.COLLECTED:
      return { key: 'resolve', label: 'Mark as resolved', icon: 'task_alt' };
    case STATUS.LOST:
      return { key: 'resolve', label: 'Owner got it back – resolve', icon: 'task_alt' };
    default:
      return null;
  }
}

export default function ItemDetails() {
  const { id } = useParams(); // dynamic route: /items/:id
  const navigate = useNavigate();
  const { items, loading, getItemById, getClaimsForItem, markCollected, markResolved, deleteItem } = useItems();
  const { isDoss, isStudent } = useMode();
  const { notify } = useNotification();

  const [modal, setModal] = useState(null); // null | 'collect' | 'resolve' | 'delete'
  const [busy, setBusy] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  const item = getItemById(id);
  const [, setRecent] = useLocalStorage(STORAGE_KEYS.RECENT, []);

  // Remember this item in "Recently viewed" (newest first, max 6, no duplicates)
  useEffect(() => {
    if (item) setRecent((previous) => [item.id, ...previous.filter((entry) => entry !== item.id)].slice(0, 6));
  }, [item, setRecent]);
  useDocumentTitle(item?.name ?? 'Item details');

  const matches = useMemo(() => (item ? findMatches(item, items) : []), [item, items]);
  const closeModal = useCallback(() => setModal(null), []);

  if (loading) return <div className="container page-body"><LoadingSpinner label="Loading report…" /></div>;

  if (!item) {
    return (
      <div className="container page-body">
        <EmptyState icon="search_off" tone="error" title="Report not found" message={`There is no report with ID "${id}". It may have been deleted.`}>
          <Link to="/lost" className="btn btn--outline">Browse lost items</Link>
          <Link to="/found" className="btn btn--primary">Browse found items</Link>
        </EmptyState>
      </div>
    );
  }

  const { type, name, category, description, color, location, date, time, contactName, contact, additionalInfo,
    status, createdAt, handedTo, privateDetails, collectedAt, resolvedAt } = item;
  const itemClaims = getClaimsForItem(id);
  const dossAction = getDossAction(item);

  // Use the phone's share sheet when available, otherwise copy the link
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: `${type === 'lost' ? 'Lost' : 'Found'}: ${name} at ${location}`, url });
      } catch {
        // the user closed the share sheet – nothing to do
      }
      return;
    }
    notify(await copyToClipboard(url) ? 'Link copied – paste it anywhere to share' : 'Could not copy the link', 'info', 2500);
  };

  // One async handler for all three confirm dialogs
  const handleConfirm = async () => {
    setBusy(true);
    try {
      if (modal === 'collect') {
        await markCollected(id);
        notify('Item marked as collected.', 'success');
      } else if (modal === 'resolve') {
        await markResolved(id);
        notify('Item marked as resolved.', 'success');
      } else if (modal === 'delete') {
        await deleteItem(id);
        notify(`Report "${name}" was deleted.`, 'info');
        navigate(type === 'lost' ? '/lost' : '/found');
        return;
      }
      setModal(null);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const details = [
    { label: 'Category', value: category, icon: 'sell' },
    { label: 'Colour', value: color, icon: 'palette' },
    { label: type === 'lost' ? 'Location lost' : 'Location found', value: location, icon: 'location_on' },
    { label: type === 'lost' ? 'Date lost' : 'Date found', value: formatDate(date), icon: 'calendar_today' },
    { label: 'Approximate time', value: formatTime(time) || 'Not specified', icon: 'schedule' },
    { label: 'Report ID', value: id, icon: 'tag' },
    ...(handedTo ? [{ label: 'Item is now', value: handedTo, icon: 'where_to_vote' }] : []),
    ...(collectedAt ? [{ label: 'Collected on', value: formatDateTime(collectedAt), icon: 'handshake' }] : []),
    ...(resolvedAt ? [{ label: 'Resolved on', value: formatDateTime(resolvedAt), icon: 'task_alt' }] : []),
  ];

  const modalText = {
    collect: { title: 'Mark as collected?', body: `Confirm that the owner has collected "${name}" from the DOSS Office after showing their student ID.`, tone: 'primary' },
    resolve: { title: 'Mark as resolved?', body: `This closes the case for "${name}". It will move to Resolved cases.`, tone: 'primary' },
    delete: { title: 'Delete this report?', body: `This permanently removes "${name}". This cannot be undone.`, tone: 'danger' },
  }[modal];

  return (
    <div className="container page-body details">
      <nav className="details__topbar" aria-label="Details navigation">
        <button type="button" className="btn btn--text back-btn" onClick={() => navigate(-1)}>
          <Icon name="arrow_back" /> Back
        </button>
        <Breadcrumbs crumbs={[
          { label: 'Home', to: '/' },
          { label: type === 'lost' ? 'Lost items' : 'Found items', to: `/${type}` },
          { label: name },
        ]} />
      </nav>

      <div className="details__grid">
        <div className="details__media card">
          {item.image ? (
            <button type="button" className="details__zoom" onClick={() => setPhotoOpen(true)} aria-label="View photo full size">
              <ItemImage item={item} className="details__image" />
              <span className="details__zoom-hint"><Icon name="zoom_in" /> View full size</span>
            </button>
          ) : (
            <ItemImage item={item} className="details__image" />
          )}
        </div>
        {photoOpen && <Lightbox src={item.image} alt={`Photo of ${name}`} onClose={() => setPhotoOpen(false)} />}

        <div className="details__info">
          <div className="details__badges">
            <TypeChip type={type} />
            <StatusBadge status={status} />
            <span className="muted small">Reported {timeAgo(createdAt)}</span>
          </div>
          <h1 className="details__title">{name}</h1>
          <p className="details__description">{description}</p>

          <dl className="detail-list">
            {details.map(({ label, value, icon }) => (
              <div key={label} className="detail-list__row">
                <dt><Icon name={icon} /> {label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {additionalInfo && (
            <div className="notice notice--grey">
              <Icon name="info" />
              <div><strong>Additional information</strong><p>{additionalInfo}</p></div>
            </div>
          )}

          {/* Private details: visible ONLY in DOSS mode */}
          {isDoss ? (
            <div className="private-box">
              <p className="private-box__label"><Icon name="lock" /> Private identifying information (DOSS only)</p>
              <p>{privateDetails || 'No private details were given.'}</p>
            </div>
          ) : (
            <p className="hidden-note"><Icon name="visibility_off" /> Some identifying details are hidden to protect the owner.</p>
          )}

          <div className="contact-card">
            <span className="contact-card__avatar" aria-hidden="true">{(contactName ?? '?').charAt(0)}</span>
            <div>
              <p className="muted small">{type === 'lost' ? 'Reported by the owner' : 'Reported by the finder'}</p>
              <p><strong>{contactName ?? 'Anonymous'}</strong></p>
              <p className="contact-card__value">{contact}</p>
            </div>
          </div>

          <div className="details__actions">
            {isStudent && canBeClaimed(item) && (
              <Link to={`/items/${id}/claim`} className="btn btn--primary">
                <Icon name="front_hand" /> This is my item
              </Link>
            )}
            <Link to={`/smart-match/${id}`} className="btn btn--outline">
              <Icon name="join_inner" /> Find possible matches
            </Link>
            <button type="button" className="btn btn--text"
              onClick={async () => notify(await copyToClipboard(id) ? `Report ID ${id} copied` : 'Could not copy – please copy it manually', 'info', 2500)}>
              <Icon name="content_copy" /> Copy ID
            </button>
            <button type="button" className="btn btn--text" onClick={handleShare}>
              <Icon name="share" /> Share
            </button>
            {isDoss && dossAction && (
              <button type="button" className="btn btn--primary" onClick={() => setModal(dossAction.key)}>
                <Icon name={dossAction.icon} /> {dossAction.label}
              </button>
            )}
            {isDoss && (
              <button type="button" className="btn btn--danger-text" onClick={() => setModal('delete')}>
                <Icon name="delete" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {isDoss && (
        <section className="section">
          <div className="section__head"><h2><Icon name="fact_check" /> Claims for this item</h2></div>
          {itemClaims.length ? (
            <div className="claim-rows card">
              {itemClaims.map((claim, index) => <ClaimCard key={claim.id} claim={claim} view="doss" index={index} />)}
            </div>
          ) : (
            <p className="muted">No claims have been made for this item.</p>
          )}
        </section>
      )}

      {matches.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2><Icon name="join_inner" /> {pluralize(matches.length, 'possible match', 'possible matches')}</h2>
            <Link to={`/smart-match/${id}`} className="link-arrow">Full breakdown <Icon name="arrow_forward" /></Link>
          </div>
          <div className="mini-matches">
            {matches.slice(0, 3).map(({ item: match, score }) => (
              <Link key={match.id} to={`/items/${match.id}`} className="mini-match card">
                <ItemImage item={match} className="mini-match__image" />
                <span className="mini-match__text">
                  <strong>{match.name}</strong>
                  <small className="muted">{match.location} · {formatDate(match.date)}</small>
                </span>
                <ScoreRing score={score} size="sm" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <Modal
        isOpen={Boolean(modal)}
        title={modalText?.title}
        confirmText={modalText?.title ? modalText.title.replace('?', '') : 'Confirm'}
        tone={modalText?.tone}
        busy={busy}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      >
        <p>{modalText?.body}</p>
      </Modal>
    </div>
  );
}
