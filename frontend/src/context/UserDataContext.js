import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import {
  useProfileQuery,
  useTasksQuery,
  useDocumentsQuery,
  usePredepartureQuery,
} from '../hooks/useAppQueries';
import { queryKeys } from '../lib/queryClient';

const UserDataContext = createContext(null);

export const UserDataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const enabled = isAuthenticated;

  const profileQuery = useProfileQuery(enabled);
  const tasksQuery = useTasksQuery(enabled);
  const documentsQuery = useDocumentsQuery(enabled);
  const predepartureQuery = usePredepartureQuery(enabled);

  const refreshUserData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    queryClient.invalidateQueries({ queryKey: queryKeys.documents });
    queryClient.invalidateQueries({ queryKey: queryKeys.predeparture });
  }, [queryClient]);

  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.removeQueries({ queryKey: queryKeys.profile });
      queryClient.removeQueries({ queryKey: queryKeys.tasks });
      queryClient.removeQueries({ queryKey: queryKeys.documents });
      queryClient.removeQueries({ queryKey: queryKeys.predeparture });
      return undefined;
    }

    const poll = () => {
      if (document.visibilityState === 'visible') {
        refreshUserData();
      }
    };

    const timer = setInterval(poll, 60 * 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated, refreshUserData]);

  const loading =
    enabled &&
    (profileQuery.isLoading ||
      tasksQuery.isLoading ||
      documentsQuery.isLoading ||
      predepartureQuery.isLoading);

  return (
    <UserDataContext.Provider
      value={{
        profile: profileQuery.data ?? null,
        tasks: tasksQuery.data ?? [],
        documents: documentsQuery.data ?? [],
        predeparture: predepartureQuery.data ?? [],
        loading,
        refreshUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used within a UserDataProvider');
  return context;
};

export default UserDataContext;
