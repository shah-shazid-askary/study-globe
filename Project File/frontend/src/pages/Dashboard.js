import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { profileAPI, tasksAPI, documentsAPI, predepartureAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const name = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  // Metrics states
  const [profileProgress, setProfileProgress] = useState(0);
  const [taskProgress, setTaskProgress] = useState({ completed: 0, total: 0 });
  const [docProgress, setDocProgress] = useState({ submitted: 0, total: 5 });
  const [prepProgress, setPrepProgress] = useState({ completed: 0, total: 5 });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    const loadDashboardMetrics = async () => {
      try {
        setLoadingMetrics(true);
        const [profileRes, tasksRes, docsRes, prepRes] = await Promise.all([
          profileAPI.get().catch(() => ({ data: {} })),
          tasksAPI.getAll().catch(() => ({ data: [] })),
          documentsAPI.getAll().catch(() => ({ data: [] })),
          predepartureAPI.get().catch(() => ({ data: [] })),
        ]);

        // 1. Profile completeness calculation
        const p = profileRes.data;
        if (p) {
          const fields = [
            p.full_name,
            p.date_of_birth,
            p.phone,
            p.current_education_level,
            p.field_of_interest,
            p.preferred_countries,
            p.budget_range,
            p.target_intake
          ];
          const filled = fields.filter(f => {
            if (Array.isArray(f)) return f.length > 0;
            return f !== null && f !== undefined && String(f).trim() !== '';
          }).length;
          setProfileProgress(Math.round((filled / fields.length) * 100));
        }

        // 2. Application Planner tasks calculations
        const tList = tasksRes.data || [];
        const completedTasks = tList.filter(task => task.status === 'completed').length;
        setTaskProgress({ completed: completedTasks, total: tList.length });

        // 3. Documents submitted
        const dList = docsRes.data || [];
        const uploadedDocs = dList.filter(d => d.status === 'uploaded' || d.status === 'verified').length;
        setDocProgress({ submitted: uploadedDocs, total: 5 }); // 5 standard documents

        // 4. Pre-departure prep
        const prList = prepRes.data || [];
        const completedPrep = prList.filter(item => item.is_completed).length;
        setPrepProgress({ completed: completedPrep, total: 5 }); // 5 travel checkpoints

      } catch (err) {
        console.error('Error loading dashboard metrics:', err);
      } finally {
        setLoadingMetrics(false);
      }
    };

    loadDashboardMetrics();
  }, []);

  const overallCompleteness = Math.round(
    (profileProgress * 0.25) +
    ((taskProgress.total > 0 ? (taskProgress.completed / taskProgress.total) * 100 : 0) * 0.25) +
    ((docProgress.submitted / docProgress.total) * 100 * 0.25) +
    ((prepProgress.completed / prepProgress.total) * 100 * 0.25)
  );

  return (
    <div className="space-y-8 dark:text-gray-100">
      
      {/* Welcome Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-gray-800 dark:text-white">
          {t('dashWelcome', { name })}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          {lang === 'en' ? 'Here is a live summary of your study abroad application progress.' : 'আপনার উচ্চশিক্ষা আবেদনের অগ্রগতির একটি লাইভ সারসংক্ষেপ নিচে দেওয়া হলো।'}
        </p>
      </div>

      {loadingMetrics ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Overall Journey Roadmap */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="font-extrabold text-lg text-gray-800 dark:text-white">
                  {lang === 'en' ? 'Your Admission Roadmap' : 'আপনার ভর্তি রোডম্যাপ'}
                </h3>
                <p className="text-xs text-gray-400">
                  {lang === 'en' ? 'Complete each stage to prepare for international enrollment.' : 'আন্তর্জাতিক ভর্তির জন্য প্রস্তুত হতে প্রতিটি ধাপ পূরণ করুন।'}
                </p>
              </div>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 self-start sm:self-center">
                {overallCompleteness}% {lang === 'en' ? 'Journey Ready' : 'ভ্রমণ প্রস্তুত'}
              </span>
            </div>

            {/* Roadmap Progress Bar */}
            <div className="relative">
              <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  style={{ width: `${overallCompleteness}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-1000 ease-out"
                />
              </div>

              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-4 text-center mt-3 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                <div className={profileProgress > 0 ? 'text-blue-600 dark:text-blue-400' : ''}>
                  👤 {lang === 'en' ? 'Profile Setup' : 'প্রোফাইল সেটআপ'}
                </div>
                <div className={docProgress.submitted > 0 ? 'text-blue-600 dark:text-blue-400' : ''}>
                  📄 {lang === 'en' ? 'Docs Uploaded' : 'ডকুমেন্ট আপলোড'}
                </div>
                <div className={taskProgress.completed > 0 ? 'text-blue-600 dark:text-blue-400' : ''}>
                  📋 {lang === 'en' ? 'Tasks Checked' : 'কাজ সম্পন্ন'}
                </div>
                <div className={prepProgress.completed === 5 ? 'text-blue-600 dark:text-blue-400' : ''}>
                  🛫 {lang === 'en' ? 'Ready to Fly' : 'উড্ডয়ন প্রস্তুত'}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Performance Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Metric Card 1: Profile Completeness */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-3xl">👤</span>
                <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full">
                  {profileProgress}%
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">
                  {lang === 'en' ? 'Profile Completion' : 'প্রোফাইল সম্পূর্ণতা'}
                </h4>
                <p className="text-xs text-gray-400">
                  {profileProgress === 100 
                    ? (lang === 'en' ? 'Profile fully set!' : 'প্রোফাইল সম্পূর্ণ!') 
                    : (lang === 'en' ? 'Fill details to match schools' : 'পছন্দের তথ্যগুলি পূরণ করুন')}
                </p>
              </div>
              <Link to="/profile" className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-4 hover:underline">
                {lang === 'en' ? 'Edit Profile →' : 'প্রোফাইল পরিবর্তন →'}
              </Link>
            </div>

            {/* Metric Card 2: Document checklist */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-3xl">📄</span>
                <span className="text-xs font-black text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                  {docProgress.submitted}/{docProgress.total}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">
                  {lang === 'en' ? 'Uploaded Documents' : 'আপলোডকৃত নথিপত্র'}
                </h4>
                <p className="text-xs text-gray-400">
                  {docProgress.submitted === 5 
                    ? (lang === 'en' ? 'All documents ready!' : 'সব নথিপত্র প্রস্তুত!') 
                    : (lang === 'en' ? 'Submit Google Drive links' : 'ড্রাইভ লিঙ্কগুলি জমা দিন')}
                </p>
              </div>
              <Link to="/applications" className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-4 hover:underline">
                {lang === 'en' ? 'Check Documents →' : 'নথিপত্র চেকলিস্ট →'}
              </Link>
            </div>

            {/* Metric Card 3: Tasks manager */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-3xl">📋</span>
                <span className="text-xs font-black text-purple-600 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded-full">
                  {taskProgress.completed}/{taskProgress.total}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">
                  {lang === 'en' ? 'Completed Tasks' : 'সম্পন্ন কাজসমূহ'}
                </h4>
                <p className="text-xs text-gray-400">
                  {taskProgress.total === 0 
                    ? (lang === 'en' ? 'No active planner tasks' : 'কোনো আবেদন কাজ নেই') 
                    : (lang === 'en' ? 'Keep managing deadlines' : 'ডেডলাইনগুলি অনুসরণ করুন')}
                </p>
              </div>
              <Link to="/applications" className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-4 hover:underline">
                {lang === 'en' ? 'Open Planner →' : 'পরিকল্পনাকারী খুলুন →'}
              </Link>
            </div>

            {/* Metric Card 4: Pre-Departure Checkpoint */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-3xl">✈️</span>
                <span className="text-xs font-black text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded-full">
                  {prepProgress.completed}/{prepProgress.total}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">
                  {lang === 'en' ? 'Departure Readiness' : 'ভ্রমণের জন্য প্রস্তুতি'}
                </h4>
                <p className="text-xs text-gray-400">
                  {prepProgress.completed === 5 
                    ? (lang === 'en' ? 'Ready for takeoff!' : 'উড্ডয়নের জন্য প্রস্তুত!') 
                    : (lang === 'en' ? 'Accommodations & flight pack' : 'বাসস্থান ও টিকিট নিশ্চিতকরণ')}
                </p>
              </div>
              <Link to="/predeparture" className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-4 hover:underline">
                {lang === 'en' ? 'Open Travel Prep →' : 'ভ্রমণ প্রস্তুতি দেখুন →'}
              </Link>
            </div>

          </div>

          {/* Action Center Banner / Recommendations Box */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-md hover:shadow-lg transition-all gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                Gemma AI Advisor
              </span>
              <h2 className="text-2xl font-black">
                {lang === 'en' ? 'Looking for personalized admission recommendations?' : 'ব্যক্তিগতকৃত ভর্তি সুপারিশ চান?'}
              </h2>
              <p className="opacity-90 text-xs md:text-sm leading-relaxed">
                {lang === 'en'
                  ? 'Connect your academic credentials with Gemma to generate a custom application roadmap matching your GPA, budget, and test targets.'
                  : 'আপনার জিপিএ, বাজেট এবং টেস্ট স্কোরের সাথে সামঞ্জস্য রেখে সেরা বিশ্ববিদ্যালয় ও স্কলারশিপের একটি গাইড তৈরি করুন এআই উপদেষ্টার মাধ্যমে।'}
              </p>
            </div>
            <Link
              to="/profile"
              className="whitespace-nowrap bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm text-sm shrink-0 flex items-center justify-center"
            >
              ✨ {lang === 'en' ? 'Get AI Roadmap' : 'এআই রোডম্যাপ পান'}
            </Link>
          </div>
        </>
      )}

    </div>
  );
};

export default Dashboard;