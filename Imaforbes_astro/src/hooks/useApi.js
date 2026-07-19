// src/hooks/useApi.js
// Custom hooks for API calls with loading states and error handling

import { useState, useEffect, useCallback } from 'react';
import { api, handleApiError } from '../services/api';
import { validateContactForm, sanitizeString } from '../utils/inputValidation';
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
    // Clear validation error for this field when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const sendMessage = useCallback(async (data) => {
    // SECURITY: Client-side validation before sending to API
    // Sanitize input data
    const sanitizedData = {
      name: sanitizeString(data.name),
      email: sanitizeString(data.email).toLowerCase().trim(),
      message: sanitizeString(data.message),
    };

    // Validate sanitized data
    const validation = validateContactForm(sanitizedData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setStatus({
        message: 'Please fix the validation errors',
        type: 'error',
        sending: false,
      });
      return { success: false, errors: validation.errors };
    }

    setValidationErrors({});
    setStatus({ message: 'Enviando...', type: 'info', sending: true });

    try {
      const result = await api.contact.send(sanitizedData);

            if (result.success) {
                setStatus({
                    message: '¡Mensaje enviado con éxito!',
                    type: 'success',
                    sending: false,
                });
                setFormData({ name: '', email: '', message: '' });
                return { success: true };
            } else {
                // Handle validation errors specifically
                if (result.status === 422 && result.errors) {
                    const errorMessages = Object.values(result.errors).join(', ');
                    setStatus({
                        message: `Error de validación: ${errorMessages}`,
                        type: 'error',
                        sending: false,
                    });
                } else {
                    setStatus({
                        message: `Error: ${result.error}`,
                        type: 'error',
                        sending: false,
                    });
                }
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
    }, []);

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

// Projects hook
export const useProjects = () => {
    const listApi = useApi(api.projects.getAll);
    const getByIdApi = useApi(api.projects.getById);
    const createApi = useApi(api.projects.create);
    const updateApi = useApi(api.projects.update);
    const deleteApi = useApi(api.projects.delete);

    const fetchProjects = listApi.execute;
    const getByIdExecute = getByIdApi.execute;
    const createExecute = createApi.execute;
    const updateExecute = updateApi.execute;
    const deleteExecute = deleteApi.execute;

    const getProject = useCallback(async (id) => {
        return await getByIdExecute(id);
    }, [getByIdExecute]);

    const createProject = useCallback(async (projectData) => {
        const result = await createExecute(projectData);
        if (result.success) {
            fetchProjects();
        }
        return result;
    }, [createExecute, fetchProjects]);

    const updateProject = useCallback(async (id, projectData) => {
        const result = await updateExecute(id, projectData);
        if (result.success) {
            fetchProjects();
        }
        return result;
    }, [fetchProjects, updateExecute]);

    const deleteProject = useCallback(async (id) => {
        const result = await deleteExecute(id);
        if (result.success) {
            fetchProjects();
        }
        return result;
    }, [deleteExecute, fetchProjects]);

    return {
        projects: listApi.data,
        loading: listApi.loading,
        error: listApi.error,
        fetchProjects,
        getProject,
        createProject,
        updateProject,
        deleteProject,
    };
};

// Admin messages hook
export const useAdminMessages = (page = 1, limit = 10) => {
    const listCall = useCallback(() => api.admin.getMessages(page, limit), [page, limit]);
    const listApi = useApi(listCall);
    const updateApi = useApi(api.admin.updateMessage);
    const deleteApi = useApi(api.admin.deleteMessage);

    const fetchMessages = listApi.execute;
    const updateExecute = updateApi.execute;
    const deleteExecute = deleteApi.execute;

    const updateMessage = useCallback(async (id, messageData) => {
        const result = await updateExecute(id, messageData);
        if (result.success) {
            fetchMessages(); // Refresh the list
        }
        return result;
    }, [fetchMessages, updateExecute]);

    const deleteMessage = useCallback(async (id) => {
        const result = await deleteExecute(id);
        if (result.success) {
            fetchMessages(); // Refresh the list
        }
        return result;
    }, [deleteExecute, fetchMessages]);

    return {
        messages: listApi.data,
        loading: listApi.loading,
        error: listApi.error,
        fetchMessages,
        updateMessage,
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

    const uploadDocument = useCallback(async (file) => {
        setUploading(true);
        setProgress(0);

        try {
            const result = await api.upload.document(file);
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
        uploadDocument,
    };
};
