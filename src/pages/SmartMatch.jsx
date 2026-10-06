// File: src/pages/SmartMatch.jsx
// Purpose: Page /smart-match – pick a report and see its scored matches.
// Used by: App.jsx

import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { DEFAULT_MATCH_THRESHOLD, STATUS } from '../data/constants';
import { MATCH_WEIGHTS, findMatches, isOpenForMatching } from '../utils/matching';
import { formatDate } from '../utils/dateUtils';
import { cx, pluralize } from '../utils/helpers';
import PageHeader from '../components/PageHeader';
import ItemImage from '../components/ItemImage';
import MatchCard from '../components/MatchCard';
import ScoreRing from '../components/ScoreRing';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';

const WEIGHT_LABELS = {
  category: 'Same category',
  name: 'Similar item name',
  color: 'Same colour',
  location: 'Same / nearby location',
  date: 'Close dates',
  description: 'Description keywords',
};

function WeightsPanel() {
  return (
    <div className="weights card">
      <h2><Icon name="calculate" /> How the score works</h2>
      <ul>
        {Object.entries(MATCH_WEIGHTS).map(([key, points]) => (
          <li key={key}>
            <span>{WEIGHT_LABELS[key]}</span>
            <span className="weights__bar"><span style={{ width: `${points * 4}%` }} /></span>
            <strong>{points}%</strong>
          </li>
        ))}
      </ul>
      <p className="muted small">Total = 100. Pure JavaScript – no AI or machine learning.</p>
      <ul className="score-legend" aria-label="What the colours mean">
        <li><span className="score-legend__dot score-legend__dot--high" /> 75%+ Strong match</li>
        <li><span className="score-legend__dot score-legend__dot--medium" /> 50–74% Good match</li>
        <li><span className="score-legend__dot score-legend__dot--low" /> below 50% Possible match</li>
      </ul>
    </div>
  );
}

// /smart-match (no id) → choose a report to match
function MatchPicker({ items }) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('lost');

  const candidates = useMemo(
    () =>
      items
        .filter((item) => item.type === selectedType && isOpenForMatching(item))
        .map((item) => ({ item, best: findMatches(item, items)[0] ?? null }))
        .sort((a, b) => (b.best?.score ?? 0) - (a.best?.score ?? 0)),
    [items, selectedType],
  );

  return (
    <div className="picker">
      <div className="picker__head">
        <h2>Choose a report to match</h2>
        <div className="segmented segmented--small">
          {['lost', 'found'].map((type) => (
            <button key={type} type="button" className={cx('segmented__item', selectedType === type && 'is-active')}
              onClick={() => setSelectedType(type)} aria-pressed={selectedType === type}>
              {type === 'lost' ? 'Lost reports' : 'Found reports'}
            </button>
          ))}
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState icon="celebration" title="No open reports" message="Everything has been matched or resolved." />
      ) : (
        <div className="picker__list">
          {candidates.map(({ item, best }, index) => (
            <button key={item.id} type="button" className="picker__row card" style={{ '--delay': `${index * 35}ms` }}
              onClick={() => navigate(`/smart-match/${item.id}`)}>
              <ItemImage item={item} className="picker__image" />
              <span className="picker__text">
                <strong>{item.name}</strong>
                <small className="muted">{item.location} · {formatDate(item.date)}</small>
              </span>
              {best ? (
                <span className="picker__best"><small className="muted">Best match</small><ScoreRing score={best.score} size="sm" /></span>
              ) : (
                <small className="muted">No match yet</small>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SmartMatch() {
  const { id } = useParams();
  const { items, loading, getItemById } = useItems();
  const [minScore, setMinScore] = useState(DEFAULT_MATCH_THRESHOLD);

  const sourceItem = id ? getItemById(id) : null;
  useDocumentTitle(sourceItem ? `Matches for ${sourceItem.name}` : 'Smart Match');

  const matches = useMemo(
    () => (sourceItem ? findMatches(sourceItem, items, minScore) : []),
    [sourceItem, items, minScore],
  );

  const header = (
    <PageHeader icon="join_inner" tone="blue" eyebrow="Smart Match"
      title={sourceItem ? `Possible matches for “${sourceItem.name}”` : 'Find the owner, automatically'}
      subtitle="Every open report of the opposite type is scored on category, name, colour, location, date and description." />
  );

  if (loading) return <>{header}<div className="container page-body"><LoadingSpinner label="Comparing reports…" /></div></>;

  if (!id) {
    return (
      <>
        {header}
        <div className="container page-body match-layout">
          <MatchPicker items={items} />
          <WeightsPanel />
        </div>
      </>
    );
  }

  if (!sourceItem) {
    return (
      <>
        {header}
        <div className="container page-body">
          <EmptyState icon="search_off" tone="error" title="Report not found" message={`No report exists with ID "${id}".`}>
            <Link to="/smart-match" className="btn btn--primary">Choose another report</Link>
          </EmptyState>
        </div>
      </>
    );
  }

  const oppositeLabel = sourceItem.type === 'lost' ? 'found' : 'lost';
  const isClosed = [STATUS.COLLECTED, STATUS.RESOLVED].includes(sourceItem.status);

  return (
    <>
      {header}
      <div className="container page-body match-layout">
        <div>
          {isClosed && (
            <div className="notice notice--green"><Icon name="task_alt" /><p>This case is already closed – matches are shown for reference only.</p></div>
          )}
          <div className="match-toolbar card">
            <div className="range-field">
              <label htmlFor="min-score">Minimum match score: <strong>{minScore}%</strong></label>
              <input id="min-score" type="range" min="0" max="90" step="5" value={minScore}
                onChange={(event) => setMinScore(Number(event.target.value))} />
            </div>
            <p className="muted" aria-live="polite">{pluralize(matches.length, 'match', 'matches')} among open {oppositeLabel} reports</p>
          </div>

          {matches.length === 0 ? (
            <EmptyState icon="search_off" title="No matches above this score"
              message={`Try lowering the minimum score, or check again when new ${oppositeLabel} items are reported.`}>
              {minScore > 0 && <button type="button" className="btn btn--outline" onClick={() => setMinScore(0)}>Show all scores</button>}
            </EmptyState>
          ) : (
            <div className="match-list">
              {matches.map((match, rank) => <MatchCard key={match.item.id} match={match} rank={rank} />)}
            </div>
          )}
        </div>

        <aside className="match-aside">
          <div className="source-card card">
            <p className="eyebrow">Comparing</p>
            <ItemImage item={sourceItem} className="source-card__image" />
            <StatusBadge status={sourceItem.status} size="sm" />
            <h2>{sourceItem.name}</h2>
            <ul className="source-card__meta">
              <li><Icon name="sell" /> {sourceItem.category}</li>
              <li><Icon name="palette" /> {sourceItem.color}</li>
              <li><Icon name="location_on" /> {sourceItem.location}</li>
              <li><Icon name="calendar_today" /> {formatDate(sourceItem.date)}</li>
            </ul>
            <p className="muted small">{sourceItem.description}</p>
            <div className="source-card__actions">
              <Link to={`/items/${sourceItem.id}`} className="btn btn--outline btn--sm">View report</Link>
              <Link to="/smart-match" className="btn btn--text btn--sm">Change item</Link>
            </div>
          </div>
          <WeightsPanel />
        </aside>
      </div>
    </>
  );
}
