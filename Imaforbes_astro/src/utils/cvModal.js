// src/utils/cvModal.js
/**
 * Helper to dispatch the open-cv-modal event across the application
 * @param {string|null} lang - Optional default language ('en' or 'es')
 */
export const openCvModal = (lang = null) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('open-cv-modal', { detail: { lang } })
    );
  }
};
