import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { t, lang } = useLanguage();

  if (!isAuthenticated) return null;

  const links = [
    {
      to: '/dashboard',
      label: t('navDashboard'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    },
    {
      to: '/countries',
      label: t('navCountries'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    },
    {
      to: '/universities',
      label: t('navUniversities'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      )
    },
    {
      to: '/programs',
      label: t('navPrograms'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )
    },
    {
      to: '/applications',
      label: t('taskManagerTitle'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 12l2 2 4-4" />
          <path d="M9 16h6" />
        </svg>
      )
    },
    {
      to: '/predeparture',
      label: t('prepTitle'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l8 2.5z" />
        </svg>
      )
    },
    {
      to: '/resources',
      label: lang === 'en' ? 'Prep Resources' : 'প্রস্তুতি রিসোর্স',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    },
    {
      to: '/profile',
      label: t('navProfile'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white/95 dark:bg-gray-900/95 border-r border-gray-150 dark:border-gray-800 pt-16 transform transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-4rem)] backdrop-blur-md ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full px-4 py-6 overflow-y-auto flex flex-col justify-between">
          <ul className="space-y-1.5 font-semibold">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => {
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-xl text-sm font-bold tracking-tight transition-all duration-300 hover:scale-[1.02] ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/15 dark:to-indigo-500/15 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-500 shadow-sm shadow-blue-500/5'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-blue-600 dark:hover:text-blue-400'
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
              <li className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="px-3 text-xs font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                  {lang === 'en' ? 'Administration' : 'এডমিন প্যানেল'}
                </span>
                <div className="mt-2">
                  <NavLink
                    to="/admin"
                    onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                    className={({ isActive }) =>
                      `flex items-center p-2.5 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.01] ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/15 dark:to-yellow-500/15 text-amber-700 dark:text-amber-400 border-l-4 border-amber-600 dark:border-amber-500'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-amber-600 dark:hover:text-amber-400'
                      }`
                    }
                  >
                    <svg className="w-4 h-4 mr-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Dashboard
                  </NavLink>
                </div>
              </li>
            )}
          </ul>

          {/* Quick Stats Summary Widget */}
          <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/60 dark:from-gray-800/60 dark:to-gray-800/20 p-4 rounded-2xl border border-blue-100/50 dark:border-gray-800 hidden lg:block backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <h4 className="text-xs font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">
                Study<span className="text-blue-600 dark:text-blue-300 font-black">Globe</span>
              </h4>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
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
