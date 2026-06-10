import React, { useState, useMemo, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { profileAPI } from '../services/api';
import AccordionCard from '../components/AccordionCard';

const SopReviewSection = React.lazy(() => import('../components/SopReviewSection'));
const LorReviewSection = React.lazy(() => import('../components/LorReviewSection'));

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, tasks, documents, predeparture, loading: loadingMetrics } = useUserData();
  const { t, lang } = useLanguage();
  const name = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  const profileProgress = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      profile.full_name,
      profile.date_of_birth,
      profile.phone,
      profile.current_education_level,
      profile.field_of_interest,
      profile.preferred_countries,
      profile.budget_range,
      profile.target_intake,
    ];
    const filled = fields.filter((f) => {
      if (Array.isArray(f)) return f.length > 0;
      return f !== null && f !== undefined && String(f).trim() !== '';
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const taskProgress = useMemo(() => {
    const tList = tasks || [];
    return { completed: tList.filter((task) => task.status === 'completed').length, total: tList.length };
  }, [tasks]);

  const docProgress = useMemo(() => {
    const dList = documents || [];
    const uploadedDocs = dList.filter((d) => d.status === 'uploaded' || d.status === 'verified').length;
    return { submitted: uploadedDocs, total: 5 };
  }, [documents]);

  const prepProgress = useMemo(() => {
    const prList = predeparture || [];
    const completedPrep = prList.filter((item) => item.is_completed).length;
    return { completed: completedPrep, total: 5 };
  }, [predeparture]);
  
  // Dashboard & Roadmap loading/ui states
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');
  const [roadmapResult, setRoadmapResult] = useState('');
  
  // Collapsible accordion visibility states
  const [isSopOpen, setIsSopOpen] = useState(false);
  const [isLorOpen, setIsLorOpen] = useState(false);

  const overallCompleteness = Math.round(
    (profileProgress * 0.25) +
    ((taskProgress.total > 0 ? (taskProgress.completed / taskProgress.total) * 100 : 0) * 0.25) +
    ((docProgress.submitted / docProgress.total) * 100 * 0.25) +
    ((prepProgress.completed / prepProgress.total) * 100 * 0.25)
  );

  const handleGenerateRoadmap = async () => {
    if (profileProgress < 100) {
      setRoadmapError(
        lang === 'en'
          ? 'Please complete your profile information (100%) before generating personalized recommendations.'
          : 'ব্যক্তিগতকৃত সুপারিশ পাওয়ার আগে অনুগ্রহ করে আপনার প্রোফাইলের তথ্য সম্পূর্ণ (১০০%) করুন।'
      );
      return;
    }

    setLoadingRoadmap(true);
    setRoadmapError('');
    setRoadmapResult('');

    try {
      const res = await profileAPI.getRecommendations();
      setRoadmapResult(res.data.recommendations || 'No roadmap content returned.');
    } catch (err) {
      setRoadmapError(err.response?.data?.error || 'Failed to generate recommendations. Please try again.');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  return (
    <div className="relative space-y-8 dark:text-gray-100 pb-12">
      {/* Background ambient light effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10 dark:bg-blue-500/10"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10 dark:bg-purple-500/10"></div>
      
      {/* Welcome Title & Header Panel */}
      <div className="relative bg-white dark:bg-gray-800/40 backdrop-blur-xl border border-gray-150 dark:border-white/5 p-6 md:p-8 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9.963 8.282A7.856 7.856 0 0 0 12 3a7.856 7.856 0 0 0 2.037 5.282A7.856 7.856 0 0 0 19.32 10 7.856 7.856 0 0 0 14.037 11.718 7.856 7.856 0 0 0 12 17a7.856 7.856 0 0 0-2.037-5.282 7.856 7.856 0 0 0-5.282-2.037 7.856 7.856 0 0 0 5.282-2.037z" />
            </svg>
            <span>{lang === 'en' ? 'Welcome back to study abroad portal' : 'উচ্চশিক্ষা পোর্টালে আপনাকে স্বাগতম'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t('dashWelcome', { name })}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl">
            {lang === 'en' 
              ? 'Here is a live summary of your study abroad application progress.' 
              : 'আপনার উচ্চশিক্ষা আবেদনের অগ্রগতির একটি লাইভ সারসংক্ষেপ নিচে দেওয়া হলো।'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-4 py-3 rounded-2xl relative z-10 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{lang === 'en' ? 'Today' : 'আজ'}</p>
            <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200">
              {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {loadingMetrics ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-100 dark:border-gray-800 border-t-blue-600 dark:border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">AI</div>
          </div>
        </div>
      ) : (
        <>
          {/* Overall Journey Roadmap */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden">
            {/* Glowing highlights */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -translate-y-12 translate-x-12"></div>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 relative z-10">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest uppercase text-blue-100 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                  <span>{lang === 'en' ? 'Admission Journey' : 'ভর্তি যাত্রা'}</span>
                </span>
                <h3 className="font-extrabold text-xl md:text-2xl text-white mt-2">
                  {lang === 'en' ? 'Your Admission Roadmap' : 'আপনার ভর্তি রোডম্যাপ'}
                </h3>
                <p className="text-xs text-blue-100/80 mt-1">
                  {lang === 'en' ? 'Complete each stage to prepare for international enrollment.' : 'আন্তর্জাতিক ভর্তির জন্য প্রস্তুত হতে প্রতিটি ধাপ পূরণ করুন।'}
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <div className="text-3xl md:text-4xl font-black text-white leading-none">
                  {overallCompleteness}%
                </div>
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider mt-1">
                  {lang === 'en' ? 'Journey Completed' : 'ভ্রমণ প্রস্তুত'}
                </p>
              </div>
            </div>

            {/* Roadmap Progress Timeline */}
            <div className="relative z-10 mt-8">
              {/* Connecting Line background */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-white/20 rounded-full"></div>
              {/* Active Line */}
              <div 
                style={{ width: `${overallCompleteness}%` }}
                className="absolute top-5 left-0 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-1000 ease-out"
              ></div>

              {/* Steps list */}
              <div className="grid grid-cols-4 relative">
                {[
                  {
                    label: lang === 'en' ? 'Profile Setup' : 'প্রোফাইল সেটআপ',
                    icon: (colorClass) => (
                      <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ),
                    active: profileProgress > 0,
                    complete: profileProgress === 100,
                    subtitle: `${profileProgress}%`
                  },
                  {
                    label: lang === 'en' ? 'Docs Uploaded' : 'ডকুমেন্ট আপলোড',
                    icon: (colorClass) => (
                      <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                    active: docProgress.submitted > 0,
                    complete: docProgress.submitted === docProgress.total,
                    subtitle: `${docProgress.submitted}/${docProgress.total}`
                  },
                  {
                    label: lang === 'en' ? 'Tasks Checked' : 'কাজ সম্পন্ন',
                    icon: (colorClass) => (
                      <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    ),
                    active: taskProgress.completed > 0,
                    complete: taskProgress.total > 0 && taskProgress.completed === taskProgress.total,
                    subtitle: `${taskProgress.completed}/${taskProgress.total}`
                  },
                  {
                    label: lang === 'en' ? 'Ready to Fly' : 'উড্ডয়ন প্রস্তুত',
                    icon: (colorClass) => (
                      <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    ),
                    active: prepProgress.completed === 5,
                    complete: prepProgress.completed === 5,
                    subtitle: `${prepProgress.completed}/${prepProgress.total}`
                  }
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group">
                    {/* Bubble */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300 ${
                      step.complete
                        ? 'bg-white text-blue-600 shadow-[0_0_12px_rgba(255,255,255,0.5)] scale-110'
                        : step.active
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-indigo-800 text-indigo-200 border-2 border-indigo-700/50'
                    }`}>
                      {step.complete ? '✓' : step.icon(step.active ? 'text-blue-800' : 'text-indigo-200')}
                    </div>
                    
                    {/* Title & Info */}
                    <p className={`mt-3 text-[10px] sm:text-xs font-bold transition-colors duration-300 ${
                      step.active ? 'text-white font-extrabold' : 'text-blue-200/70 group-hover:text-blue-100'
                    }`}>
                      {step.label}
                    </p>
                    <span className="text-[9px] text-blue-200/50 font-medium mt-0.5">
                      {step.subtitle}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute right-4 bottom-4 text-white opacity-[0.03] select-none pointer-events-none">
              <svg className="w-32 h-32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
            </div>
          </div>

          {/* Visual Performance Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Metric Card 1: Profile Completeness */}
            <div className="group relative bg-white dark:bg-gray-800/40 backdrop-blur-xl border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <span className="bg-blue-500/10 dark:bg-blue-500/25 p-3 rounded-2xl flex items-center justify-center w-14 h-14 shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100/50 dark:border-blue-800/30">
                  {profileProgress}%
                </span>
              </div>
              <div className="mt-6 space-y-1.5 relative z-10">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {lang === 'en' ? 'Profile Completion' : 'প্রোফাইল সম্পূর্ণতা'}
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-normal min-h-[32px]">
                  {profileProgress === 100 
                    ? (lang === 'en' ? 'Profile fully set!' : 'প্রোফাইল সম্পূর্ণ!') 
                    : (lang === 'en' ? 'Fill details to match schools' : 'পছন্দের তথ্যগুলি পূরণ করুন')}
                </p>
              </div>
              
              <div className="mt-4 h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden relative z-10">
                <div 
                  style={{ width: `${profileProgress}%` }}
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-550 ease-out"
                />
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50 dark:border-white/5 relative z-10">
                <Link to="/profile" className="text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center gap-1 hover:gap-1.5 transition-all">
                  {lang === 'en' ? 'Edit Profile' : 'প্রোফাইল পরিবর্তন'} <span>→</span>
                </Link>
              </div>
            </div>

            {/* Metric Card 2: Document checklist */}
            <div className="group relative bg-white dark:bg-gray-800/40 backdrop-blur-xl border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <span className="bg-emerald-500/10 dark:bg-emerald-500/25 p-3 rounded-2xl flex items-center justify-center w-14 h-14 shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-800/30">
                  {docProgress.submitted}/{docProgress.total}
                </span>
              </div>
              <div className="mt-6 space-y-1.5 relative z-10">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                  {lang === 'en' ? 'Uploaded Documents' : 'আপলোডকৃত নথিপত্র'}
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-normal min-h-[32px]">
                  {docProgress.submitted === 5 
                    ? (lang === 'en' ? 'All documents ready!' : 'সব নথিপত্র প্রস্তুত!') 
                    : (lang === 'en' ? 'Submit Google Drive links' : 'ড্রাইভ লিঙ্কগুলি জমা দিন')}
                </p>
              </div>

              <div className="mt-4 h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden relative z-10">
                <div 
                  style={{ width: `${(docProgress.submitted / docProgress.total) * 100}%` }}
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-550 ease-out"
                />
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50 dark:border-white/5 relative z-10">
                <Link to="/applications" className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1 hover:gap-1.5 transition-all">
                  {lang === 'en' ? 'Check Documents' : 'নথিপত্র চেকলিস্ট'} <span>→</span>
                </Link>
              </div>
            </div>

            {/* Metric Card 3: Tasks manager */}
            <div className="group relative bg-white dark:bg-gray-800/40 backdrop-blur-xl border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <span className="bg-violet-500/10 dark:bg-violet-500/25 p-3 rounded-2xl flex items-center justify-center w-14 h-14 shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-7 h-7 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </span>
                <span className="text-xs font-black text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-3 py-1 rounded-full border border-violet-100/50 dark:border-violet-800/30">
                  {taskProgress.completed}/{taskProgress.total}
                </span>
              </div>
              <div className="mt-6 space-y-1.5 relative z-10">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
                  {lang === 'en' ? 'Completed Tasks' : 'সম্পন্ন কাজসমূহ'}
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-normal min-h-[32px]">
                  {taskProgress.total === 0 
                    ? (lang === 'en' ? 'No active planner tasks' : 'কোনো আবেদন কাজ নেই') 
                    : (lang === 'en' ? 'Keep managing deadlines' : 'ডেডলাইনগুলি অনুসরণ করুন')}
                </p>
              </div>

              <div className="mt-4 h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden relative z-10">
                <div 
                  style={{ width: `${taskProgress.total > 0 ? (taskProgress.completed / taskProgress.total) * 100 : 0}%` }}
                  className="h-full bg-violet-600 dark:bg-violet-500 rounded-full transition-all duration-550 ease-out"
                />
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50 dark:border-white/5 relative z-10">
                <Link to="/applications" className="text-violet-600 dark:text-violet-400 font-extrabold text-xs flex items-center gap-1 hover:gap-1.5 transition-all">
                  {lang === 'en' ? 'Open Planner' : 'পরিকল্পনাকারী খুলুন'} <span>→</span>
                </Link>
              </div>
            </div>

            {/* Metric Card 4: Pre-Departure Checkpoint */}
            <div className="group relative bg-white dark:bg-gray-800/40 backdrop-blur-xl border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <span className="bg-indigo-500/10 dark:bg-indigo-500/25 p-3 rounded-2xl flex items-center justify-center w-14 h-14 shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100/50 dark:border-indigo-800/30">
                  {prepProgress.completed}/{prepProgress.total}
                </span>
              </div>
              <div className="mt-6 space-y-1.5 relative z-10">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  {lang === 'en' ? 'Departure Readiness' : 'ভ্রমণের জন্য প্রস্তুতি'}
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-normal min-h-[32px]">
                  {prepProgress.completed === 5 
                    ? (lang === 'en' ? 'Ready for takeoff!' : 'উড্ডয়নের জন্য প্রস্তুত!') 
                    : (lang === 'en' ? 'Accommodations & flight pack' : 'বাসস্থান ও টিকিট নিশ্চিতকরণ')}
                </p>
              </div>

              <div className="mt-4 h-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden relative z-10">
                <div 
                  style={{ width: `${(prepProgress.completed / prepProgress.total) * 100}%` }}
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-550 ease-out"
                />
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50 dark:border-white/5 relative z-10">
                <Link to="/predeparture" className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center gap-1 hover:gap-1.5 transition-all">
                  {lang === 'en' ? 'Open Travel Prep' : 'ভ্রমণ প্রস্তুতি দেখুন'} <span>→</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Action Center Banner / Recommendations Box */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-3xl p-8 text-white border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="space-y-4 max-w-2xl relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                ✨ AI Engine Enabled
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {lang === 'en' ? 'Looking for personalized admission recommendations?' : 'ব্যক্তিগতকৃত ভর্তি সুপারিশ চান?'}
              </h2>
              <p className="opacity-80 text-xs md:text-sm leading-relaxed max-w-xl font-medium">
                {lang === 'en'
                  ? 'Connect your academic credentials with Gemma to generate a custom application roadmap matching your GPA, budget, and test targets.'
                  : 'আপনার জিপিএ, বাজেট এবং টেস্ট স্কোরের সাথে সামঞ্জস্য রেখে সেরা বিশ্ববিদ্যালয় ও স্কলারশিপের একটি গাইড তৈরি করুন এআই উপদেষ্টার মাধ্যমে।'}
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleGenerateRoadmap}
              className="relative z-10 whitespace-nowrap bg-white text-indigo-950 hover:bg-indigo-50 font-extrabold py-3.5 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-950/20 text-sm shrink-0 flex items-center justify-center disabled:opacity-75 disabled:scale-100"
              disabled={loadingRoadmap}
            >
              {loadingRoadmap ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-indigo-950 border-t-transparent animate-spin"></span>
                  {lang === 'en' ? 'Generating...' : 'তৈরি হচ্ছে...'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-950" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9.963 8.282A7.856 7.856 0 0 0 12 3a7.856 7.856 0 0 0 2.037 5.282A7.856 7.856 0 0 0 19.32 10 7.856 7.856 0 0 0 14.037 11.718 7.856 7.856 0 0 0 12 17a7.856 7.856 0 0 0-2.037-5.282 7.856 7.856 0 0 0-5.282-2.037 7.856 7.856 0 0 0 5.282-2.037z" />
                  </svg>
                  <span>{lang === 'en' ? 'Get AI Roadmap' : 'এআই রোডম্যাপ পান'}</span>
                </span>
              )}
            </button>
          </div>

          {(roadmapError || roadmapResult) && (
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-md space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    </svg>
                    <span>{lang === 'en' ? 'Roadmap Generated' : 'রোডম্যাপ প্রস্তুত'}</span>
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-800 dark:text-white mt-2">
                    {lang === 'en' ? 'AI Admission Roadmap' : 'এআই ভর্তি রোডম্যাপ'}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {lang === 'en' ? 'Your personalized recommendations appear here without leaving the dashboard.' : 'ড্যাশবোর্ড ছাড়াই আপনার ব্যক্তিগতকৃত সুপারিশ এখানে দেখানো হবে।'}
                  </p>
                </div>
              </div>

              {loadingRoadmap && (
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300">
                  <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                  <span>{lang === 'en' ? 'Generating your roadmap...' : 'আপনার রোডম্যাপ তৈরি হচ্ছে...'}</span>
                </div>
              )}

              {roadmapError && (
                <div className="rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                  <span>{roadmapError}</span>
                  {profileProgress < 100 && (
                    <Link
                      to="/profile"
                      className="text-red-800 dark:text-red-200 font-extrabold underline hover:no-underline shrink-0 text-xs sm:text-sm bg-white/20 dark:bg-black/10 px-3 py-1.5 rounded-xl hover:bg-white/30 dark:hover:bg-black/20 transition-all duration-200"
                    >
                      {lang === 'en' ? 'Complete Profile →' : 'প্রোফাইল সম্পূর্ণ করুন →'}
                    </Link>
                  )}
                </div>
              )}

              {roadmapResult && !loadingRoadmap && (
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h3: ({ node, ...props }) => <h3 className="text-base font-black text-blue-700 dark:text-blue-400 mt-4 mb-2 animate-fadeIn" {...props} />,
                      p: ({ node, ...props }) => <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 font-medium animate-fadeIn" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 text-sm text-gray-600 dark:text-gray-300 space-y-1.5 animate-fadeIn" {...props} />,
                      li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-black text-gray-900 dark:text-white" {...props} />,
                    }}
                  >
                    {roadmapResult}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Statement of Purpose (SOP) AI Review Section */}
          <AccordionCard
            id="dashboard-sop-accordion"
            isOpen={isSopOpen}
            onToggle={() => setIsSopOpen(!isSopOpen)}
            title={lang === 'en' ? 'Statement of Purpose (SOP) AI Review' : 'স্টেটমেন্ট অব পারপাস (SOP) এআই রিভিউ'}
            subtitle={
              lang === 'en'
                ? 'Submit or paste your SOP to receive detailed AI feedback and corrections.'
                : 'এআই ফিডব্যাক এবং সংশোধনের জন্য আপনার SOP আপলোড করুন বা পেস্ট করুন।'
            }
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
            gradientClass="bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-700"
          >
            {isSopOpen && (
              <Suspense fallback={<div className="py-6 text-center text-sm text-gray-500">Loading SOP reviewer…</div>}>
                <SopReviewSection />
              </Suspense>
            )}
          </AccordionCard>

          {/* Letter of Recommendation (LOR) AI Review Section */}
          <AccordionCard
            id="dashboard-lor-accordion"
            isOpen={isLorOpen}
            onToggle={() => setIsLorOpen(!isLorOpen)}
            title={lang === 'en' ? 'Letter of Recommendation (LOR) AI Review' : 'রেফারেন্স লেটার (LOR) এআই রিভিউ'}
            subtitle={
              lang === 'en'
                ? 'Get feedback and recommendations on recommendation letters.'
                : 'রেফারেন্স লেটারগুলোর ওপর গঠনমূলক প্রতিক্রিয়া এবং পরামর্শ পান।'
            }
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
            gradientClass="bg-gradient-to-br from-violet-500 via-purple-500 to-purple-700"
          >
            {isLorOpen && (
              <Suspense fallback={<div className="py-6 text-center text-sm text-gray-500">Loading LOR reviewer…</div>}>
                <LorReviewSection />
              </Suspense>
            )}
          </AccordionCard>
        </>
      )}

    </div>
  );
};

export default Dashboard;