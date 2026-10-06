// File: src/components/ItemsBrowser.jsx
// Purpose: Search + filters + results grid shared by the Lost and Found pages.
// Used by: pages/FoundItems.jsx, pages/LostItems.jsx

import { useCallback, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useItems } from '../context/ItemContext';
import { useMode } from '../context/ModeContext';
import useDebounce from '../hooks/useDebounce';
import useLocalStorage from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/constants';
import { DEFAULT_FILTERS, applyFilters, hasActiveFilters } from '../utils/searchUtils';
import { pluralize } from '../utils/helpers';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ActiveFilters from './ActiveFilters';
import ItemCard from './ItemCard';
import EmptyState from './EmptyState';
import { SkeletonGrid } from './LoadingSpinner';

// Shared by the Lost Items and Found Items pages – only `type` changes.
export default function ItemsBrowser({ type }) {
  const { items, loading, error, reload } = useItems();
  const { isStudent } = useMode();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters are kept in sessionStorage, so they survive opening a details page and coming back
  const [filters, setFilters, resetFilters] = useLocalStorage(
    `${STORAGE_KEYS.FILTERS_PREFIX}${type}`,
    DEFAULT_FILTERS,
    'session',
  );

  // Coming from the Home page search box: /found?q=phone
  const queryFromUrl = searchParams.get('q');
  useEffect(() => {
    if (queryFromUrl === null) return;
    setFilters({ ...DEFAULT_FILTERS, search: queryFromUrl });
    setSearchParams({}, { replace: true });
  }, [queryFromUrl, setFilters, setSearchParams]);

  // The search text is debounced; the dropdowns apply instantly
  const debouncedSearch = useDebounce(filters.search, 350);
  const { category, location, dateRange, status, sortBy } = filters;

  const itemsOfType = useMemo(() => items.filter((item) => item.type === type), [items, type]);

  // useMemo: re-filter only when the list or a filter actually changes
  const visibleItems = useMemo(
    () => applyFilters(itemsOfType, { search: debouncedSearch, category, location, dateRange, status, sortBy }),
    [itemsOfType, debouncedSearch, category, location, dateRange, status, sortBy],
  );

  const isSearching = filters.search !== debouncedSearch;
  const canClear = hasActiveFilters(filters);

  const handleFilterChange = useCallback(
    (name, value) => setFilters((previous) => ({ ...previous, [name]: value })),
    [setFilters],
  );

  if (error) {
    return (
      <EmptyState icon="cloud_off" tone="error" title="Could not load reports" message={error}>
        <button type="button" className="btn btn--primary" onClick={reload}>Try again</button>
      </EmptyState>
    );
  }

  return (
    <div className="browser">
      <div className="browser__toolbar card">
        <SearchBar
          id={`search-${type}`}
          value={filters.search}
          onChange={(value) => handleFilterChange('search', value)}
          placeholder={`Search ${type} items by name, category, location or description`}
        />
        <FilterPanel type={type} filters={filters} onFilterChange={handleFilterChange} onClear={resetFilters} canClear={canClear} />
      </div>

      <ActiveFilters filters={filters} onRemove={(name) => handleFilterChange(name, DEFAULT_FILTERS[name])} />

      <p className="browser__summary" aria-live="polite">
        {isSearching ? (
          <span className="muted">Searching…</span>
        ) : (
          <>Showing <strong>{visibleItems.length}</strong> of {pluralize(itemsOfType.length, `${type} report`)}</>
        )}
      </p>

      {loading ? (
        <SkeletonGrid />
      ) : visibleItems.length === 0 ? (
        <EmptyState
          icon={canClear ? 'search_off' : 'inbox'}
          title={canClear ? 'No reports match your search' : (type === 'found' ? 'No found items reported yet.' : 'No lost items reported yet.')}
          message={canClear ? 'Try a different keyword or clear the filters.' : 'Reports will appear here as soon as they are added.'}
        >
          {canClear && <button type="button" className="btn btn--outline" onClick={resetFilters}>Clear filters</button>}
          {isStudent && (
            <Link to={type === 'lost' ? '/report-lost' : '/report-found'} className="btn btn--primary">
              Report {type} item
            </Link>
          )}
        </EmptyState>
      ) : (
        <div className="item-grid">
          {visibleItems.map((item, index) => <ItemCard key={item.id} item={item} index={index} highlight={debouncedSearch} />)}
        </div>
      )}
    </div>
  );
}
