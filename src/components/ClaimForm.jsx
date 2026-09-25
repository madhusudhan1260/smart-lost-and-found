import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useNotification } from '../context/NotificationContext';
import useFormState from '../hooks/useFormState';
import { LOCATIONS, STATUS } from '../data/constants';
import { isFormValid, validateClaimField, validateClaimForm } from '../utils/validation';
import { calculateMatchScore } from '../utils/matching';
import { formatDate, toISODate } from '../utils/dateUtils';
import FormField from './FormField';
import StatusBadge from './StatusBadge';
import Icon from './Icon';

const EMPTY_CLAIM = {
  claimantName: '',
  rollNumber: '',
  contact: '',
  reason: '',
  uniqueFeature: '',
  lostLocation: '',
  lostDate: '',
  additionalProof: '',
  lostItemId: '',
};

// Ideas shown under the "unique feature" box
const VERIFICATION_IDEAS = [
  'Describe any scratches or damage',
  'A sticker, name or mark on it',
  'Accessories that were with it',
  'What was inside (bag / wallet)',
  'The phone case or cover',
  'Exactly where you lost it',
];

// "This is my item" → the claimant must PROVE ownership. Nothing is approved automatically.
export default function ClaimForm({ item }) {
  const { items, submitClaim } = useItems();
  const { notify } = useNotification();
  const [values, setValues] = useState(EMPTY_CLAIM);
  const [submitting, setSubmitting] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState(null);

  const context = { foundDate: item.date }; // for the "lost after it was found?" date check
  const { errors, fieldProps, showAllErrors } = useFormState({
    values,
    setValues,
    validateOne: (name, value) => validateClaimField(name, value, context),
  });

  // The student's own open lost reports, best Smart Match first – they can link one
  const linkableLostReports = useMemo(
    () =>
      items
        .filter((entry) => entry.type === 'lost' && entry.status === STATUS.LOST)
        .map((lost) => ({ lost, score: calculateMatchScore(lost, item) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8),
    [items, item],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = validateClaimForm(values, context);
    if (!isFormValid(formErrors)) {
      showAllErrors(formErrors);
      notify('Please complete the claim form correctly.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const claim = await submitClaim(item, {
        ...values,
        rollNumber: values.rollNumber.trim().toUpperCase(),
        lostItemId: values.lostItemId || null,
      });
      setSubmittedClaim(claim);
      notify('Claim submitted successfully.', 'success');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- AFTER SUBMISSION ----------
  if (submittedClaim) {
    return (
      <div className="form-success card">
        <span className="form-success__check form-success__check--pending"><Icon name="hourglass_top" /></span>
        <h2>Claim submitted</h2>
        <StatusBadge status={STATUS.CLAIM_PENDING} />
        <p className="muted">
          Your claim <code>{submittedClaim.id}</code> is waiting for DOSS to verify it. You will see the result on the
          My Claims page. Claims are never approved automatically.
        </p>
        <div className="form-success__actions">
          <Link to="/my-claims" className="btn btn--primary">Track my claim</Link>
          <Link to="/found" className="btn btn--outline">Back to found items</Link>
        </div>
      </div>
    );
  }

  // ---------- FORM ----------
  return (
    <form className="item-form card claim-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="form-section">
        <legend><Icon name="person" /> About you</legend>
        <div className="form-grid form-grid--3">
          <FormField id="claimantName" label="Full name" required error={errors.claimantName}>
            <input type="text" autoComplete="name" placeholder="e.g. Rahul Sharma" {...fieldProps('claimantName')} />
          </FormField>
          <FormField id="rollNumber" label="Roll number / USN" required error={errors.rollNumber}>
            <input type="text" placeholder="e.g. 22CSE045" {...fieldProps('rollNumber')} />
          </FormField>
          <FormField id="contact" label="Email or mobile" required error={errors.contact}>
            <input type="text" placeholder="name@college.edu" {...fieldProps('contact')} />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend><Icon name="verified_user" /> Proof of ownership</legend>
        <div className="form-grid">
          <FormField id="reason" label="Why do you believe this item belongs to you?" required full error={errors.reason}>
            <textarea rows={3} placeholder="e.g. It is my phone – I lost it in the library on Monday afternoon." {...fieldProps('reason')} />
          </FormField>

          <FormField id="uniqueFeature" label="Describe a unique feature that was NOT publicly mentioned" required full
            error={errors.uniqueFeature}>
            <textarea rows={3} placeholder="e.g. There are three small scratches on the bottom-right corner of the back case." {...fieldProps('uniqueFeature')} />
          </FormField>
          <div className="idea-chips form-field--full" aria-label="Ideas for verification details">
            {VERIFICATION_IDEAS.map((idea) => <span key={idea} className="chip"><Icon name="lightbulb" /> {idea}</span>)}
          </div>

          <FormField id="lostLocation" label="Where did you lose the item?" required error={errors.lostLocation}>
            <select {...fieldProps('lostLocation')}>
              <option value="">Select a location</option>
              {LOCATIONS.map((place) => <option key={place} value={place}>{place}</option>)}
            </select>
          </FormField>

          <FormField id="lostDate" label="When did you lose it?" required error={errors.lostDate}
            hint={`This item was found on ${formatDate(item.date)}.`}>
            <input type="date" max={toISODate()} {...fieldProps('lostDate')} />
          </FormField>

          <FormField id="additionalProof" label="Additional proof / details" full
            hint="e.g. purchase bill, a photo of you with it, what the lock screen shows.">
            <textarea rows={2} {...fieldProps('additionalProof')} />
          </FormField>

          <FormField id="lostItemId" label="Did you file a lost report? (optional)" full
            hint="Linking your lost report helps DOSS compare both reports.">
            <select {...fieldProps('lostItemId')}>
              <option value="">No, I did not report it</option>
              {linkableLostReports.map(({ lost, score }) => (
                <option key={lost.id} value={lost.id}>
                  {lost.name} · {lost.location} · {formatDate(lost.date)} ({score}% match)
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </fieldset>

      <div className="form-actions">
        <p className="muted form-actions__note"><Icon name="gavel" /> DOSS reviews every claim before the item is released.</p>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? <><span className="spinner spinner--sm" aria-hidden="true" /> Submitting…</> : 'Submit claim'}
        </button>
      </div>
    </form>
  );
}
