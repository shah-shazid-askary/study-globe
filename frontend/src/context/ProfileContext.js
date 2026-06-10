import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const syncAuthFromProfile = useCallback((data) => {
    if (!data) return;
    updateUser({
      full_name: data.full_name,
      role: data.role || 'student',
    });
  }, [updateUser]);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) return null;
    setLoading(true);
    setError(null);
    try {
      const res = await profileAPI.get();
      const data = res.data ?? null;
      setProfile(data);
      syncAuthFromProfile(data);
      return data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, syncAuthFromProfile]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await profileAPI.get();
        if (cancelled) return;
        const data = res.data ?? null;
        setProfile(data);
        syncAuthFromProfile(data);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, authLoading, syncAuthFromProfile]);

  const updateProfile = useCallback(async (data) => {
    const res = await profileAPI.update(data);
    const updated = res.data ?? { ...(profile || {}), ...data };
    setProfile(updated);
    syncAuthFromProfile(updated);
    return updated;
  }, [profile, syncAuthFromProfile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, refreshProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};

export default ProfileContext;
