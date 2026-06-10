import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { tasksAPI, documentsAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useLanguage } from '../context/LanguageContext';
import { queryKeys } from '../lib/queryClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const getDocIcon = (docType, className = "w-6 h-6") => {
  if (docType.includes('SOP')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    );
  }
  if (docType.includes('LOR')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (docType.includes('Transcript')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    );
  }
  if (docType.includes('Passport')) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.333 0 4 .667 4 2v1H5v-1c0-1.333 2.667-2 4-2z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
};

const ApplicationsPage = () => {
  const { user, isAdmin } = useAuth();
  const { profile, tasks, documents, loading: loadingUserData, refreshUserData } = useUserData();
  const queryClient = useQueryClient();
  const { t, lang } = useLanguage();

  // Application Tasks State
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', status: 'pending' });
  const [taskFilter, setTaskFilter] = useState('all');

  // Document Checklist State
  const [docInputs, setDocInputs] = useState({});
  const [showSopReviewer, setShowSopReviewer] = useState(false);
  const [sopText, setSopText] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [reviewResult, setReviewResult] = useState('');
  const [reviewError, setReviewError] = useState('');

  // LOR Reviewer State
  const [showLorReviewer, setShowLorReviewer] = useState(false);
  const [lorText, setLorText] = useState('');
  const [loadingLorReview, setLoadingLorReview] = useState(false);
  const [loadingLorStep, setLoadingLorStep] = useState(0);
  const [lorReviewResult, setLorReviewResult] = useState('');
  const [lorReviewError, setLorReviewError] = useState('');

  // Status message state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Required Document Types
  const REQUIRED_DOCS = [
    'Statement of Purpose (SOP)',
    'Letter of Recommendation 1 (LOR 1)',
    'Letter of Recommendation 2 (LOR 2)',
    'Academic Transcript',
    'Passport Copy'
  ];

  const loadingTasks = loadingUserData;
  const loadingDocs = loadingUserData;

  useEffect(() => {
    const inputs = {};
    (documents || []).forEach((doc) => {
      inputs[doc.document_type] = doc.google_drive_url || '';
    });
    setDocInputs(inputs);
  }, [documents]);

  const invalidateTasks = () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
  const invalidateDocuments = () => queryClient.invalidateQueries({ queryKey: queryKeys.documents });

  // Task Actions
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await tasksAPI.create(newTask);
      setNewTask({ title: '', description: '', due_date: '', status: 'pending' });
      setShowAddTask(false);
      invalidateTasks();
      refreshUserData();
      showNotification('Task added successfully!');
    } catch (err) {
      setErrorMsg('Failed to create task');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleUpdateStatus = async (task, newStatus) => {
    try {
      await tasksAPI.update(task.id, { ...task, status: newStatus });
      invalidateTasks();
      refreshUserData();
      showNotification('Task updated successfully!');
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const toggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    await handleUpdateStatus(task, nextStatus);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to delete this task?' : 'আপনি কি নিশ্চিত যে আপনি এই কাজটি মুছে ফেলতে চান?')) return;
    try {
      await tasksAPI.delete(id);
      invalidateTasks();
      refreshUserData();
      showNotification('Task deleted successfully!');
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Document Actions
  const handleDocUrlChange = (docType, value) => {
    setDocInputs(prev => ({ ...prev, [docType]: value }));
  };

  const handleSubmitDocUrl = async (docType) => {
    const url = docInputs[docType];
    if (!url || !url.trim()) return;

    try {
      await documentsAPI.submit({ document_type: docType, google_drive_url: url });
      invalidateDocuments();
      refreshUserData();
      showNotification(`${docType} submitted successfully!`);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit document');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleVerifyDoc = async (docId, newStatus) => {
    try {
      await documentsAPI.verify(docId, newStatus);
      invalidateDocuments();
      refreshUserData();
      showNotification(`Document status updated to ${newStatus}`);
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  // SOP AI Review action
  const handleReviewSop = async (e) => {
    e.preventDefault();
    if (!sopText.trim()) return;

    setLoadingReview(true);
    setReviewError('');
    setReviewResult('');

    try {
      const res = await aiAPI.reviewSop({
        sop_text: sopText,
        target_program: profile?.field_of_interest || '',
        target_country: profile?.preferred_countries || '',
      });
      setReviewResult(res.data.feedback);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to evaluate statement of purpose. Try again.');
    } finally {
      setLoadingReview(false);
    }
  };

  useEffect(() => {
    let interval;
    if (loadingReview) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % 5);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loadingReview]);

  useEffect(() => {
    let interval;
    if (loadingLorReview) {
      setLoadingLorStep(0);
      interval = setInterval(() => {
        setLoadingLorStep(prev => (prev + 1) % 5);
      }, 3000);
    } else {
      setLoadingLorStep(0);
    }
    return () => clearInterval(interval);
  }, [loadingLorReview]);

  // LOR AI Review action
  const handleReviewLor = async (e) => {
    e.preventDefault();
    if (!lorText.trim()) return;

    setLoadingLorReview(true);
    setLorReviewError('');
    setLorReviewResult('');

    try {
      const res = await aiAPI.reviewSop({
        sop_text: lorText,
        target_program: profile?.field_of_interest || '',
        target_country: profile?.preferred_countries || '',
        review_type: 'lor',
      });
      setLorReviewResult(res.data.feedback);
    } catch (err) {
      setLorReviewError(err.response?.data?.error || 'Failed to evaluate letter of recommendation. Try again.');
    } finally {
      setLoadingLorReview(false);
    }
  };

  const getLorLoadingMessage = () => {
    const stepsEn = [
      "Initializing Gemma AI & parsing LOR document...",
      "Analyzing recommendation structure, credentials and vocabulary...",
      "Checking alignment with your target program...",
      "Evaluating recommendation strength & quality...",
      "Generating structured recommendation report..."
    ];
    const stepsBn = [
      "গেমা এআই সক্রিয় করা হচ্ছে এবং সুপারিশপত্র বিশ্লেষণ করা হচ্ছে...",
      "গঠন, প্রেরকের তথ্য এবং শব্দভাণ্ডার বিশ্লেষণ করা হচ্ছে...",
      "আপনার লক্ষ্যযুক্ত প্রোগ্রামের সাথে সামঞ্জস্যতা পরীক্ষা করা হচ্ছে...",
      "সুপারিশের শক্তি ও গুণমান মূল্যায়ন করা হচ্ছে...",
      "সুপারিশপত্র মূল্যায়ন প্রতিবেদন তৈরি করা হচ্ছে..."
    ];
    return lang === 'en' ? stepsEn[loadingLorStep] : stepsBn[loadingLorStep];
  };

  const getLoadingMessage = () => {
    const stepsEn = [
      "Initializing Gemma AI & parsing document...",
      "Analyzing structure, grammar and vocabulary...",
      "Checking alignment with your target program...",
      "Evaluating motivation & clarity of academic goals...",
      "Generating structured recommendation report..."
    ];
    const stepsBn = [
      "গেমা এআই সক্রিয় করা হচ্ছে এবং ডকুমেন্ট বিশ্লেষণ করা হচ্ছে...",
      "গঠন, ব্যাকরণ এবং শব্দভাণ্ডার বিশ্লেষণ করা হচ্ছে...",
      "আপনার লক্ষ্যযুক্ত প্রোগ্রামের সাথে সামঞ্জস্যতা পরীক্ষা করা হচ্ছে...",
      "অনুপ্রেরণা ও একাডেমিক লক্ষ্যের স্পষ্টতা মূল্যায়ন করা হচ্ছে...",
      "সুপারিশ প্রতিবেদন তৈরি করা হচ্ছে..."
    ];
    return lang === 'en' ? stepsEn[loadingStep] : stepsBn[loadingStep];
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Computed metrics
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'in_progress').length;

  // Filtered tasks
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'all') return true;
    return t.status === taskFilter;
  });

  // Alerts calculations (Notifications Module)
  const today = new Date().toISOString().split('T')[0];
  const urgentTasks = tasks.filter(t => {
    if (t.status === 'completed' || !t.due_date) return false;
    const diffTime = new Date(t.due_date) - new Date(today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5; // Due in next 5 days
  });

  const missingDocsCount = REQUIRED_DOCS.length - documents.filter(d => d.status === 'verified').length;

  return (
    <div className="relative space-y-8 dark:text-gray-100 pb-12">
      {/* Background ambient highlights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10 dark:bg-indigo-500/10"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10 dark:bg-blue-500/10"></div>

      {/* ── Premium Gradient Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-3xl p-8 shadow-xl text-white">
        <svg className="absolute -right-6 -top-6 w-36 h-36 opacity-15 select-none pointer-events-none text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <svg className="absolute right-12 bottom-0 w-24 h-24 opacity-10 select-none pointer-events-none text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-md">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            {lang === 'en' ? 'Admission Milestones' : 'ভর্তির মাইলফলক'}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t('taskManagerTitle')}
          </h1>
          <p className="text-indigo-100/90 text-sm leading-relaxed">
            {lang === 'en'
              ? 'Organize deadlines, store links to crucial application files, and optimize your personal statements using automated AI verification.'
              : 'আবেদনের শেষ সময় গুছিয়ে রাখুন, প্রয়োজনীয় ফাইল লিঙ্ক সংরক্ষণ করুন এবং এআই মূল্যায়নের মাধ্যমে আপনার স্টেটমেন্টগুলো উন্নত করুন।'}
          </p>
        </div>

        {/* Inline Stats Row inside Hero */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
            <span className="block text-xs text-indigo-200/80 font-medium uppercase tracking-wider">{lang === 'en' ? 'Total Tasks' : 'মোট কাজ'}</span>
            <span className="text-xl font-bold">{tasks.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
            <span className="block text-xs text-indigo-200/80 font-medium uppercase tracking-wider">{lang === 'en' ? 'Completed' : 'সম্পন্ন'}</span>
            <span className="text-xl font-bold">{completedTasksCount} <span className="text-xs font-normal text-indigo-200/70">({taskProgress}%)</span></span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
            <span className="block text-xs text-indigo-200/80 font-medium uppercase tracking-wider">{lang === 'en' ? 'Submitted Docs' : 'জমা দেওয়া নথি'}</span>
            <span className="text-xl font-bold">{documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length} <span className="text-xs font-normal text-indigo-200/70">/ {REQUIRED_DOCS.length}</span></span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
            <span className="block text-xs text-indigo-200/80 font-medium uppercase tracking-wider">{lang === 'en' ? 'Pending Action' : 'অপেক্ষমান কাজ'}</span>
            <span className="text-xl font-bold text-amber-300">{pendingTasksCount + inProgressTasksCount}</span>
          </div>
        </div>
      </div>

      {/* ── Urgent Tasks Alert Alert Box ── */}
      {urgentTasks.length > 0 ? (
        <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 flex items-start gap-4 shadow-sm animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-rose-800 dark:text-rose-400 text-sm md:text-base">{t('notifTitle')}</h4>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 space-y-1.5 mt-1">
              {urgentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <p>
                    <span className="font-bold text-rose-600 dark:text-rose-400">[{t('notifUrgent')}]</span> "{task.title}" {lang === 'en' ? 'is due on' : 'এর শেষ সময়'} <span className="underline font-semibold">{task.due_date}</span>!
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{t('notifNoAlerts')}</p>
        </div>
      )}

      {/* ── Notification Toasts ── */}
      {successMsg && (
        <div className="bg-indigo-600 text-white py-2.5 px-5 rounded-2xl shadow-xl fixed bottom-6 right-6 z-50 text-sm font-semibold flex items-center gap-2 animate-bounce">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── TASKS PLANNER SECTION (2/3 columns) ────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-150 dark:border-white/5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>{lang === 'en' ? 'Task Roadmap' : 'টাস্ক রোডম্যাপ'}</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('taskManagerSubtitle')}</p>
              </div>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition-all hover:scale-105 active:scale-95 text-xs inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>{showAddTask ? '×' : '+'}</span>
                <span>{showAddTask ? t('btnCancel') : t('btnAdd')}</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 border-b border-gray-100 dark:border-white/5 pb-4 mb-4 overflow-x-auto">
              {[
                { key: 'all', label: lang === 'en' ? 'All' : 'সব' },
                { key: 'pending', label: t('statusPending') },
                { key: 'in_progress', label: t('statusInProgress') },
                { key: 'completed', label: t('statusCompleted') }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setTaskFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    taskFilter === tab.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loadingTasks ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-xs text-gray-400">{t('btnLoading')}</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/5 rounded-2xl bg-gray-50/50 dark:bg-white/1">
                <svg className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2 2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0L18 18H6L4 13m8-3v3m0 0l-3-3m3 3l3-3" />
                </svg>
                <p className="text-gray-500 text-xs mt-2">
                  {lang === 'en' 
                    ? 'No application planner tasks found under this filter.' 
                    : 'এই ফিল্টারের অধীনে কোনো আবেদন কাজ পাওয়া যায়নি।'}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredTasks.map(task => {
                  const isUrgent = task.due_date && new Date(task.due_date) - new Date(today) <= 5 * 24 * 60 * 60 * 1000 && task.status !== 'completed';
                  return (
                    <div
                      key={task.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 dark:border-white/5 rounded-2xl p-4 bg-gray-50/50 dark:bg-gray-900/20 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 hover:shadow-md transition-all duration-300 gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {/* Custom SVG Checkbox Toggle */}
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                            task.status === 'completed'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-gray-800'
                          }`}
                        >
                          {task.status === 'completed' && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        <div className="space-y-0.5">
                          <h4 className={`font-bold text-sm text-gray-800 dark:text-gray-100 transition-all ${
                            task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500 font-medium' : ''
                          }`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className={`text-xs ${task.status === 'completed' ? 'text-gray-400/80 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                              {task.description}
                            </p>
                          )}
                          
                          {task.due_date && (
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full ${
                              task.status === 'completed' 
                                ? 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500' 
                                : isUrgent 
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                            }`}>
                              <svg className="w-3 h-3 text-current shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{t('taskDueDate')}: {task.due_date} {isUrgent && `(${lang === 'en' ? 'Soon' : 'শীঘ্রই'})`}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action panel inside task row */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t border-gray-100 sm:border-t-0 dark:border-white/5">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task, e.target.value)}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1 px-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="pending">{t('statusPending')}</option>
                          <option value="in_progress">{t('statusInProgress')}</option>
                          <option value="completed">{t('statusCompleted')}</option>
                        </select>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                          title={t('btnDelete')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── SIDE PANEL: METRICS & FORM (1/3 columns) ────────────────── */}
        <div className="space-y-6">
          
          {/* Glowing Radial progress card */}
          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-150 dark:border-white/5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            <h3 className="font-bold text-sm text-gray-800 dark:text-white mb-4 uppercase tracking-wider">{t('taskCompletedRing')}</h3>
            
            <div className="relative flex items-center justify-center h-36 w-36 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                {/* Track circle */}
                <circle cx="72" cy="72" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                {/* Filled circle */}
                <circle cx="72" cy="72" r="54" stroke="url(#progressGradient)" strokeWidth="8" fill="transparent"
                  strokeDasharray={339}
                  strokeDashoffset={339 - (339 * taskProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-800 dark:text-white leading-none">{taskProgress}%</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{lang === 'en' ? 'Done' : 'সম্পন্ন'}</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-white/5 pt-4 text-xs">
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">{t('statusPending')}</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{pendingTasksCount}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">{lang === 'en' ? 'Active' : 'চলমান'}</span>
                <span className="text-sm font-bold text-indigo-500">{inProgressTasksCount}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-bold">{lang === 'en' ? 'Done' : 'শেষ'}</span>
                <span className="text-sm font-bold text-emerald-500">{completedTasksCount}</span>
              </div>
            </div>
          </div>

          {/* Quick Task Creation form card */}
          {showAddTask && (
            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-md border-2 border-indigo-500/40 animate-fadeIn relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>{t('taskAddModal')}</span>
                </h3>
                <button 
                  onClick={() => setShowAddTask(false)} 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg p-1"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('taskTitle')}</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('taskPlaceholder')}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lang === 'en' ? 'Description' : 'বর্ণনা'}</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={lang === 'en' ? 'Enter detailed task notes...' : 'কাজের বিস্তারিত লিখুন...'}
                    className="w-full h-16 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('taskDueDate')}</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                  >
                    {t('btnCancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg"
                  >
                    {t('btnSave')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ─── DOCUMENT CHECKLIST SYSTEM SECTION ─── */}
      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-150 dark:border-white/5">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2m-4-2v.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2h-3l-2.293-2.293A1 1 0 0011 3H9a1 1 0 00-.707.293L6 6H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{t('docTitle')}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('docSubtitle')}</p>
        </div>

        {loadingDocs ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs text-gray-400">{t('btnLoading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REQUIRED_DOCS.map(docType => {
              const matched = documents.find(d => d.document_type === docType);
              const status = matched ? matched.status : 'missing';
              const existingUrl = matched ? matched.google_drive_url : '';
              const inputValue = docInputs[docType] || '';

              // Determine status classes and borders
              let statusBorder = 'border-gray-100 dark:border-white/5';
              let accentTop = 'bg-gray-300 dark:bg-gray-700';
              let badgeStyle = 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400';

              if (status === 'verified') {
                statusBorder = 'border-emerald-500/20 dark:border-emerald-500/10';
                accentTop = 'bg-gradient-to-r from-emerald-400 to-teal-500';
                badgeStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
              } else if (status === 'uploaded') {
                statusBorder = 'border-amber-500/20 dark:border-amber-500/10';
                accentTop = 'bg-gradient-to-r from-amber-400 to-orange-500';
                badgeStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
              } else if (status === 'missing') {
                statusBorder = 'border-rose-500/20 dark:border-rose-500/10';
                accentTop = 'bg-gradient-to-r from-rose-400 to-pink-500';
                badgeStyle = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
              }

              return (
                <div
                  key={docType}
                  className={`bg-white dark:bg-gray-900/40 rounded-2xl border ${statusBorder} relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300`}
                >
                  {/* Top Status Accent Bar */}
                  <div className={`h-1.5 w-full ${accentTop}`}></div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-500 dark:text-gray-400 shrink-0">
                          {getDocIcon(docType, "w-6 h-6")}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                          {status === 'verified' ? t('docVerified') :
                           status === 'uploaded' ? t('docSubmitted') : t('docMissing')}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mt-3 leading-snug">
                        {docType}
                      </h3>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Drive input and submit row */}
                      <div className="space-y-2">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                          {t('docDriveUrl')}
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={inputValue}
                            onChange={(e) => handleDocUrlChange(docType, e.target.value)}
                            placeholder={t('docLinkPlaceholder')}
                            disabled={status === 'verified'}
                            className="w-full pl-8 pr-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs bg-gray-50 dark:bg-gray-900/50 disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="absolute left-2.5 top-2.5 text-gray-400 shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {/* Card Button Panel */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {status !== 'verified' && (
                          <button
                            onClick={() => handleSubmitDocUrl(docType)}
                            disabled={!inputValue.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>{t('docVerifyBtn')}</span>
                          </button>
                        )}

                        {existingUrl && (
                          <a
                            href={existingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 font-bold py-1.5 px-3 rounded-lg text-xs transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>{lang === 'en' ? 'Open file' : 'ফাইল খুলুন'}</span>
                          </a>
                        )}

                        {/* AI Review Triggers */}
                        {docType === 'Statement of Purpose (SOP)' && (
                          <button
                            onClick={() => setShowSopReviewer(true)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all hover:scale-105 active:scale-95 shadow-sm inline-flex items-center gap-1.5 w-full justify-center"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>{t('sopReviewBtn') || 'AI Review SOP'}</span>
                          </button>
                        )}

                        {docType.includes('Letter of Recommendation') && (
                          <button
                            onClick={() => {
                              setShowLorReviewer(true);
                            }}
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all hover:scale-105 active:scale-95 shadow-sm inline-flex items-center gap-1.5 w-full justify-center"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{lang === 'en' ? 'AI Review LOR' : 'এআই রিভিউ এলওআর'}</span>
                          </button>
                        )}
                      </div>

                      {/* Admin Decision Actions */}
                      {isAdmin && matched && (
                        <div className="border-t border-gray-100 dark:border-white/5 pt-3 mt-3 space-y-2">
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Admin Controller' : 'এডমিন প্যানেল'}</p>
                          {status === 'uploaded' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleVerifyDoc(matched.id, 'verified')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded-lg text-xs flex-1 transition-all inline-flex items-center justify-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{lang === 'en' ? 'Verify' : 'যাচাই'}</span>
                              </button>
                              <button
                                onClick={() => handleVerifyDoc(matched.id, 'missing')}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1 px-2.5 rounded-lg text-xs flex-1 transition-all inline-flex items-center justify-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>{lang === 'en' ? 'Reject' : 'প্রত্যাখ্যান'}</span>
                              </button>
                            </div>
                          )}
                          {status === 'verified' && (
                            <button
                              onClick={() => handleVerifyDoc(matched.id, 'uploaded')}
                              className="w-full border border-rose-500/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold py-1 px-2 rounded-lg text-xs transition-all inline-flex items-center justify-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>{lang === 'en' ? 'Revoke Verification' : 'যাচাইকরণ বাতিল'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── AI SOP Reviewer Modal ── */}
      {showSopReviewer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-150 dark:border-white/10 overflow-hidden transform transition-all duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                    {t('sopReviewTitle') || 'AI Statement of Purpose (SOP) Analyzer'}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium mt-0.5">
                    <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{lang === 'en' ? 'Powered by local Gemma AI model' : 'লোকাল গেমা এআই মডেল দ্বারা চালিত'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSopReviewer(false);
                  setReviewResult('');
                  setReviewError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl font-bold transition-colors p-2"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Target Profile Badge */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{lang === 'en' ? 'Target Application Target' : 'আবেদনের লক্ষ্য বিবরণ'}</span>
                  </p>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {lang === 'en' ? 'Field' : 'বিভাগ'}: {profile?.field_of_interest || (lang === 'en' ? 'Not Set (Set in profile)' : 'সেট করা নেই')}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.343 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      {lang === 'en' ? 'Country' : 'দেশ'}: {profile?.preferred_countries || (lang === 'en' ? 'Not Set (Set in profile)' : 'সেট করা নেই')}
                    </span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowSopReviewer(false)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 inline-flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>{lang === 'en' ? 'Edit Targets' : 'টার্গেট পরিবর্তন'}</span>
                </Link>
              </div>

              <form onSubmit={handleReviewSop} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {lang === 'en' ? 'Paste your SOP / Motivation Letter Draft' : 'আপনার এসওপি / মোটিভেশন লেটার ড্রাফট পেস্ট করুন'}
                  </label>
                  <textarea
                    value={sopText}
                    onChange={(e) => setSopText(e.target.value)}
                    placeholder={lang === 'en' 
                      ? "Dear Admissions Committee,\n\nI am writing to express my strong interest in the master's program..." 
                      : "সম্মানিত অ্যাডমিশন কমিটি,\n\nআমি আমার তীব্র আগ্রহের কথা জানাতে লিখছি..."}
                    className="w-full h-44 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-800 dark:text-gray-100"
                    required
                    disabled={loadingReview}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 font-medium inline-flex items-center">
                    <svg className="w-3.5 h-3.5 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>{lang === 'en' ? `${sopText.split(/\s+/).filter(Boolean).length} words` : `${sopText.length} টি অক্ষর`}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSopReviewer(false);
                        setReviewResult('');
                        setReviewError('');
                      }}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      disabled={loadingReview}
                    >
                      {t('btnCancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={loadingReview || !sopText.trim()}
                      className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
                    >
                      {loadingReview ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                          <span>{lang === 'en' ? 'Evaluating...' : 'মূল্যায়ন হচ্ছে...'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <span>{lang === 'en' ? 'Run SOP Evaluation' : 'এসওপি মূল্যায়ন করুন'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Scanning Loader Display */}
              {loadingReview && (
                <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 animate-pulse relative overflow-hidden min-h-[220px]">
                  {/* Laser scan animation line */}
                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan"></div>
                  
                  <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-indigo-500 border-b-pink-500 border-l-transparent animate-spin"></div>
                  
                  <div className="text-center space-y-2">
                    <p className="font-extrabold text-indigo-700 dark:text-indigo-400 text-xs animate-bounce">
                      {lang === 'en' ? 'AI Review Processing...' : 'এআই রিভিউ প্রসেস করা হচ্ছে...'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium max-w-sm">
                      {getLoadingMessage()}
                    </p>
                    <p className="text-[9px] text-gray-400 italic">
                      {lang === 'en' ? '(Comprehensive structural analysis might take 10-15 seconds)' : '(সম্পূর্ণ গঠন বিশ্লেষণ করতে ১০-১৫ সেকেন্ড সময় লাগতে পারে)'}
                    </p>
                  </div>
                </div>
              )}

              {reviewError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl p-5 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-bold">{lang === 'en' ? 'Evaluation Failed' : 'মূল্যায়ন ব্যর্থ হয়েছে'}</p>
                    <p className="text-xs mt-1">{reviewError}</p>
                  </div>
                </div>
              )}

              {/* Output Results */}
              {reviewResult && !loadingReview && (
                <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-white/5 rounded-2xl p-6 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{lang === 'en' ? 'Gemma Evaluation Report' : 'গেমা মূল্যায়ন রিপোর্ট'}</span>
                    </h4>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {lang === 'en' ? 'Complete' : 'সম্পন্ন'}
                    </span>
                  </div>

                  <div className="prose dark:prose-invert max-w-none text-xs">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-4 mb-2 flex items-center gap-1" {...props} />,
                        p: ({node, ...props}) => <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-3 font-medium" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 text-xs text-gray-600 dark:text-gray-300 space-y-1.5" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                      }}
                    >
                      {reviewResult}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-white/5 flex justify-end">
              <button
                onClick={() => {
                  setShowSopReviewer(false);
                  setReviewResult('');
                  setReviewError('');
                }}
                className="bg-gray-900 text-white dark:bg-gray-700 dark:text-gray-100 font-bold px-5 py-2 rounded-xl text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                {lang === 'en' ? 'Close Panel' : 'প্যানেল বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI LOR Reviewer Modal ── */}
      {showLorReviewer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-150 dark:border-white/10 overflow-hidden transform transition-all duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                    {lang === 'en' ? 'AI Letter of Recommendation (LOR) Analyzer' : 'এআই রেফারেন্স লেটার (LOR) বিশ্লেষক'}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium mt-0.5">
                    <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{lang === 'en' ? 'Powered by local Gemma AI model' : 'লোকাল গেমা এআই মডেল দ্বারা চালিত'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLorReviewer(false);
                  setLorReviewResult('');
                  setLorReviewError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl font-bold transition-colors p-2"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Target Profile Badge */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{lang === 'en' ? 'Target Application Target' : 'আবেদনের লক্ষ্য বিবরণ'}</span>
                  </p>
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {lang === 'en' ? 'Field' : 'বিভাগ'}: {profile?.field_of_interest || (lang === 'en' ? 'Not Set (Set in profile)' : 'সেট করা নেই')}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.343 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      {lang === 'en' ? 'Country' : 'দেশ'}: {profile?.preferred_countries || (lang === 'en' ? 'Not Set (Set in profile)' : 'সেট করা নেই')}
                    </span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowLorReviewer(false)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 inline-flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>{lang === 'en' ? 'Edit Targets' : 'টার্গেট পরিবর্তন'}</span>
                </Link>
              </div>

              <form onSubmit={handleReviewLor} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {lang === 'en' ? 'Paste LOR Text Draft' : 'রেফারেন্স লেটার (LOR) ড্রাফট পেস্ট করুন'}
                  </label>
                  <textarea
                    value={lorText}
                    onChange={(e) => setLorText(e.target.value)}
                    placeholder={lang === 'en' 
                      ? "To whom it may concern,\n\nI am writing to highly recommend..." 
                      : "যার সাথে এটি সম্পর্কিত,\n\nআমি উচ্চ সুপারিশ করতে লিখছি..."}
                    className="w-full h-44 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-800 dark:text-gray-100"
                    required
                    disabled={loadingLorReview}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 font-medium inline-flex items-center">
                    <svg className="w-3.5 h-3.5 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>{lang === 'en' ? `${lorText.split(/\s+/).filter(Boolean).length} words` : `${lorText.length} টি অক্ষর`}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLorReviewer(false);
                        setLorReviewResult('');
                        setLorReviewError('');
                      }}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      disabled={loadingLorReview}
                    >
                      {t('btnCancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={loadingLorReview || !lorText.trim()}
                      className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
                    >
                      {loadingLorReview ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                          <span>{lang === 'en' ? 'Evaluating...' : 'মূল্যায়ন হচ্ছে...'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <span>{lang === 'en' ? 'Run LOR Evaluation' : 'এলওআর মূল্যায়ন করুন'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Scanning Loader Display */}
              {loadingLorReview && (
                <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 animate-pulse relative overflow-hidden min-h-[220px]">
                  {/* Laser scan animation line */}
                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan"></div>
                  
                  <div className="w-12 h-12 rounded-full border-4 border-t-indigo-500 border-r-blue-500 border-b-pink-500 border-l-transparent animate-spin"></div>
                  
                  <div className="text-center space-y-2">
                    <p className="font-extrabold text-indigo-700 dark:text-indigo-400 text-xs animate-bounce">
                      {lang === 'en' ? 'AI Review Processing...' : 'এআই রিভিউ প্রসেস করা হচ্ছে...'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium max-w-sm">
                      {getLorLoadingMessage()}
                    </p>
                    <p className="text-[9px] text-gray-400 italic">
                      {lang === 'en' ? '(Comprehensive structural analysis might take 10-15 seconds)' : '(সম্পূর্ণ গঠন বিশ্লেষণ করতে ১০-১৫ সেকেন্ড সময় লাগতে পারে)'}
                    </p>
                  </div>
                </div>
              )}

              {lorReviewError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl p-5 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-bold">{lang === 'en' ? 'Evaluation Failed' : 'মূল্যায়ন ব্যর্থ হয়েছে'}</p>
                    <p className="text-xs mt-1">{lorReviewError}</p>
                  </div>
                </div>
              )}

              {/* Output Results */}
              {lorReviewResult && !loadingLorReview && (
                <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-white/5 rounded-2xl p-6 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{lang === 'en' ? 'Gemma Evaluation Report' : 'গেমা মূল্যায়ন রিপোর্ট'}</span>
                    </h4>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {lang === 'en' ? 'Complete' : 'সম্পন্ন'}
                    </span>
                  </div>

                  <div className="prose dark:prose-invert max-w-none text-xs">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-4 mb-2 flex items-center gap-1" {...props} />,
                        p: ({node, ...props}) => <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-3 font-medium" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 text-xs text-gray-600 dark:text-gray-300 space-y-1.5" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                      }}
                    >
                      {lorReviewResult}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-white/5 flex justify-end">
              <button
                onClick={() => {
                  setShowLorReviewer(false);
                  setLorReviewResult('');
                  setLorReviewError('');
                }}
                className="bg-gray-900 text-white dark:bg-gray-700 dark:text-gray-100 font-bold px-5 py-2 rounded-xl text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                {lang === 'en' ? 'Close Panel' : 'প্যানেল বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicationsPage;
