import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Countries from './pages/Countries';
import Universities from './pages/Universities';
import UniversityDetails from './pages/UniversityDetails';
import Programs from './pages/Programs';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminDataManagement from './pages/AdminDataManagement';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import ApplicationsPage from './pages/ApplicationsPage';
import ResourcesPage from './pages/ResourcesPage';
import PreDeparturePage from './pages/PreDeparturePage';

// FIX: AuthProvider must be INSIDE Router so child hooks (useNavigate) work correctly
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-gray-50 transition-colors duration-300 dark:bg-gray-900">
              {/* Minimalist Top Header */}
              <Navbar toggleSidebar={toggleSidebar} />
              
              {/* Left Sidebar and Main Layout */}
              <div className="flex flex-row pt-16 flex-1 h-full min-h-[calc(100vh-4rem)]">
                <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
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
                    {/* FIX: /universities/:id route was missing */}
                    <Route path="/universities/:id" element={<ProtectedRoute><UniversityDetails /></ProtectedRoute>} />
                    <Route path="/programs" element={<ProtectedRoute><Programs /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
                    <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
                    <Route path="/predeparture" element={<ProtectedRoute><PreDeparturePage /></ProtectedRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                    <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
                    <Route path="/admin/data" element={<AdminRoute><AdminDataManagement /></AdminRoute>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
              
              {/* Floating AI chatbot — visible to logged-in users on all pages */}
              <ChatBot />
              <Footer />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}
export default App;
