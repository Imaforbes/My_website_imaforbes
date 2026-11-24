// src/hooks/useAdminAuth.js
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { safeLocalStorage } from '../utils/storage.js';

/**
 * Centralized authentication guard for all Admin pages (/admin/*).
 * Immediately checks local token + verifies active Supabase session.
 * Redirects unauthenticated visitors to /login before rendering protected admin content.
 */
export function useAdminAuth() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const redirectToLogin = useCallback(() => {
    safeLocalStorage.removeItem('auth_token');
    safeLocalStorage.removeItem('user');
    safeLocalStorage.removeItem('user_session');
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      const token = safeLocalStorage.getItem('auth_token');
      if (!token) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        redirectToLogin();
        return;
      }

      try {
        const result = await api.auth.verify();
        if (!mounted) return;

        if (result?.success && result?.data?.user) {
          setUser(result.data.user);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
        } else {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          redirectToLogin();
        }
      } catch {
        if (!mounted) return;
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        redirectToLogin();
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, [redirectToLogin]);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      redirectToLogin();
    }
  }, [redirectToLogin]);

  return {
    isCheckingAuth,
    isAuthenticated,
    user,
    logout,
  };
}

export default useAdminAuth;
