// src/services/api.js
// Centralized API service for the portfolio project

import { API_CONFIG, buildApiUrl } from '../config/api.js';

class ApiService {
    constructor() {
        this.baseURL = API_CONFIG.getBaseURL();
        this.defaultHeaders = API_CONFIG.DEFAULT_CONFIG.headers;
        this.csrfTokenCache = null;
        this.csrfTokenExpiry = null;
    }

    // Get CSRF token (with caching)
    async getCsrfToken() {
        // Check if we have a valid cached token
        if (this.csrfTokenCache && this.csrfTokenExpiry && Date.now() < this.csrfTokenExpiry) {
            return this.csrfTokenCache;
        }

        try {
            const response = await fetch(`${this.baseURL}/api/auth/csrf-token.php`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data?.csrf_token) {
                    // Cache the token for 50 minutes (tokens expire in 1 hour)
                    this.csrfTokenCache = data.data.csrf_token;
                    this.csrfTokenExpiry = Date.now() + (50 * 60 * 1000);
                    return this.csrfTokenCache;
                }
            }
        } catch (error) {
            console.error('Failed to get CSRF token:', error);
        }

        return null;
    }

    // Generic request method with error handling
    async request(endpoint, options = {}) {
        // Ensure endpoint starts with / if baseURL doesn't end with /
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${this.baseURL}${cleanEndpoint}`;
        const method = options.method || 'GET';
        
        // Methods that require CSRF token
        const csrfRequiredMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const needsCsrf = csrfRequiredMethods.includes(method);

        // Check if body is FormData (for file uploads)
        const isFormData = options.body instanceof FormData;

        // Get CSRF token if needed
        let csrfToken = null;
        if (needsCsrf) {
            csrfToken = await this.getCsrfToken();
        }

        // Build headers
        // For FormData, don't include Content-Type (browser will set it with boundary)
        // For other requests, use default headers
        const headers = isFormData 
            ? { ...options.headers } 
            : { ...this.defaultHeaders, ...options.headers };
        
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }

        const config = {
            headers,
            credentials: 'include', // Always include credentials for session handling
            ...options,
        };

        try {
            const response = await fetch(url, config);

            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                // For validation errors (422), return the error data instead of throwing
                if (response.status === 422) {
                    return {
                        success: false,
                        error: data.message || 'Validation failed',
                        errors: data.errors || {},
                        status: response.status,
                    };
                }
                
                // For auth errors (401, 403), return error with status
                if (response.status === 401 || response.status === 403) {
                    return {
                        success: false,
                        error: data.message || data.error || `HTTP error! status: ${response.status}`,
                        status: response.status,
                    };
                }
                
                // Create error with status code
                const error = new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                throw error;
            }

            return {
                success: true,
                data,
                status: response.status,
            };
        } catch (error) {
            // Suppress CORS/proxy errors (they're expected if proxy isn't running or server is down)
            const isCorsError = error.message && (
                error.message.includes('Failed to fetch') ||
                error.message.includes('Load failed') ||
                error.message.includes('access control checks') ||
                error.message.includes('CORS') ||
                error.message.includes('Could not connect') ||
                error.message.includes('NetworkError')
            );
            
            // Only log non-CORS errors
            if (!isCorsError) {
                const errorDetails = {
                    endpoint,
                    url,
                    method: options.method || 'GET',
                    error: error.message,
                    stack: import.meta.env.DEV ? error.stack : undefined,
                };
                
                // Log errors appropriately based on environment
                if (import.meta.env.PROD) {
                    console.error(`[API Error] ${endpoint}:`, {
                        endpoint,
                        url,
                        method: errorDetails.method,
                        error: error.message,
                    });
                } else {
                    console.error(`API Error (${endpoint}):`, errorDetails);
                }
            }
            
            // Preserve status code if available
            const status = error.status || (error.response && error.response.status) || 0;
            
            // Return silent failure for CORS errors (proxy not running or server down)
            if (isCorsError) {
                return {
                    success: false,
                    error: 'Service unavailable',
                    status: 0,
                };
            }
            return {
                success: false,
                error: error.message || 'Network error occurred',
                status: status,
            };
        }
    }

    // GET request
    async get(endpoint, options = {}) {
        return this.request(endpoint, { method: 'GET', ...options });
    }

    // POST request
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options,
        });
    }

    // PUT request
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        });
    }

    // DELETE request
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { method: 'DELETE', ...options });
    }

    // PATCH request
    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            ...options,
        });
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export specific API endpoints
export const api = {
    // Contact form endpoints
    contact: {
        send: (data) => apiService.post(API_CONFIG.ENDPOINTS.CONTACT, data),
        getMessages: () => apiService.get(API_CONFIG.ENDPOINTS.MESSAGES),
        deleteMessage: (id) => apiService.delete(`${API_CONFIG.ENDPOINTS.MESSAGES}?id=${id}`),
    },

    // Projects endpoints
    projects: {
        getAll: () => apiService.get(API_CONFIG.ENDPOINTS.PROJECTS),
        getById: (id) => apiService.get(`${API_CONFIG.ENDPOINTS.PROJECTS}?id=${id}`),
        create: (data) => apiService.post(API_CONFIG.ENDPOINTS.PROJECTS, data),
        update: (id, data) => apiService.put(`${API_CONFIG.ENDPOINTS.PROJECTS}?id=${id}`, data),
        delete: (id) => apiService.delete(`${API_CONFIG.ENDPOINTS.PROJECTS}?id=${id}`),
    },

    // Blog endpoints
    blog: {
        getAll: (type = null, status = 'published') => {
            let endpoint = API_CONFIG.ENDPOINTS.BLOG;
            const params = [];
            if (type) params.push(`type=${type}`);
            if (status) params.push(`status=${status}`);
            if (params.length > 0) endpoint += `?${params.join('&')}`;
            return apiService.get(endpoint);
        },
        getById: (id) => apiService.get(`${API_CONFIG.ENDPOINTS.BLOG}?id=${id}`),
        create: (data) => apiService.post(API_CONFIG.ENDPOINTS.BLOG, data),
        update: (id, data) => apiService.put(`${API_CONFIG.ENDPOINTS.BLOG}?id=${id}`, data),
        delete: (id) => apiService.delete(`${API_CONFIG.ENDPOINTS.BLOG}?id=${id}`),
        like: (postId) => {
            const data = { post_id: postId };
            return apiService.post(API_CONFIG.ENDPOINTS.BLOG_LIKE, data);
        },
        getLikeStatus: (postId) => apiService.get(`${API_CONFIG.ENDPOINTS.BLOG_LIKE}?post_id=${postId}`),
        trackView: (postId) => apiService.post(API_CONFIG.ENDPOINTS.BLOG_VIEW, { post_id: postId }),
        getStats: (postId = null) => {
            const endpoint = postId 
                ? `${API_CONFIG.ENDPOINTS.BLOG_STATS}?post_id=${postId}`
                : API_CONFIG.ENDPOINTS.BLOG_STATS;
            return apiService.get(endpoint);
        },
    },

    // Authentication endpoints
    auth: {
        login: (credentials) => apiService.post(API_CONFIG.ENDPOINTS.LOGIN, credentials),
        logout: () => apiService.post(API_CONFIG.ENDPOINTS.LOGOUT),
        verify: () => apiService.get(API_CONFIG.ENDPOINTS.VERIFY),
    },

    // Admin endpoints
    admin: {
        getStats: () => apiService.get(API_CONFIG.ENDPOINTS.ADMIN_STATS),
        getMessages: (page = 1, limit = 10) =>
            apiService.get(`${API_CONFIG.ENDPOINTS.MESSAGES}?page=${page}&limit=${limit}`),
        updateMessage: (id, data) => apiService.patch(`${API_CONFIG.ENDPOINTS.MESSAGES}?id=${id}`, data),
        deleteMessage: (id) => apiService.delete(`${API_CONFIG.ENDPOINTS.MESSAGES}?id=${id}`),
    },

    // Settings endpoints
    settings: {
        get: () => apiService.get(API_CONFIG.ENDPOINTS.SETTINGS),
        update: (data) => apiService.post(API_CONFIG.ENDPOINTS.SETTINGS, data),
    },

    // Work Experiences endpoints
    experiences: {
        getAll: (status = 'published') => {
            const endpoint = status === 'all' 
                ? `${API_CONFIG.ENDPOINTS.EXPERIENCES}?status=all`
                : API_CONFIG.ENDPOINTS.EXPERIENCES;
            return apiService.get(endpoint);
        },
        getById: (id) => apiService.get(`${API_CONFIG.ENDPOINTS.EXPERIENCES}?id=${id}`),
        create: (data) => apiService.post(API_CONFIG.ENDPOINTS.EXPERIENCES, data),
        update: (id, data) => apiService.put(`${API_CONFIG.ENDPOINTS.EXPERIENCES}`, { ...data, id }),
        delete: (id) => apiService.delete(API_CONFIG.ENDPOINTS.EXPERIENCES, { body: JSON.stringify({ id }) }),
    },

    // File upload endpoints
    upload: {
        image: async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            // Get CSRF token for FormData uploads
            const csrfToken = await apiService.getCsrfToken();
            const headers = {};
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }
            // Don't set Content-Type - let browser set it with boundary for FormData
            return apiService.request(API_CONFIG.ENDPOINTS.UPLOAD_IMAGE, {
                method: 'POST',
                body: formData,
                headers: headers,
            });
        },
        document: async (file) => {
            const formData = new FormData();
            formData.append('document', file);
            // Get CSRF token for FormData uploads
            const csrfToken = await apiService.getCsrfToken();
            const headers = {};
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }
            // Don't set Content-Type - let browser set it with boundary for FormData
            return apiService.request(API_CONFIG.ENDPOINTS.UPLOAD_DOCUMENT, {
                method: 'POST',
                body: formData,
                headers: headers,
            });
        },
    },
};

// Utility functions for common API patterns
export const apiUtils = {
    // Handle API response with loading states
    async withLoading(apiCall, setLoading) {
        try {
            setLoading(true);
            const result = await apiCall();
            return result;
        } finally {
            setLoading(false);
        }
    },

    // Retry failed requests
    async withRetry(apiCall, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await apiCall();
                if (result.success) return result;
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    },

    // Debounce API calls
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
};

// Error types for better error handling
export const ApiError = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    NOT_FOUND: 'NOT_FOUND',
};

// Error handler utility
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
    if (error.message.includes('Failed to fetch')) {
        return { type: ApiError.NETWORK_ERROR, message: 'Network connection failed' };
    }
    if (error.status >= 500) {
        return { type: ApiError.SERVER_ERROR, message: 'Server error occurred' };
    }
    if (error.status === 404) {
        return { type: ApiError.NOT_FOUND, message: 'Resource not found' };
    }
    if (error.status === 401 || error.status === 403) {
        return { type: ApiError.AUTH_ERROR, message: 'Authentication required' };
    }
    return { type: 'UNKNOWN', message: error.message || fallbackMessage };
};
