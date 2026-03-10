/**
 * Console Cleanup Utilities
 * Helps reduce console noise in production
 */

// Suppress specific console messages in production
if (import.meta.env.PROD) {
    // Suppress React DevTools warning
    const originalConsoleLog = console.log;
    console.log = (...args) => {
        const message = args[0];
        if (typeof message === 'string' && message.includes('React DevTools')) {
            return; // Don't log React DevTools messages in production
        }
        originalConsoleLog.apply(console, args);
    };

    // Suppress i18next debug messages
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
        const message = args[0];
        if (typeof message === 'string' && message.includes('i18next')) {
            return; // Don't log i18next messages in production
        }
        originalConsoleWarn.apply(console, args);
    };
}

// Handle browser extension errors
window.addEventListener('error', (event) => {
    // Suppress browser extension errors
    if (event.error && event.error.message &&
        event.error.message.includes('listener indicated an asynchronous response')) {
        event.preventDefault();
        return false;
    }
    
    // Suppress Vite HMR WebSocket errors (harmless - just HMR reconnecting)
    if (event.message && (
        event.message.includes('WebSocket') ||
        event.message.includes('ws://localhost') ||
        event.message.includes('WebSocket is closed due to suspension') ||
        event.message.includes('WebSocket connection to') ||
        event.message.includes('failed')
    )) {
        event.preventDefault();
        return false;
    }
    
    // Also check the error source/stack for WebSocket errors
    if (event.filename && (
        event.filename.includes('vite') ||
        event.filename.includes('client')
    ) && event.message && event.message.includes('WebSocket')) {
        event.preventDefault();
        return false;
    }
});

// Handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message &&
        event.reason.message.includes('listener indicated an asynchronous response')) {
        event.preventDefault();
        return false;
    }
    
    // Suppress Vite HMR WebSocket errors
    if (event.reason && (
        (typeof event.reason === 'string' && (
            event.reason.includes('WebSocket') ||
            event.reason.includes('ws://localhost') ||
            event.reason.includes('closed due to suspension') ||
            event.reason.includes('WebSocket connection to')
        )) ||
        (event.reason.message && (
            event.reason.message.includes('WebSocket') ||
            event.reason.message.includes('ws://localhost') ||
            event.reason.message.includes('closed due to suspension') ||
            event.reason.message.includes('WebSocket connection to')
        ))
    )) {
        event.preventDefault();
        return false;
    }
});

// Suppress WebSocket connection errors in console (development only)
// Note: We don't suppress Vite HMR errors in console.error as it can break HMR
// Instead, we only suppress them in error event listeners

export default {};
