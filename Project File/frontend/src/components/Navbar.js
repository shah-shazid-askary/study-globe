import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const name = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  return (
    <nav className="bg-blue-700 dark:bg-gray-800 text-white shadow-lg transition-colors duration-300 fixed top-0 left-0 right-0 h-16 z-50">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo and Hamburger Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl hover:bg-blue-600 dark:hover:bg-gray-700 transition-colors active:scale-95"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to="/" className="text-2xl font-black tracking-tight select-none">
            StudyGlobe
          </Link>
        </div>

        {/* Global Controls & User Action Center */}
        <div className="flex items-center gap-3 font-semibold">
          {isAuthenticated ? (
            <>
              {/* Notification Bell Widget */}
              <button 
                onClick={() => navigate('/applications')}
                className="relative p-2 rounded-full hover:bg-blue-600 dark:hover:bg-gray-700 transition-colors hidden sm:block"
                title="Action Alerts"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-700 dark:border-gray-800" />
              </button>

              <span className="text-xs text-blue-100 hidden md:inline-block font-bold">
                {name}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                {t('navLogout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 dark:hover:text-blue-400 text-xs md:text-sm transition-colors">{t('navLogin')}</Link>
              <Link
                to="/register"
                className="bg-white text-blue-700 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold hover:bg-blue-50 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500 transition-all hover:scale-105 active:scale-95"
              >
                {t('navRegister')}
              </Link>
            </>
          )}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 dark:bg-gray-700 dark:hover:bg-gray-600 border border-blue-500 dark:border-gray-600 text-xs font-black uppercase tracking-wider transition-colors active:scale-95"
            title="Toggle Language / ভাষা পরিবর্তন"
          >
            {lang === 'en' ? 'বাংলা' : 'EN'}
          </button>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-blue-600 dark:hover:bg-gray-700 transition-all active:scale-90"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
