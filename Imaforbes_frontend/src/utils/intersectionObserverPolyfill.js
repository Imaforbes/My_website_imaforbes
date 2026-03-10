/**
 * IntersectionObserver Polyfill Loader
 * 
 * This file provides instructions and optional polyfill loading for IntersectionObserver.
 * IntersectionObserver is not supported in Safari < 12.1 and IE 11.
 * 
 * Option 1: Use the fallback already implemented in LazyImage.jsx (recommended)
 * - Images will load immediately if IntersectionObserver is not available
 * - No additional dependencies needed
 * - Graceful degradation
 * 
 * Option 2: Load polyfill for full IntersectionObserver support
 * - Install: npm install intersection-observer
 * - Import in main.jsx: import 'intersection-observer';
 * - This will add IntersectionObserver support to older browsers
 */

// Check if IntersectionObserver is available
export const isIntersectionObserverSupported = () => {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
};

// Optional: Load polyfill dynamically
export const loadIntersectionObserverPolyfill = async () => {
  if (isIntersectionObserverSupported()) {
    return; // Already supported, no need for polyfill
  }

  try {
    // Dynamic import of intersection-observer polyfill
    // Note: You need to install it first: npm install intersection-observer
    await import('intersection-observer');
    console.log('IntersectionObserver polyfill loaded');
  } catch (error) {
    console.warn('Failed to load IntersectionObserver polyfill:', error);
    console.warn('Images will load immediately (graceful degradation)');
  }
};

// Auto-load polyfill in development (optional)
// Uncomment the line below if you want automatic polyfill loading
// if (import.meta.env.DEV) {
//   loadIntersectionObserverPolyfill();
// }

