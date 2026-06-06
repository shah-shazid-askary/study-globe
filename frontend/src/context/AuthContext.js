import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // persist session and sync user details (full_name, role) from backend on mount
  useEffect(() => {
    const loadSession = async () => {
      const stored = localStorage.getItem('supabase_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSession(parsed);
          setUser(parsed?.user || null);

          // Asynchronously query the fresh profile to update the role and name
          const res = await profileAPI.get();
          if (res?.data) {
            const freshUser = {
              ...parsed.user,
              full_name: res.data.full_name || parsed.user.full_name,
              role: res.data.role || parsed.user.role || 'student'
            };
            setUser(freshUser);
            parsed.user = freshUser;
            localStorage.setItem('supabase_session', JSON.stringify(parsed));
          }
        } catch (err) {
          console.error('Failed to sync user session role on load:', err);
        }
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
      // Keep localStorage in sync so refresh also picks up the new name
      const storedSession = localStorage.getItem('supabase_session');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          parsed.user = { ...(parsed.user || {}), ...patches };
          localStorage.setItem('supabase_session', JSON.stringify(parsed));
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
