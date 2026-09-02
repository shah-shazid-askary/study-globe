import { useQuery } from '@tanstack/react-query';
import {
  profileAPI,
  tasksAPI,
  documentsAPI,
  predepartureAPI,
  countriesAPI,
  universitiesAPI,
  programsAPI,
  resourcesAPI,
  usersAPI,
  analyticsAPI,
} from '../services/api';
import { queryKeys } from '../lib/queryClient';
import { useAuth } from '../context/AuthContext';

const STALE = {
  profile: 2 * 60 * 1000,
  tasks: 60 * 1000,
  documents: 60 * 1000,
  predeparture: 2 * 60 * 1000,
  countries: 10 * 60 * 1000,
  universities: 5 * 60 * 1000,
  programs: 5 * 60 * 1000,
  resources: 10 * 60 * 1000,
  users: 2 * 60 * 1000,
  analytics: 30 * 1000,
};

export const useProfileQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => profileAPI.get().then((r) => r.data),
    staleTime: STALE.profile,
    enabled,
  });

export const useTasksQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => tasksAPI.getAll().then((r) => r.data),
    staleTime: STALE.tasks,
    enabled,
  });

export const useDocumentsQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => documentsAPI.getAll().then((r) => r.data),
    staleTime: STALE.documents,
    enabled,
  });

export const usePredepartureQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.predeparture,
    queryFn: () => predepartureAPI.get().then((r) => r.data),
    staleTime: STALE.predeparture,
    enabled,
  });

export const useCountriesQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.countries,
    queryFn: () => countriesAPI.getAll().then((r) => r.data),
    staleTime: STALE.countries,
    enabled,
  });

export const useUniversitiesQuery = (params = {}, enabled = true) =>
  useQuery({
    queryKey: queryKeys.universities(params),
    queryFn: () => universitiesAPI.getAll(params).then((r) => r.data),
    staleTime: STALE.universities,
    enabled,
  });

export const useUniversityQuery = (id, enabled = true) =>
  useQuery({
    queryKey: queryKeys.university(id),
    queryFn: () => universitiesAPI.getById(id).then((r) => r.data),
    staleTime: STALE.universities,
    enabled: enabled && !!id,
  });

export const useProgramsQuery = (filters = {}, enabled = true) =>
  useQuery({
    queryKey: queryKeys.programs(filters),
    queryFn: () => {
      const params = {};
      if (filters.degree_level) params.degree_level = filters.degree_level;
      if (filters.field) params.field = filters.field;
      return programsAPI.getAll(params).then((r) => r.data);
    },
    staleTime: STALE.programs,
    enabled,
  });

export const useProgramFieldsQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.programsFields,
    queryFn: () =>
      programsAPI.getAll({}).then((r) => {
        const all = r.data.map((p) => p.field).filter(Boolean);
        return [...new Set(all)].sort();
      }),
    staleTime: STALE.programs,
    enabled,
  });

export const useResourcesQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.resources,
    queryFn: () => resourcesAPI.getAll().then((r) => r.data),
    staleTime: STALE.resources,
    enabled,
  });

export const useUsersQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.users,
    queryFn: () => usersAPI.getAll().then((r) => r.data),
    staleTime: STALE.users,
    enabled,
  });

export const useAnalyticsQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => analyticsAPI.getSystemMetrics().then((r) => r.data),
    staleTime: STALE.analytics,
    refetchInterval: 15 * 1000,
    enabled,
  });

export const useAuthenticatedQueries = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};
