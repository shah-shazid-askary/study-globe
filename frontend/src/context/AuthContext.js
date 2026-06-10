import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext(null);

// Helper: check if JWT is expired (with 60s buffer)
const isTokenExpired = (session) => {
  if (!session?.expires_at) return false;
  return Date.now() / 1000 > (session.expires_at - 60);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: load stored session, refresh if expired, then sync role from backend
  useEffect(() => {
    const loadSession = async () => {
      const stored = localStorage.getItem('supabase_session');
      if (!stored) {
        setLoading(false);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(stored);
      } catch {
        localStorage.removeItem('supabase_session');
        setLoading(false);
        return;
      }

      // Set initial user from localStorage so UI is not blank while we verify
      setSession(parsed);
      setUser(parsed?.user || null);

      try {
        // Refresh token if it's expired or close to expiry
        if (isTokenExpired(parsed) && parsed?.refresh_token) {
          try {
            const refreshRes = await authAPI.refreshToken(parsed.refresh_token);
            const newSession = refreshRes.data.session;
            localStorage.setItem('supabase_session', JSON.stringify(newSession));
            parsed = newSession;
            setSession(newSession);
            setUser(newSession?.user || null);
          } catch (refreshErr) {
            // Refresh failed — clear everything and force login
            console.error('Session refresh failed on startup, clearing session');
            localStorage.removeItem('supabase_session');
            setUser(null);
            setSession(null);
            setLoading(false);
            return;
          }
        }

        // Sync fresh role and name from backend
        const res = await profileAPI.get();
        if (res?.data) {
          const freshUser = {
            ...parsed.user,
            full_name: res.data.full_name || parsed?.user?.full_name,
            role: res.data.role || parsed?.user?.role || 'student',
          };
          setUser(freshUser);
          parsed.user = freshUser;
          localStorage.setItem('supabase_session', JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('Failed to sync user session role on load:', err);
        // Don't clear the session here — the user may still be valid
        // The api.js interceptor handles 401 responses
      }

      setLoading(false);
    };

    loadSession();
  }, []);

  const register = async (email, password, full_name) => {
    const response = await authAPI.register({ email, password, full_name });
    return response.data;
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user: userData, session: sessionData } = response.data;
    setUser(userData);
    setSession(sessionData);
    localStorage.setItem('supabase_session', JSON.stringify(sessionData));
    return response.data;
  };

  // Merge partial fields into the user object and persist to localStorage
  const updateUser = (patches) => {
    setUser((prev) => {
      const updated = { ...prev, ...patches };
      const storedSession = localStorage.getItem('supabase_session');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          parsedSession.user = { ...(parsedSession.user || {}), ...patches };
          localStorage.setItem('supabase_session', JSON.stringify(parsedSession));
        } catch { /* ignore */ }
      }
      return updated;
    });
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem('supabase_session');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, session, loading, isAuthenticated: !!user, isAdmin, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
