import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { profileAPI, tasksAPI, documentsAPI, predepartureAPI } from '../services/api';
import AccordionCard from '../components/AccordionCard';
import SopReviewSection from '../components/SopReviewSection';
import LorReviewSection from '../components/LorReviewSection';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const name = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  // Metrics states
  const [profileProgress, setProfileProgress] = useState(0);
  const [taskProgress, setTaskProgress] = useState({ completed: 0, total: 0 });
  const [docProgress, setDocProgress] = useState({ submitted: 0, total: 5 });
  const [prepProgress, setPrepProgress] = useState({ completed: 0, total: 5 });
  
  // Dashboard & Roadmap loading/ui states
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');
  const [roadmapResult, setRoadmapResult] = useState('');
  
  // Collapsible accordion visibility states
  const [isSopOpen, setIsSopOpen] = useState(false);
  const [isLorOpen, setIsLorOpen] = useState(false);

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
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 relative z-10">
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  {lang === 'en' ? 'Your Admission Roadmap' : 'আপনার ভর্তি রোডম্যাপ'}
                </h3>
                <p className="text-xs text-blue-105">
                  {lang === 'en' ? 'Complete each stage to prepare for international enrollment.' : 'আন্তর্জাতিক ভর্তির জন্য প্রস্তুত হতে প্রতিটি ধাপ পূরণ করুন।'}
                </p>
              </div>
              <span className="text-xl font-black text-white self-start sm:self-center">
                {overallCompleteness}% {lang === 'en' ? 'Journey Ready' : 'ভ্রমণ প্রস্তুত'}
              </span>
            </div>

            {/* Roadmap Progress Bar */}
            <div className="relative z-10">
              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-blue-900/30 border border-white/10">
                <div
                  style={{ width: `${overallCompleteness}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white transition-all duration-1000 ease-out"
                />
              </div>

              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-4 text-center mt-3 text-[10px] sm:text-xs font-bold text-blue-200">
                <div className={profileProgress > 0 ? 'text-white font-extrabold' : ''}>
                  👤 {lang === 'en' ? 'Profile Setup' : 'প্রোফাইল সেটআপ'}
                </div>
                <div className={docProgress.submitted > 0 ? 'text-white font-extrabold' : ''}>
                  📄 {lang === 'en' ? 'Docs Uploaded' : 'ডকুমেন্ট আপলোড'}
                </div>
                <div className={taskProgress.completed > 0 ? 'text-white font-extrabold' : ''}>
                  📋 {lang === 'en' ? 'Tasks Checked' : 'কাজ সম্পন্ন'}
                </div>
                <div className={prepProgress.completed === 5 ? 'text-white font-extrabold' : ''}>
                  🛫 {lang === 'en' ? 'Ready to Fly' : 'উড্ডয়ন প্রস্তুত'}
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 text-8xl opacity-10 font-bold select-none pointer-events-none translate-y-4 translate-x-4">
              🗺️
            </div>
          </div>

          {/* Visual Performance Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Metric Card 1: Profile Completeness */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <span className="text-3xl">👤</span>
                <span className="text-xs font-black text-white bg-white/20 px-3 py-1 rounded-full">
                  {profileProgress}%
                </span>
              </div>
              <div className="mt-4 space-y-1 relative z-10">
                <h4 className="font-extrabold text-sm text-white">
                  {lang === 'en' ? 'Profile Completion' : 'প্রোফাইল সম্পূর্ণতা'}
                </h4>
                <p className="text-xs text-blue-100/90">
                  {profileProgress === 100 
                    ? (lang === 'en' ? 'Profile fully set!' : 'প্রোফাইল সম্পূর্ণ!') 
                    : (lang === 'en' ? 'Fill details to match schools' : 'পছন্দের তথ্যগুলি পূরণ করুন')}
                </p>
              </div>
              <Link to="/profile" className="text-white font-extrabold text-xs mt-4 hover:underline relative z-10">
                {lang === 'en' ? 'Edit Profile →' : 'প্রোফাইল পরিবর্তন →'}
              </Link>
              <div className="absolute right-0 bottom-0 text-6xl opacity-10 font-bold select-none pointer-events-none translate-y-3 translate-x-3">
                👤
              </div>
            </div>

            {/* Metric Card 2: Document checklist */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <span className="text-3xl">📄</span>
                <span className="text-xs font-black text-white bg-white/20 px-3 py-1 rounded-full">
                  {docProgress.submitted}/{docProgress.total}
                </span>
              </div>
              <div className="mt-4 space-y-1 relative z-10">
                <h4 className="font-extrabold text-sm text-white">
                  {lang === 'en' ? 'Uploaded Documents' : 'আপলোডকৃত নথিপত্র'}
                </h4>
                <p className="text-xs text-green-100/90">
                  {docProgress.submitted === 5 
                    ? (lang === 'en' ? 'All documents ready!' : 'সব নথিপত্র প্রস্তুত!') 
                    : (lang === 'en' ? 'Submit Google Drive links' : 'ড্রাইভ লিঙ্কগুলি জমা দিন')}
                </p>
              </div>
              <Link to="/applications" className="text-white font-extrabold text-xs mt-4 hover:underline relative z-10">
                {lang === 'en' ? 'Check Documents →' : 'নথিপত্র চেকলিস্ট →'}
              </Link>
              <div className="absolute right-0 bottom-0 text-6xl opacity-10 font-bold select-none pointer-events-none translate-y-3 translate-x-3">
                📄
              </div>
            </div>

            {/* Metric Card 3: Tasks manager */}
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <span className="text-3xl">📋</span>
                <span className="text-xs font-black text-white bg-white/20 px-3 py-1 rounded-full">
                  {taskProgress.completed}/{taskProgress.total}
                </span>
              </div>
              <div className="mt-4 space-y-1 relative z-10">
                <h4 className="font-extrabold text-sm text-white">
                  {lang === 'en' ? 'Completed Tasks' : 'সম্পন্ন কাজসমূহ'}
                </h4>
                <p className="text-xs text-purple-100/90">
                  {taskProgress.total === 0 
                    ? (lang === 'en' ? 'No active planner tasks' : 'কোনো আবেদন কাজ নেই') 
                    : (lang === 'en' ? 'Keep managing deadlines' : 'ডেডলাইনগুলি অনুসরণ করুন')}
                </p>
              </div>
              <Link to="/applications" className="text-white font-extrabold text-xs mt-4 hover:underline relative z-10">
                {lang === 'en' ? 'Open Planner →' : 'পরিকল্পনাকারী খুলুন →'}
              </Link>
              <div className="absolute right-0 bottom-0 text-6xl opacity-10 font-bold select-none pointer-events-none translate-y-3 translate-x-3">
                📋
              </div>
            </div>

            {/* Metric Card 4: Pre-Departure Checkpoint */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <span className="text-3xl">✈️</span>
                <span className="text-xs font-black text-white bg-white/20 px-3 py-1 rounded-full">
                  {prepProgress.completed}/{prepProgress.total}
                </span>
              </div>
              <div className="mt-4 space-y-1 relative z-10">
                <h4 className="font-extrabold text-sm text-white">
                  {lang === 'en' ? 'Departure Readiness' : 'ভ্রমণের জন্য প্রস্তুতি'}
                </h4>
                <p className="text-xs text-indigo-100/90">
                  {prepProgress.completed === 5 
                    ? (lang === 'en' ? 'Ready for takeoff!' : 'উড্ডয়নের জন্য প্রস্তুত!') 
                    : (lang === 'en' ? 'Accommodations & flight pack' : 'বাসস্থান ও টিকিট নিশ্চিতকরণ')}
                </p>
              </div>
              <Link to="/predeparture" className="text-white font-extrabold text-xs mt-4 hover:underline relative z-10">
                {lang === 'en' ? 'Open Travel Prep →' : 'ভ্রমণ প্রস্তুতি দেখুন →'}
              </Link>
              <div className="absolute right-0 bottom-0 text-6xl opacity-10 font-bold select-none pointer-events-none translate-y-3 translate-x-3">
                ✈️
              </div>
            </div>

          </div>

          {/* Action Center Banner / Recommendations Box */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-md hover:shadow-lg transition-all gap-6">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-2xl font-black">
                {lang === 'en' ? 'Looking for personalized admission recommendations?' : 'ব্যক্তিগতকৃত ভর্তি সুপারিশ চান?'}
              </h2>
              <p className="opacity-90 text-xs md:text-sm leading-relaxed">
                {lang === 'en'
                  ? 'Connect your academic credentials with Gemma to generate a custom application roadmap matching your GPA, budget, and test targets.'
                  : 'আপনার জিপিএ, বাজেট এবং টেস্ট স্কোরের সাথে সামঞ্জস্য রেখে সেরা বিশ্ববিদ্যালয় ও স্কলারশিপের একটি গাইড তৈরি করুন এআই উপদেষ্টার মাধ্যমে।'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateRoadmap}
              className="whitespace-nowrap bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm text-sm shrink-0 flex items-center justify-center disabled:opacity-70"
              disabled={loadingRoadmap}
            >
              ✨ {loadingRoadmap ? (lang === 'en' ? 'Generating...' : 'তৈরি হচ্ছে...') : (lang === 'en' ? 'Get AI Roadmap' : 'এআই রোডম্যাপ পান')}
            </button>
          </div>

          {(roadmapError || roadmapResult) && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-800 dark:text-white">
                    {lang === 'en' ? 'AI Admission Roadmap' : 'এআই ভর্তি রোডম্যাপ'}
                  </h3>
                  <p className="text-xs text-gray-400">
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
                      h3: ({ node, ...props }) => <h3 className="text-base font-black text-blue-700 dark:text-blue-400 mt-4 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 text-sm text-gray-600 dark:text-gray-300 space-y-1.5" {...props} />,
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
            icon="📝"
            gradientClass="bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-700"
          >
            <SopReviewSection />
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
            icon="✉️"
            gradientClass="bg-gradient-to-br from-violet-500 via-purple-500 to-purple-700"
          >
            <LorReviewSection />
          </AccordionCard>
        </>
      )}

    </div>
  );
};

export default Dashboard;