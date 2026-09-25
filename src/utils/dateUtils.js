// Small helpers built on the JavaScript Date object.
// Dates are stored as "YYYY-MM-DD" strings, so we always parse them as LOCAL dates
// (new Date("2026-09-20") would be treated as UTC and can shift by a day in India).

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const TIME_UNITS = [
  { label: 'year', seconds: 365 * 24 * 60 * 60 },
  { label: 'month', seconds: 30 * 24 * 60 * 60 },
  { label: 'day', seconds: 24 * 60 * 60 },
  { label: 'hour', seconds: 60 * 60 },
  { label: 'minute', seconds: 60 },
];

// Date object → "YYYY-MM-DD"
export function toISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysAgoISO(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
}

// Full timestamps (used for createdAt / collectedAt in the sample data)
export const isoHoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
export const isoDaysAgo = (days) => isoHoursAgo(days * 24);

export function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Signed number of whole days from dateA to dateB (positive when B is later)
export function daysBetween(dateA, dateB) {
  return Math.round((parseLocalDate(dateB) - parseLocalDate(dateA)) / MS_PER_DAY);
}

export const isFutureDate = (dateString) => daysBetween(toISODate(), dateString) > 0;

export function formatDate(dateString) {
  if (!dateString) return '—';
  return parseLocalDate(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ISO timestamp → "24 Sept 2026, 3:05 pm"
export function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// "14:30" → "2:30 PM"
export function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

// "2026-09-22T10:00:00.000Z" → "2 days ago"
export function timeAgo(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);

  for (const unit of TIME_UNITS) {
    const value = Math.floor(seconds / unit.seconds);
    if (value >= 1) {
      return `${value} ${unit.label}${value > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

// Used by the date filter on the Lost / Found pages
export function isInDateRange(dateString, range) {
  const age = daysBetween(dateString, toISODate());

  switch (range) {
    case 'today':
      return age === 0;
    case 'week':
      return age >= 0 && age <= 7;
    case 'month':
      return age >= 0 && age <= 30;
    case 'older':
      return age > 30;
    case 'all':
    default:
      return true;
  }
}
