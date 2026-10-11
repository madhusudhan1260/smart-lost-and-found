// Date helpers for "YYYY-MM-DD" strings (the format the frontend sends).

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

export const isoHoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
export const isoDaysAgo = (days) => isoHoursAgo(days * 24);

const parseLocalDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Signed whole days from dateA to dateB (positive when B is later)
export const daysBetween = (dateA, dateB) =>
  Math.round((parseLocalDate(dateB) - parseLocalDate(dateA)) / MS_PER_DAY);

export const isFutureDate = (value) => daysBetween(toISODate(), value) > 0;
