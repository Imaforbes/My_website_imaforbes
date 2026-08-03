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
