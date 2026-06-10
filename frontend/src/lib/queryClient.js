import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const queryKeys = {
  profile: ['profile'],
  tasks: ['tasks'],
  documents: ['documents'],
  predeparture: ['predeparture'],
  countries: ['countries'],
  universities: (params = {}) => ['universities', params],
  university: (id) => ['university', id],
  programs: (filters = {}) => ['programs', filters],
  programsFields: ['programs', 'fields'],
  resources: ['resources'],
  users: ['admin', 'users'],
  analytics: ['admin', 'analytics'],
};
