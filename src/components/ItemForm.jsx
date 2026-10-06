// File: src/components/ItemForm.jsx
// Purpose: Report Lost / Report Found form with validation and auto-saved draft.
// Used by: components/ReportLayout.jsx

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useNotification } from '../context/NotificationContext';
import useLocalStorage from '../hooks/useLocalStorage';
import useFormState from '../hooks/useFormState';
import { CATEGORIES, ITEM_LOCATIONS_NOW, LOCATIONS, STORAGE_KEYS } from '../data/constants';
import { isFormValid, validateField, validateItemForm } from '../utils/validation';
import { daysAgoISO, toISODate } from '../utils/dateUtils';
import { cx } from '../utils/helpers';
import ImageUploader from './ImageUploader';
import FormField from './FormField';
import Icon from './Icon';

const emptyValues = (type) => ({
  name: '',
  category: '',
  color: '',
  description: '',
  location: '',
  date: toISODate(),
  time: '',
  privateDetails: '',
  additionalInfo: '',
  contactName: '',
  contact: '',
  ...(type === 'found' ? { handedTo: ITEM_LOCATIONS_NOW[0] } : {}),
});

// Wording that changes between the two forms
const TEXT = {
  lost: {
    location: 'Location lost',
    date: 'Date lost',
    privateLabel: 'Additional identifying information (private)',
    privateHint:
      'Do not reveal every unique identifying detail publicly. Keep some information that can be used to verify ownership – e.g. "There are three scratches on the back case."',
    submit: 'Submit lost report',
    toast: 'Lost item reported successfully.',
  },
  found: {
    location: 'Location found',
    date: 'Date found',
    privateLabel: 'Private details for DOSS (optional)',
    privateHint:
      'Details you noticed but did NOT put in the public description (marks, stickers, contents). DOSS uses them to check the owner’s claim.',
    submit: 'Submit found report',
    toast: 'Found item reported successfully.',
  },
};

const REDIRECT_DELAY_MS = 2200;

// Remove extra spaces from every text value before saving
const trimValues = (values) =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));

