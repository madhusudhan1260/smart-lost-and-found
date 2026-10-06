// Purpose: Shows each active filter as a chip that can be removed with one click.
// Used by: components/ItemsBrowser.jsx

import { DATE_RANGES, STATUS_META } from '../data/constants';
import { DEFAULT_FILTERS } from '../utils/searchUtils';
import Icon from './Icon';

// How to describe each filter in a chip
const LABELS = {
  search: (value) => `“${value}”`,
  category: (value) => value,
  location: (value) => value,
  dateRange: (value) => DATE_RANGES.find((range) => range.value === value)?.label ?? value,
  status: (value) => STATUS_META[value]?.label ?? value,
};

export default function ActiveFilters({ filters, onRemove }) {
  // Object.entries + filter: keep only filters that differ from their default
  const active = Object.entries(filters).filter(
    ([key, value]) => key in LABELS && value && value !== DEFAULT_FILTERS[key],
  );
  if (active.length === 0) return null;

  return (
    <ul className="active-filters" aria-label="Active filters">
      {active.map(([key, value]) => (
        <li key={key}>
          <button type="button" className="chip chip--removable" onClick={() => onRemove(key)}
            aria-label={`Remove filter ${LABELS[key](value)}`}>
            {LABELS[key](value)}
            <Icon name="close" />
          </button>
        </li>
      ))}
    </ul>
  );
}
