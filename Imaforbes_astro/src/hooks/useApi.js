// src/hooks/useApi.js
// Custom hooks for API calls with loading states, i18n, and error handling

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { api, handleApiError } from '../services/api.js';
import { validateContactForm, sanitizeString } from '../utils/inputValidation.js';
import { safeLocalStorage } from '../utils/storage.js';

// Generic API hook
export const useApi = (apiCall) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const result = await apiCall(...args);
            if (result.success) {
                setData(result.data);
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            const apiError = handleApiError(err);
            setError(apiError);
            throw apiError;
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    return { data, loading, error, execute };
};

// Hook for API calls that should run on mount
export const useApiOnMount = (apiCall) => {
    const { data, loading, error, execute } = useApi(apiCall);

    useEffect(() => {
        execute();
    }, [execute]);

    return { data, loading, error, refetch: execute };
};

// Contact form hook
export const useContact = () => {
  const { i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({
    message: '',
    type: '',
    sending: false,
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (validationErrors[e.target.name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const sendMessage = useCallback(async (data) => {
    const isEs = String(i18n?.language || 'es').toLowerCase().startsWith('es');
    const sanitizedData = {
      name: sanitizeString(data.name),
      email: sanitizeString(data.email).toLowerCase().trim(),
      message: sanitizeString(data.message),
    };

    const validation = validateContactForm(sanitizedData, isEs ? 'es' : 'en');
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setStatus({
        message: isEs ? 'Por favor corrige los errores del formulario' : 'Please fix the validation errors',
        type: 'error',
        sending: false,
      });
      return { success: false, errors: validation.errors };
    }

    setValidationErrors({});
    setStatus({
      message: isEs ? 'Enviando...' : 'Sending...',
      type: 'info',
      sending: true
    });

    try {
      const result = await api.contact.send(sanitizedData);

      if (result.success) {
        setStatus({
          message: isEs ? '¡Mensaje enviado con éxito!' : 'Message sent successfully!',
          type: 'success',
          sending: false,
        });
        setFormData({ name: '', email: '', message: '' });
        return { success: true };
      } else {
        const fallbackErr = isEs ? 'Error al enviar el mensaje' : 'Failed to send message';
        setStatus({
          message: `Error: ${typeof result.error === 'object' ? (result.error?.message || fallbackErr) : (result.error || fallbackErr)}`,
          type: 'error',
          sending: false,
        });
        return { success: false, error: result };
      }
    } catch (error) {
      const apiError = handleApiError(error);
      setStatus({
        message: `Error: ${apiError.message}`,
        type: 'error',
        sending: false,
      });
      return { success: false, error: apiError };
    }
  }, [i18n?.language]);

  const clearStatus = useCallback(() => {
    setStatus({ message: '', type: '', sending: false });
  }, []);

  return {
    formData,
    setFormData,
    status,
    validationErrors,
    handleChange,
    sendMessage,
    clearStatus,
  };
};

// Admin messages hook
export const useAdminMessages = (page = 1, limit = 10) => {
    const listCall = useCallback(() => api.admin.getMessages(page, limit), [page, limit]);
    const listApi = useApi(listCall);
    const deleteApi = useApi(api.admin.deleteMessage);

    const fetchMessages = listApi.execute;
    const deleteExecute = deleteApi.execute;

    const deleteMessage = useCallback(async (id) => {
        const result = await deleteExecute(id);
        if (result.success) {
            fetchMessages();
        }
        return result;
    }, [deleteExecute, fetchMessages]);

    return {
        messages: listApi.data,
        loading: listApi.loading,
        error: listApi.error,
        fetchMessages,
        deleteMessage,
    };
};

// Authentication hook
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (credentials) => {
        setLoading(true);
        try {
            const result = await api.auth.login(credentials);
            if (result.success) {
                setUser(result.data.user);
                setIsAuthenticated(true);
                safeLocalStorage.setItem('auth_token', result.data.token);
                return { success: true };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            const apiError = handleApiError(error);
            return { success: false, error: apiError };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            safeLocalStorage.removeItem('auth_token');
        }
    }, []);

    const verifyAuth = useCallback(async () => {
        const token = safeLocalStorage.getItem('auth_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const result = await api.auth.verify();
            if (result.success) {
                setUser(result.data.user);
                setIsAuthenticated(true);
            } else {
                safeLocalStorage.removeItem('auth_token');
            }
        } catch {
            safeLocalStorage.removeItem('auth_token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        verifyAuth();
    }, [verifyAuth]);

    return {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        verifyAuth,
    };
};

// File upload hook
export const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadImage = useCallback(async (file) => {
        setUploading(true);
        setProgress(0);

        try {
            const result = await api.upload.image(file);
            return result;
        } catch (error) {
            const apiError = handleApiError(error);
            return { success: false, error: apiError };
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, []);

    return {
        uploading,
        progress,
        uploadImage,
    };
};