export default function ItemForm({ type }) {
  const { addItem } = useItems();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const text = TEXT[type];

  // The draft is auto-saved in localStorage, so a refresh does not lose what was typed
  const [values, setValues, clearDraft] = useLocalStorage(`${STORAGE_KEYS.DRAFT_PREFIX}${type}`, emptyValues(type));
  const { errors, fieldProps, showAllErrors, resetValidation } = useFormState({
    values,
    setValues,
    validateOne: (name, value) => validateField(name, value, type),
  });

  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedItem, setSavedItem] = useState(null);
  const redirectTimerRef = useRef(null);

  // Cancel the pending redirect if the user leaves the page first
  useEffect(() => () => clearTimeout(redirectTimerRef.current), []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formErrors = validateItemForm(values, type);
    if (!isFormValid(formErrors) || imageError) {
      showAllErrors(formErrors);
      notify('Please fix the highlighted fields before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const newItem = await addItem({ ...trimValues(values), type, image });
      clearDraft();
      setSavedItem(newItem);
      notify(text.toast, 'success');
      redirectTimerRef.current = setTimeout(() => navigate(`/items/${newItem.id}`), REDIRECT_DELAY_MS);
    } catch (error) {
      notify(error.message ?? 'Something went wrong while saving.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    clearDraft();
    setImage(null);
    setImageError('');
    resetValidation();
  };

  // ---------- SUCCESS VIEW ----------
  if (savedItem) {
    return (
      <div className="form-success card">
        <span className="form-success__check"><Icon name="check" /></span>
        <h2>{type === 'lost' ? 'Lost item reported' : 'Found item reported'}</h2>
        <p className="muted">
          <strong>{savedItem.name}</strong> was saved with ID <code>{savedItem.id}</code>. Opening the report…
        </p>
        <div className="form-success__actions">
          <Link to={`/items/${savedItem.id}`} className="btn btn--primary">View report</Link>
          <Link to={`/smart-match/${savedItem.id}`} className="btn btn--outline">
            <Icon name="join_inner" /> Find possible matches
          </Link>
        </div>
      </div>
    );
  }

  // ---------- FORM ----------
  const descriptionLength = values.description?.length ?? 0;

  return (
    <form className="item-form card" onSubmit={handleSubmit} aria-busy={submitting} noValidate>
      <fieldset className="form-section">
        <legend><Icon name="info" /> Item details</legend>
        <div className="form-grid">
          <FormField id="name" label="Item name" required error={errors.name}>
            <input type="text" placeholder="e.g. iPhone 15" maxLength={50} {...fieldProps('name')} />
          </FormField>

          <FormField id="category" label="Category" required error={errors.category}>
            <select {...fieldProps('category')}>
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </FormField>

          <FormField id="color" label="Colour" required error={errors.color}>
            <input type="text" placeholder="e.g. Black" {...fieldProps('color')} />
          </FormField>

          <FormField id="description" label="Public description" required full error={errors.description}
            hint={`Everyone can see this. ${descriptionLength}/400 characters`}>
            <textarea rows={3} maxLength={400} placeholder="e.g. Black iPhone 15 with a transparent case." {...fieldProps('description')} />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend><Icon name="location_on" /> Where &amp; when</legend>
        <div className="form-grid form-grid--3">
          <FormField id="location" label={text.location} required error={errors.location}>
            <select {...fieldProps('location')}>
              <option value="">Select a location</option>
              {LOCATIONS.map((place) => <option key={place} value={place}>{place}</option>)}
            </select>
          </FormField>
          <FormField id="date" label={text.date} required error={errors.date}>
            <input type="date" max={toISODate()} {...fieldProps('date')} />
            <div className="date-chips">
              {[['Today', 0], ['Yesterday', 1], ['2 days ago', 2]].map(([label, days]) => (
                <button key={label} type="button" className={cx('chip chip--toggle', values.date === daysAgoISO(days) && 'is-active')}
                  onClick={() => setValues((previous) => ({ ...previous, date: daysAgoISO(days) }))}>
                  {label}
                </button>
              ))}
            </div>
          </FormField>
          <FormField id="time" label="Approximate time" error={errors.time}>
            <input type="time" {...fieldProps('time')} />
          </FormField>
          {type === 'found' && (
            <FormField id="handedTo" label="Where is the item now?" full>
              <select {...fieldProps('handedTo')}>
                {ITEM_LOCATIONS_NOW.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </FormField>
          )}
        </div>
      </fieldset>

      <fieldset className="form-section form-section--private">
        <legend><Icon name="lock" /> Verification details</legend>
        <div className="private-note">
          <Icon name="visibility_off" />
          <p>Only DOSS staff can see this section. It is never shown on public pages or in search.</p>
        </div>
        <FormField id="privateDetails" label={text.privateLabel} required={type === 'lost'} full
          error={errors.privateDetails} hint={text.privateHint}>
          <textarea rows={3} placeholder="e.g. There are three small scratches on the bottom-right corner of the back case." {...fieldProps('privateDetails')} />
        </FormField>
      </fieldset>

      <fieldset className="form-section">
        <legend><Icon name="add_photo_alternate" /> Image</legend>
        <ImageUploader image={image} onChange={setImage} error={imageError} onError={setImageError} />
      </fieldset>

      <fieldset className="form-section">
        <legend><Icon name="contact_mail" /> Contact information</legend>
        <div className="form-grid">
          <FormField id="contactName" label="Your name" required error={errors.contactName}>
            <input type="text" placeholder="e.g. Rahul Sharma" autoComplete="name" {...fieldProps('contactName')} />
          </FormField>
          <FormField id="contact" label="Email or mobile" required error={errors.contact}>
            <input type="text" placeholder="name@college.edu or 9876543210" {...fieldProps('contact')} />
          </FormField>
          <FormField id="additionalInfo" label="Additional information" full hint="Optional, public.">
            <textarea rows={2} placeholder="Anything else that could help" {...fieldProps('additionalInfo')} />
          </FormField>
        </div>
      </fieldset>

      <div className="form-actions">
        <p className="muted form-actions__note"><Icon name="cloud_done" /> Draft saved automatically</p>
        <button type="button" className="btn btn--text" onClick={handleReset} disabled={submitting}>Reset</button>
        <button type="submit" className={cx('btn', 'btn--primary')} disabled={submitting}>
          {submitting ? <><span className="spinner spinner--sm" aria-hidden="true" /> Saving…</> : text.submit}
        </button>
      </div>
    </form>
  );
}
