import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { t, lang } = useLanguage();

  if (!isAuthenticated) return null;

  const links = [
    { to: '/dashboard', label: t('navDashboard'), icon: '📊' },
    { to: '/countries', label: t('navCountries'), icon: '🌍' },
    { to: '/universities', label: t('navUniversities'), icon: '🎓' },
    { to: '/programs', label: t('navPrograms'), icon: '📚' },
    { to: '/applications', label: t('taskManagerTitle'), icon: '📋' },
    { to: '/predeparture', label: t('prepTitle'), icon: '✈️' },
    { to: '/resources', label: lang === 'en' ? 'Prep Resources' : 'প্রস্তুতি রিসোর্স', icon: '📖' },
    { to: '/profile', label: t('navProfile'), icon: '👤' },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-150 dark:border-gray-700 pt-16 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto flex flex-col justify-between">
          <ul className="space-y-2 font-medium">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => {
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`
                  }
                >
                  <span className="text-xl mr-3 shrink-0">{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </NavLink>
              </li>
            ))}

            {/* Admin Section Indicator */}
            {isAdmin && (
              <li className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="px-3 text-xs font-black tracking-wider text-yellow-600 dark:text-yellow-400 uppercase">
                  {lang === 'en' ? 'Administration' : 'এডমিন প্যানেল'}
                </span>
                <div className="mt-2 space-y-1">
                  <NavLink
                    to="/admin"
                    onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                    className={({ isActive }) =>
                      `flex items-center p-2.5 rounded-lg text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`
                    }
                  >
                    <span className="mr-2">⚙️</span> Dashboard
                  </NavLink>
                </div>
              </li>
            )}
          </ul>

          {/* Quick Stats Summary Widget */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900/50 dark:to-gray-900/20 p-4 rounded-2xl border border-blue-100 dark:border-gray-700 hidden lg:block">
            <h4 className="text-xs font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider mb-1">
              StudyGlobe
            </h4>
            <p className="text-[10px] text-blue-700 dark:text-gray-400 leading-snug">
              {lang === 'en' 
                ? 'Your comprehensive preparation portal. Connect with advisor bot anytime.' 
                : 'আপনার প্রস্তুতি বৃদ্ধির কেন্দ্রীভূত পোর্টাল। যেকোনো সময় চ্যাটবট সাহায্য নিন।'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
