import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { tasksAPI, documentsAPI, profileAPI, predepartureAPI } from '../services/api';

const Navbar = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [docUrlInput, setDocUrlInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [popupSuccess, setPopupSuccess] = useState('');
  const [popupError, setPopupError] = useState('');

  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsOpenNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const [tasksRes, docsRes, profileRes, prepRes] = await Promise.all([
        tasksAPI.getAll().catch(() => ({ data: [] })),
        documentsAPI.getAll().catch(() => ({ data: [] })),
        profileAPI.get().catch(() => ({ data: null })),
        predepartureAPI.get().catch(() => ({ data: [] }))
      ]);

      const list = [];

      // 1. Process tasks (deadlines)
      const tasks = tasksRes.data || [];
      tasks.forEach(task => {
        if (task.status !== 'completed' && task.due_date) {
          const due = new Date(task.due_date);
          const diffTime = due - new Date();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 7) {
            list.push({
              id: `task-${task.id}`,
              title: lang === 'en' ? 'Upcoming Deadline' : 'আসন্ন শেষ সময়',
              detail: lang === 'en' 
                ? `Task "${task.title}" is due on ${task.due_date}` 
                : `কাজের শেষ সময় ${task.due_date} ("${task.title}")`,
              type: 'task',
              isUrgent: diffDays <= 2,
              date: task.due_date,
              taskObj: task
            });
          }
        }
      });

      // 2. Process documents
      const docs = docsRes.data || [];
      const requiredTypes = [
        'Statement of Purpose (SOP)', 
        'Letter of Recommendation 1 (LOR 1)', 
        'Letter of Recommendation 2 (LOR 2)', 
        'Academic Transcript', 
        'Passport Copy'
      ];
      
      requiredTypes.forEach(docType => {
        const found = docs.find(d => d.document_type === docType);
        if (!found || found.status === 'missing') {
          list.push({
            id: `doc-missing-${docType}`,
            title: lang === 'en' ? 'Missing Document' : 'অনুপস্থিত নথিপত্র',
            detail: lang === 'en' 
              ? `Please upload your ${docType}` 
              : `দয়া করে আপনার ${docType} আপলোড করুন`,
            type: 'document',
            status: 'missing',
            docType: docType,
            isUrgent: false
          });
        } else if (found.status === 'uploaded') {
          list.push({
            id: `doc-verify-${found.id}`,
            title: lang === 'en' ? 'Verification Pending' : 'যাচাইকরণ পেন্ডিং',
            detail: lang === 'en' 
              ? `${docType} is uploaded and waiting for review` 
              : `${docType} আপলোড করা হয়েছে এবং যাচাইয়ের অপেক্ষায় আছে`,
            type: 'document',
            status: 'uploaded',
            docType: docType,
            isUrgent: false
          });
        }
      });

      // 3. Process profile completeness
      const p = profileRes?.data;
      if (p) {
        const fields = [
          { name: 'Full Name', val: p.full_name },
          { name: 'Date of Birth', val: p.date_of_birth },
          { name: 'Phone', val: p.phone },
          { name: 'Education Level', val: p.current_education_level },
          { name: 'Field of Interest', val: p.field_of_interest },
          { name: 'Preferred Countries', val: p.preferred_countries },
          { name: 'Budget Range', val: p.budget_range },
          { name: 'Target Intake', val: p.target_intake }
        ];
        const missingFields = fields.filter(f => {
          if (Array.isArray(f.val)) return f.val.length === 0;
          return f.val === null || f.val === undefined || String(f.val).trim() === '';
        }).map(f => f.name);

        if (missingFields.length > 0) {
          const pct = Math.round(((fields.length - missingFields.length) / fields.length) * 100);
          list.push({
            id: 'profile-incomplete',
            title: lang === 'en' ? 'Profile Incomplete' : 'প্রোফাইল অসম্পূর্ণ',
            detail: lang === 'en'
              ? `Your profile is only ${pct}% complete. Missing details required for AI admission roadmaps.`
              : `আপনার প্রোফাইল মাত্র ${pct}% সম্পূর্ণ। এআই রোডম্যাপ পাওয়ার জন্য প্রয়োজনীয় বিবরণগুলি যুক্ত করুন।`,
            type: 'profile',
            isUrgent: false,
            missingFields: missingFields,
            pct: pct
          });
        }
      }

      // 4. Process pre-departure tasks
      const prepItems = prepRes.data || [];
      const incompletePrep = prepItems.filter(item => !item.is_completed);
      incompletePrep.forEach(item => {
        list.push({
          id: `prep-${item.id}`,
          title: lang === 'en' ? 'Travel Prep Pending' : 'ভ্রমণ প্রস্তুতি পেন্ডিং',
          detail: lang === 'en'
            ? `Reminder: Complete step "${item.title}" for your departure checklist.`
            : `অনুস্মারক: আপনার ভ্রমণ চেকলিস্টের "${item.title}" ধাপটি সম্পন্ন করুন।`,
          type: 'predeparture',
          isUrgent: false,
          prepItem: item
        });
      });

      setNotifications(list);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const timer = setInterval(fetchNotifications, 30000);
      return () => clearInterval(timer);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, lang]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCompleteTask = async (taskObj) => {
    setIsUpdating(true);
    setPopupError('');
    setPopupSuccess('');
    try {
      await tasksAPI.update(taskObj.id, { ...taskObj, status: 'completed' });
      setPopupSuccess(lang === 'en' ? 'Task completed!' : 'টাস্ক সম্পন্ন হয়েছে!');
      setTimeout(() => {
        setSelectedNotification(null);
        setPopupSuccess('');
      }, 1500);
      fetchNotifications();
    } catch (err) {
      setPopupError(lang === 'en' ? 'Failed to complete task.' : 'টাস্ক সম্পন্ন করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitDoc = async (docType) => {
    if (!docUrlInput.trim()) return;
    setIsUpdating(true);
    setPopupError('');
    setPopupSuccess('');
    try {
      await documentsAPI.submit({ document_type: docType, google_drive_url: docUrlInput });
      setPopupSuccess(lang === 'en' ? 'Document link submitted!' : 'ডকুমেন্ট লিঙ্ক জমা দেওয়া হয়েছে!');
      setDocUrlInput('');
      setTimeout(() => {
        setSelectedNotification(null);
        setPopupSuccess('');
      }, 1500);
      fetchNotifications();
    } catch (err) {
      setPopupError(err.response?.data?.error || (lang === 'en' ? 'Failed to submit document' : 'ডকুমেন্ট জমা দিতে ব্যর্থ হয়েছে'));
    } finally {
      setIsUpdating(false);
    }
  };

  const name = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 text-gray-800 dark:text-white shadow-sm border-b border-gray-150/70 dark:border-gray-800/80 backdrop-blur-lg transition-all duration-300 fixed top-0 left-0 right-0 h-16 z-50">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo and Hamburger Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            {/* Premium Logo Mark */}
            <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 dark:from-blue-500 dark:to-indigo-600 shadow-md shadow-blue-500/25 dark:shadow-indigo-500/10 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/35 transition-all duration-300">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" className="opacity-80" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" className="opacity-95" />
              </svg>
              {/* Outer decorative ring */}
              <div className="absolute -inset-1 rounded-2xl border border-blue-500/35 dark:border-blue-400/25 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
            </div>
            {/* Brand Typography */}
            <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors duration-250">
              Study<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-650 dark:from-blue-450 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:animate-pulse">Globe</span>
            </span>
          </Link>
        </div>

        {/* Global Controls & User Action Center */}
        <div className="flex items-center gap-3 font-semibold">
          {isAuthenticated ? (
            <>
              {/* Notification Bell Widget with Dropdown Popup (now available on mobile and desktop) */}
              <div className="relative shrink-0" ref={notificationsRef}>
                <button 
                  onClick={() => setIsOpenNotifications(!isOpenNotifications)}
                  className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Action Alerts"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                  )}
                </button>

                {/* Dropdown Popup */}
                {isOpenNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 overflow-hidden z-50 animate-fadeIn">
                    <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex justify-between items-center">
                      <span className="font-extrabold text-xs uppercase tracking-wider">
                        {lang === 'en' ? 'Notifications' : 'বিজ্ঞপ্তি সমূহ'} ({notifications.length})
                      </span>
                      <button 
                        onClick={() => {
                          setIsOpenNotifications(false);
                          navigate('/applications');
                        }}
                        className="text-xs text-blue-100 hover:text-white underline font-bold"
                      >
                        {lang === 'en' ? 'View Planner' : 'প্ল্যানার দেখুন'}
                      </button>
                    </div>
                    
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-105 dark:divide-gray-800">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
                          {lang === 'en' ? 'No urgent notifications' : 'কোন নতুন বিজ্ঞপ্তি নেই'} 🎉
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              setIsOpenNotifications(false);
                              setSelectedNotification(notif);
                              setDocUrlInput('');
                              setPopupSuccess('');
                              setPopupError('');
                            }}
                            className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors flex gap-2.5 items-start"
                          >
                            <span className="text-xl select-none">
                              {notif.type === 'task' ? (notif.isUrgent ? '🚨' : '📅') : notif.type === 'profile' ? '👤' : notif.type === 'predeparture' ? '✈️' : '📝'}
                            </span>
                            <div className="space-y-0.5">
                              <p className={`text-[10px] font-black uppercase tracking-wider ${notif.isUrgent ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-snug">
                                {notif.detail}
                              </p>
                              {notif.date && (
                                <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold uppercase">
                                  {lang === 'en' ? 'Due:' : 'শেষ সময়:'} {notif.date}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-xs text-gray-600 dark:text-gray-300 hidden md:inline-block font-extrabold">
                {name}
              </span>

              <button
                onClick={handleLogout}
                className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-250/20 dark:border-rose-950/30 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                {t('navLogout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs md:text-sm transition-colors">{t('navLogin')}</Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                {t('navRegister')}
              </Link>
            </>
          )}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-200 text-xs font-black uppercase tracking-wider transition-colors active:scale-95 shadow-sm"
            title="Toggle Language / ভাষা পরিবর্তন"
          >
            {lang === 'en' ? 'বাংলা' : 'EN'}
          </button>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
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

      {/* Modern Overlay Action Modal ("Mini box pops up") */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden text-gray-800 dark:text-gray-100 flex flex-col transform transition-transform scale-100">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {selectedNotification.type === 'task' ? '📅' : selectedNotification.type === 'profile' ? '👤' : selectedNotification.type === 'predeparture' ? '🛫' : '📝'}
                </span>
                <span className="font-extrabold text-xs uppercase tracking-wider">
                  {selectedNotification.title}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="text-white hover:text-gray-200 text-xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-relaxed">
                {selectedNotification.detail}
              </p>

              {/* Status and Notifications Feedback Toasts */}
              {popupSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-bold border border-green-200 dark:border-green-800 animate-pulse">
                  ✅ {popupSuccess}
                </div>
              )}
              {popupError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800">
                  ❌ {popupError}
                </div>
              )}

              {/* Dynamic Interactive Fields based on notification type */}
              {selectedNotification.type === 'task' && (
                <div className="pt-2">
                  <button
                    disabled={isUpdating}
                    onClick={() => handleCompleteTask(selectedNotification.taskObj)}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
                  >
                    {isUpdating ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : '✅'} {lang === 'en' ? 'Mark as Completed' : 'সম্পন্ন হিসেবে চিহ্নিত করুন'}
                  </button>
                </div>
              )}

              {selectedNotification.type === 'document' && selectedNotification.status === 'missing' && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {lang === 'en' ? 'Google Drive Link' : 'গুগল ড্রাইভ লিংক'}
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={docUrlInput}
                      onChange={(e) => setDocUrlInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:outline-none transition-all dark:text-white"
                    />
                  </div>
                  <button
                    disabled={isUpdating || !docUrlInput.trim()}
                    onClick={() => handleSubmitDoc(selectedNotification.docType)}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
                  >
                    {isUpdating ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : '📤'} {lang === 'en' ? 'Submit Document Link' : 'ডকুমেন্ট লিঙ্ক জমা দিন'}
                  </button>
                </div>
              )}

              {selectedNotification.type === 'profile' && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedNotification(null);
                      navigate('/profile');
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
                  >
                    👤 {lang === 'en' ? 'Go to Profile' : 'প্রোফাইলে যান'}
                  </button>
                </div>
              )}

              {selectedNotification.type === 'predeparture' && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedNotification(null);
                      navigate('/predeparture');
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2"
                  >
                    ✈️ {lang === 'en' ? 'Open Travel Prep' : 'ভ্রমণ প্রস্তুতি খুলুন'}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-150 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-750 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 font-bold rounded-xl text-xs transition-colors"
              >
                {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
              </button>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
