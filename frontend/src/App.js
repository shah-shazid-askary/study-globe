import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { UserDataProvider } from './context/UserDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { queryClient } from './lib/queryClient';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PageSpinner from './components/PageSpinner';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Countries = lazy(() => import('./pages/Countries'));
const Universities = lazy(() => import('./pages/Universities'));
const UniversityDetails = lazy(() => import('./pages/UniversityDetails'));
const Programs = lazy(() => import('./pages/Programs'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const Landing = lazy(() => import('./pages/Landing'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const PreDeparturePage = lazy(() => import('./pages/PreDeparturePage'));

function AppContent({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 transition-colors duration-300 dark:bg-gray-900">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="flex flex-row pt-16 flex-1 h-full min-h-[calc(100vh-4rem)]">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/countries" element={<ProtectedRoute><Countries /></ProtectedRoute>} />
              <Route path="/universities" element={<ProtectedRoute><Universities /></ProtectedRoute>} />
              <Route path="/universities/:id" element={<ProtectedRoute><UniversityDetails /></ProtectedRoute>} />
              <Route path="/programs" element={<ProtectedRoute><Programs /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
              <Route path="/predeparture" element={<ProtectedRoute><PreDeparturePage /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      <ChatBot />
      {isLanding && <Footer />}
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <UserDataProvider>
                <AppContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              </UserDataProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
