// Example API Configuration for Portfolio
// Centralized configuration for API endpoints and URLs

export const API_CONFIG = {
    // Base URLs for different environments
    BASE_URL: {
        // Development uses Vite proxy
        development: '',
        production: 'https://www.yourdomain.com/api_db' // REPLACE WITH YOUR DOMAIN
    },

    // Get the correct base URL based on environment
    getBaseURL: () => {
        if (import.meta.env.VITE_API_BASE_URL) {
            return import.meta.env.VITE_API_BASE_URL;
        }

        return import.meta.env.PROD
            ? API_CONFIG.BASE_URL.production
            : API_CONFIG.BASE_URL.development;
    },

    // API Endpoints
    ENDPOINTS: {
        LOGIN: '/api/auth/login.php',
        LOGOUT: '/api/auth/logout.php',
        VERIFY: '/api/auth/verify.php',
        CSRF_TOKEN: '/api/auth/csrf-token.php',
        CONTACT: '/api/contact.php',
        MESSAGES: '/api/messages.php',
        ADMIN_STATS: '/api/admin/stats.php',
        SETTINGS: '/api/settings.php',
        PROJECTS: '/api/projects.php',
        BLOG: '/api/blog.php',
        BLOG_LIKE: '/api/blog/like.php',
        BLOG_VIEW: '/api/blog/view.php',
        BLOG_STATS: '/api/blog/stats.php',
        EXPERIENCES: '/api/experiences.php',
        UPLOAD_IMAGE: '/api/upload/image.php',
        UPLOAD_DOCUMENT: '/api/upload/document.php'
    },

    // Default request configuration
    DEFAULT_CONFIG: {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        credentials: 'include',
    },

    // CORS configuration
    CORS: {
        allowedOrigins: [
            'http://localhost:5173',
            'yourdomain.com' // REPLACE
        ]
    }
};

export const buildApiUrl = (endpoint) => {
    const baseURL = API_CONFIG.getBaseURL();
    return `${baseURL}${endpoint}`;
};

export const makeApiRequest = async (endpoint, options = {}) => {
    const url = buildApiUrl(endpoint);
    const config = {
        ...API_CONFIG.DEFAULT_CONFIG,
        ...options,
        headers: {
            ...API_CONFIG.DEFAULT_CONFIG.headers,
            ...options.headers
        }
    };
    return fetch(url, config);
};

export default API_CONFIG;
