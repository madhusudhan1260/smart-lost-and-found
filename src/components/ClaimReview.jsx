// File: src/components/ClaimReview.jsx
// Purpose: Side-by-side comparison panel DOSS uses to verify a claim.
// Used by: pages/ClaimReview.jsx

import { verifyClaim } from '../utils/claimUtils';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import ItemImage from './ItemImage';
import StatusBadge from './StatusBadge';
import Icon from './Icon';

function InfoRows({ rows }) {
  return (
    <dl className="info-rows">
      {rows.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

function PrivateBox({ text }) {
  return (
    <div className="private-box">
      <p className="private-box__label"><Icon name="lock" /> Private identifying information</p>
      <p>{text || 'No private details were given.'}</p>
    </div>
  );
}

function ReportPanel({ title, icon, item }) {
  return (
    <section className="review-panel card">
      <h2><Icon name={icon} /> {title}</h2>
      <div className="review-panel__item">
        <ItemImage item={item} className="review-panel__image" />
        <div>
          <h3>{item.name}</h3>
          <StatusBadge status={item.status} size="sm" />
        </div>
      </div>
      <InfoRows
        rows={[
          { label: 'Category', value: item.category },
          { label: 'Colour', value: item.color },
          { label: 'Location', value: item.location },
          { label: 'Date', value: formatDate(item.date) },
          { label: 'Reported by', value: `${item.contactName} · ${item.contact}` },
          { label: 'Public description', value: item.description },
        ]}
      />
      <PrivateBox text={item.privateDetails} />
    </section>
  );
}

/**
 * Side-by-side comparison for DOSS:
 * found report | lost report (if linked) | claimant's answers + verification checks.
 */
export default function ClaimReview({ claim, foundItem, lostItem }) {
  const { checks, score, level } = verifyClaim(claim, foundItem, lostItem);

  return (
    <div className="review-grid">
      <ReportPanel title="Found report" icon="inventory_2" item={foundItem} />

      {lostItem ? (
        <ReportPanel title="Matched lost report" icon="search" item={lostItem} />
      ) : (
        <section className="review-panel card review-panel--empty">
          <h2><Icon name="search" /> Lost report</h2>
          <p className="muted">The claimant did not link a lost report. Rely on the claim answers below.</p>
        </section>
      )}

      <section className="review-panel card review-panel--claimant">
        <h2><Icon name="person" /> Claimant information</h2>
        <InfoRows
          rows={[
            { label: 'Name', value: claim.claimantName },
            { label: 'Roll number', value: claim.rollNumber },
            { label: 'Contact', value: claim.contact },
            { label: 'Claim submitted', value: formatDateTime(claim.createdAt) },
            { label: 'Where they lost it', value: claim.lostLocation },
            { label: 'When they lost it', value: formatDate(claim.lostDate) },
          ]}
        />
        <blockquote className="claim-quote">
          <p className="claim-quote__label">Why it belongs to them</p>
          “{claim.reason}”
        </blockquote>
        <blockquote className="claim-quote claim-quote--key">
          <p className="claim-quote__label"><Icon name="key" /> Unique feature (not public)</p>
          “{claim.uniqueFeature}”
        </blockquote>
        {claim.additionalProof && (
          <blockquote className="claim-quote">
            <p className="claim-quote__label">Additional proof</p>
            “{claim.additionalProof}”
          </blockquote>
        )}
      </section>

      <section className="review-panel card review-panel--checks">
        <div className="checks-head">
          <h2><Icon name="rule" /> Verification helper</h2>
          <span className={`evidence evidence--${level.tone}`}>{level.label} · {score}%</span>
        </div>
        <ul className="checks">
          {checks.map((check) => (
            <li key={check.label} className={check.ratio === 1 ? 'is-pass' : check.ratio > 0 ? 'is-partial' : 'is-fail'}>
              <Icon name={check.ratio === 1 ? 'check_circle' : check.ratio > 0 ? 'change_circle' : 'cancel'} filled />
              <div>
                <strong>{check.label}</strong>
                <p className="muted">{check.detail}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="muted small">The helper only suggests. DOSS staff make the final decision.</p>
      </section>
    </div>
  );
}
