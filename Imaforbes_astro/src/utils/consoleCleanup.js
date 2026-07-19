/**
 * Console Cleanup Utilities
 * Helps reduce console noise from browser extensions (e.g. MetaMask) and libraries in development and production
 */

// Filter functions to check if a message should be suppressed
const shouldSuppressLog = (args) => {
    if (!args || args.length === 0) return false;
    const message = args[0];
    if (typeof message === 'string') {
        if (message.includes('React DevTools')) return true;
        if (message.includes('DOM event tracking')) return true;
    }
    return false;
};

const shouldSuppressWarn = (args) => {
    if (!args || args.length === 0) return false;
    const message = args[0];
    if (typeof message === 'string') {
        if (message.includes('i18next')) return true;
        if (message.includes('MaxListenersExceededWarning')) return true;
        if (message.includes('ObjectMultiplex')) return true;
        if (message.includes('EventEmitter memory leak')) return true;
        if (message.includes('contentscript')) return true;
    }
    return false;
};

const shouldSuppressError = (args) => {
    if (!args || args.length === 0) return false;
    const message = args[0];
    if (typeof message === 'string') {
        if (message.includes('MaxListenersExceededWarning')) return true;
        if (message.includes('ObjectMultiplex')) return true;
        if (message.includes('contentscript')) return true;
    }
    return false;
};

// Intercept console functions to filter noise
const originalConsoleLog = console.log;
console.log = (...args) => {
    if (shouldSuppressLog(args)) return;
    originalConsoleLog.apply(console, args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
    if (shouldSuppressWarn(args)) return;
    originalConsoleWarn.apply(console, args);
};

const originalConsoleError = console.error;
console.error = (...args) => {
    if (shouldSuppressError(args)) return;
    originalConsoleError.apply(console, args);
};

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
