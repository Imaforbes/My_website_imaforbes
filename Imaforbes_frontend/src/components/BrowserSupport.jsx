// src/components/BrowserSupport.jsx
/**
 * Browser Support Detection Component
 * Shows a message for unsupported browsers and suggests upgrades
 */
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { safeLocalStorage } from '../utils/storage.js';

// Custom browser icon components (since lucide-react doesn't have browser icons)
const ChromeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.17 10.83l-2.12-2.12c-.39-.39-.39-1.02 0-1.41l2.12-2.12c.39-.39 1.02-.39 1.41 0l2.12 2.12c.39.39.39 1.02 0 1.41l-2.12 2.12c-.39.39-1.02.39-1.41 0zm4.24-4.24l-2.12 2.12c-.39.39-.39 1.02 0 1.41l2.12 2.12c.39.39 1.02.39 1.41 0l2.12-2.12c.39-.39.39-1.02 0-1.41l-2.12-2.12c-.39-.39-1.02-.39-1.41 0zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
  </svg>
);

const FirefoxIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const EdgeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.014 2C6.5 2 2.5 5.5 2.5 10.5c0 2.5 1.5 4.5 3.5 5.5.5.3 1 .2 1.3-.2.2-.3.2-.7 0-1-.5-.3-1-.5-1.5-.8-.5-.3-1-.7-1.3-1.2-.3-.5-.5-1-.5-1.5 0-3.5 3-6.5 7-6.5 1.5 0 3 .5 4 1.5.3.2.5.2.8 0 .2-.2.2-.5 0-.8-1.2-1.2-2.8-1.8-4.5-1.8zm7.5 3c-1.5 0-3 .5-4 1.5-.3.2-.5.2-.8 0-.2-.2-.2-.5 0-.8 1.2-1.2 2.8-1.8 4.5-1.8 5.5 0 9.5 3.5 9.5 8.5 0 2.5-1.5 4.5-3.5 5.5-.5.3-1 .2-1.3-.2-.2-.3-.2-.7 0-1 .5-.3 1-.5 1.5-.8.5-.3 1-.7 1.3-1.2.3-.5.5-1 .5-1.5 0-3.5-3-6.5-7-6.5z"/>
  </svg>
);

const BrowserSupport = () => {
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(null);

  useEffect(() => {
    // Check if browser is supported
    const checkBrowserSupport = () => {
      const userAgent = navigator.userAgent;
      const isIE = /MSIE|Trident/.test(userAgent);
      const isOperaMini = /Opera Mini/.test(userAgent);
      
      // Check for critical missing features
      const hasFetch = 'fetch' in window;
      const hasPromise = 'Promise' in window;
      const hasLocalStorage = 'localStorage' in window;
      
      // Detect browser
      let browserName = 'Unknown';
      let browserVersion = null;
      
      if (isIE) {
        browserName = 'Internet Explorer';
        const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
        browserVersion = match ? match[1] : null;
      } else if (/Edg/.test(userAgent)) {
        browserName = 'Edge';
        const match = userAgent.match(/Edg\/(\d+)/);
        browserVersion = match ? match[1] : null;
      } else if (/Chrome/.test(userAgent) && !/Edg/.test(userAgent)) {
        browserName = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+)/);
        browserVersion = match ? match[1] : null;
      } else if (/Firefox/.test(userAgent)) {
        browserName = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+)/);
        browserVersion = match ? match[1] : null;
      } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
        browserName = 'Safari';
        const match = userAgent.match(/Version\/(\d+)/);
        browserVersion = match ? match[1] : null;
      }
      
      setBrowserInfo({ name: browserName, version: browserVersion });
      
      // Check if browser is unsupported
      const unsupported = 
        isIE || 
        isOperaMini ||
        !hasFetch ||
        !hasPromise ||
        !hasLocalStorage ||
        (browserName === 'Safari' && browserVersion && parseInt(browserVersion) < 14) ||
        (browserName === 'Chrome' && browserVersion && parseInt(browserVersion) < 90) ||
        (browserName === 'Firefox' && browserVersion && parseInt(browserVersion) < 88) ||
        (browserName === 'Edge' && browserVersion && parseInt(browserVersion) < 90);
      
      // Check if user has dismissed the message
      const dismissed = safeLocalStorage.getItem('browser_support_dismissed') === 'true';
      
      setIsUnsupported(unsupported && !dismissed);
    };

    checkBrowserSupport();
  }, []);

  const handleDismiss = () => {
    setIsUnsupported(false);
    safeLocalStorage.setItem('browser_support_dismissed', 'true');
  };

  const getBrowserDownloadLinks = () => {
    return [
      {
        name: 'Chrome',
        url: 'https://www.google.com/chrome/',
        icon: ChromeIcon,
        color: 'text-blue-600 dark:text-blue-400',
      },
      {
        name: 'Firefox',
        url: 'https://www.mozilla.org/firefox/',
        icon: FirefoxIcon,
        color: 'text-orange-600 dark:text-orange-400',
      },
      {
        name: 'Edge',
        url: 'https://www.microsoft.com/edge',
        icon: EdgeIcon,
        color: 'text-blue-500 dark:text-blue-300',
      },
    ];
  };

  if (!isUnsupported) {
    return null;
  }

  return (
    <AnimatePresence>
      {isUnsupported && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Browser Not Fully Supported
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  {browserInfo && (
                    <>
                      You're using <strong>{browserInfo.name}</strong>
                      {browserInfo.version && ` ${browserInfo.version}`}. 
                      For the best experience, please update to a modern browser.
                    </>
                  )}
                  {!browserInfo && (
                    <>
                      Your browser may not support all features of this website. 
                      Please update to a modern browser for the best experience.
                    </>
                  )}
                </p>
                
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                    Recommended browsers:
                  </span>
                  {getBrowserDownloadLinks().map((browser) => {
                    const Icon = browser.icon;
                    return (
                      <a
                        key={browser.name}
                        href={browser.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${browser.color} hover:underline transition-colors`}
                      >
                        <Icon className="w-4 h-4" />
                        {browser.name}
                      </a>
                    );
                  })}
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800/50"
                aria-label="Dismiss browser support message"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrowserSupport;

