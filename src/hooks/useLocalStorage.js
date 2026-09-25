import { useCallback, useRef, useState } from 'react';
import { readFromStorage, removeFromStorage, writeToStorage } from '../utils/storage';

/**
 * Works like useState, but the value is also saved in the browser.
 *   const [theme, setTheme, removeTheme] = useLocalStorage('lf_theme', 'light');
 *
 * storageType 'session' uses sessionStorage (cleared when the tab is closed).
 */
export default function useLocalStorage(key, initialValue, storageType = 'local') {
  const storage = storageType === 'session' ? window.sessionStorage : window.localStorage;

  // useRef keeps the first initialValue without causing re-renders
  const initialValueRef = useRef(initialValue);

  // READ – lazy initializer runs only on the first render
  const [storedValue, setStoredValue] = useState(() =>
    readFromStorage(key, initialValue, storage),
  );

  // WRITE / UPDATE – accepts a value or an updater function, just like setState
  const setValue = useCallback(
    (valueOrUpdater) => {
      setStoredValue((previous) => {
        const nextValue =
          typeof valueOrUpdater === 'function' ? valueOrUpdater(previous) : valueOrUpdater;
        writeToStorage(key, nextValue, storage);
        return nextValue;
      });
    },
    [key, storage],
  );

  // REMOVE – delete from storage and go back to the initial value
  const removeValue = useCallback(() => {
    removeFromStorage(key, storage);
    setStoredValue(initialValueRef.current);
  }, [key, storage]);

  return [storedValue, setValue, removeValue];
}
