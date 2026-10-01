// File: src/utils/storage.js
// Used by: hooks/useLocalStorage.js, services/itemService.js
// Safe wrappers around localStorage / sessionStorage.
// Storage only holds strings, so objects go through JSON.stringify / JSON.parse.
// Every call is wrapped in try/catch because storage can throw
// (quota exceeded, private browsing, corrupted JSON...).

export function readFromStorage(key, fallback = null, storage = window.localStorage) {
  try {
    const raw = storage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.error(`Could not read "${key}" from storage:`, error);
    return fallback;
  }
}

export function writeToStorage(key, value, storage = window.localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (error?.name === 'QuotaExceededError' || error?.code === 22) {
      console.error(`Storage quota exceeded while writing "${key}". Free up space or clear old data.`);
    } else {
      console.error(`Could not save "${key}" to storage:`, error);
    }
    return false;
  }
}

export function removeFromStorage(key, storage = window.localStorage) {
  try {
    storage.removeItem(key);
  } catch (error) {
    console.error(`Could not remove "${key}" from storage:`, error);
  }
}
