// File: src/components/FilterPanel.jsx
// Purpose: Category / location / date / status / sort dropdowns for the item lists.
// Used by: components/ItemsBrowser.jsx

import { CATEGORIES, DATE_RANGES, LOCATIONS, SORT_OPTIONS, STATUS_META, STATUS_OPTIONS_BY_TYPE } from '../data/constants';
import Icon from './Icon';

// Turn a plain list of strings into { value, label } options with an "All" entry first
const withAllOption = (list, allLabel, getLabel = (entry) => entry) => [
  { value: 'all', label: allLabel },
  ...list.map((entry) => ({ value: entry, label: getLabel(entry) })),
];

function SelectField({ id, label, value, options, onChange }) {
  return (
    <div className="filter-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterPanel({ type, filters, onFilterChange, onClear, canClear }) {
  const fields = [
    { name: 'category', label: 'Category', options: withAllOption(CATEGORIES, 'All categories') },
    { name: 'location', label: 'Location', options: withAllOption(LOCATIONS, 'All locations') },
    { name: 'dateRange', label: 'Date', options: DATE_RANGES },
    {
      name: 'status',
      label: 'Status',
      options: withAllOption(STATUS_OPTIONS_BY_TYPE[type] ?? [], 'All statuses', (status) => STATUS_META[status]?.label ?? status),
    },
    { name: 'sortBy', label: 'Sort by', options: SORT_OPTIONS },
  ];

  return (
    <div className="filter-panel" role="group" aria-label="Filters">
      {fields.map(({ name, label, options }) => (
        <SelectField
          key={name}
          id={`${type}-${name}`}
          label={label}
          value={filters[name] ?? (name === 'sortBy' ? 'newest' : 'all')}
          options={options}
          onChange={(value) => onFilterChange(name, value)}
        />
      ))}
      <button type="button" className="btn btn--text filter-panel__clear" onClick={onClear} disabled={!canClear}>
        <Icon name="filter_alt_off" /> Clear filters
      </button>
    </div>
  );
}
