import { lazy } from 'react';
import {
  countriesAPI,
  universitiesAPI,
  programsAPI,
  profileAPI,
  tasksAPI,
  documentsAPI,
  predepartureAPI,
  resourcesAPI,
} from '../services/api';

export const Login = lazy(() => import('../pages/Login'));
export const Register = lazy(() => import('../pages/Register'));
export const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
export const ResetPassword = lazy(() => import('../pages/ResetPassword'));
export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const Countries = lazy(() => import('../pages/Countries'));
export const Universities = lazy(() => import('../pages/Universities'));
export const UniversityDetails = lazy(() => import('../pages/UniversityDetails'));
export const Programs = lazy(() => import('../pages/Programs'));
export const Profile = lazy(() => import('../pages/Profile'));
export const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
export const AdminUsers = lazy(() => import('../pages/AdminUsers'));
export const AdminAnalytics = lazy(() => import('../pages/AdminAnalytics'));
export const Landing = lazy(() => import('../pages/Landing'));
export const Privacy = lazy(() => import('../pages/Privacy'));
export const Terms = lazy(() => import('../pages/Terms'));
export const ApplicationsPage = lazy(() => import('../pages/ApplicationsPage'));
export const ResourcesPage = lazy(() => import('../pages/ResourcesPage'));
export const PreDeparturePage = lazy(() => import('../pages/PreDeparturePage'));
export const ChatBot = lazy(() => import('../components/ChatBot'));

const prefetchLoaders = {
  '/dashboard': () => import('../pages/Dashboard'),
  '/countries': () => import('../pages/Countries'),
  '/universities': () => import('../pages/Universities'),
  '/programs': () => import('../pages/Programs'),
  '/applications': () => import('../pages/ApplicationsPage'),
  '/predeparture': () => import('../pages/PreDeparturePage'),
  '/resources': () => import('../pages/ResourcesPage'),
  '/profile': () => import('../pages/Profile'),
  '/admin': () => import('../pages/AdminDashboard'),
};

const dataPrefetchers = {
  '/dashboard': () =>
    Promise.all([
      profileAPI.get(),
      tasksAPI.getAll(),
      documentsAPI.getAll(),
      predepartureAPI.get(),
    ]),
  '/countries': () => countriesAPI.getAll(),
  '/universities': () => Promise.all([universitiesAPI.getAll(), profileAPI.get()]),
  '/programs': () => programsAPI.getAll({}),
  '/applications': () =>
    Promise.all([tasksAPI.getAll(), documentsAPI.getAll(), profileAPI.get()]),
  '/predeparture': () => predepartureAPI.get(),
  '/resources': () => resourcesAPI.getAll(),
  '/profile': () => profileAPI.get(),
};

export const prefetchRoute = (path) => {
  prefetchLoaders[path]?.();
  dataPrefetchers[path]?.();
};
