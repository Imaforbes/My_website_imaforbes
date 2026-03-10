/**
 * Safe localStorage utility with error handling
 * Handles cases where localStorage is unavailable (private browsing, disabled, etc.)
 */

const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export const safeLocalStorage = {
  /**
   * Get item from localStorage safely
   * @param {string} key - Storage key
   * @returns {string|null} - Stored value or null
   */
  getItem: (key) => {
    if (!isStorageAvailable()) {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`Failed to get localStorage item "${key}":`, e);
      return null;
    }
  },

  /**
   * Set item in localStorage safely
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {boolean} - Success status
   */
  setItem: (key, value) => {
    if (!isStorageAvailable()) {
      console.warn(`localStorage not available. Cannot save "${key}"`);
      return false;
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`Failed to set localStorage item "${key}":`, e);
      return false;
    }
  },

  /**
   * Remove item from localStorage safely
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  removeItem: (key) => {
    if (!isStorageAvailable()) {
      return false;
    }
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`Failed to remove localStorage item "${key}":`, e);
      return false;
    }
  },

  /**
   * Clear all localStorage safely
   * @returns {boolean} - Success status
   */
  clear: () => {
    if (!isStorageAvailable()) {
      return false;
    }
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
      return false;
    }
  },
};

/**
 * Check if matchMedia is supported
 * @returns {boolean}
 */
export const isMatchMediaSupported = () => {
  return typeof window !== 'undefined' && 'matchMedia' in window;
};

/**
 * Safe matchMedia wrapper with fallback
 * @param {string} query - Media query string
 * @returns {MediaQueryList|{matches: boolean, media: string}} - MediaQueryList or fallback object
 */
export const safeMatchMedia = (query) => {
  if (!isMatchMediaSupported()) {
    // Return a fallback object that mimics MediaQueryList
    return {
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    };
  }
  return window.matchMedia(query);
};

