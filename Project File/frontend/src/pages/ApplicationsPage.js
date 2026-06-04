import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI, documentsAPI, aiAPI, profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ApplicationsPage = () => {
  const { user, isAdmin } = useAuth();
  const { t, lang } = useLanguage();

  // Application Tasks State
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', status: 'pending' });

  // Document Checklist State
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docInputs, setDocInputs] = useState({}); // { [doc_type]: google_drive_url }

  // SOP Reviewer State
  const [profile, setProfile] = useState(null);
  const [showSopReviewer, setShowSopReviewer] = useState(false);
  const [sopText, setSopText] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [reviewResult, setReviewResult] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Status message state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Required Document Types
  const REQUIRED_DOCS = ['Statement of Purpose (SOP)', 'Letter of Recommendation 1 (LOR 1)', 'Letter of Recommendation 2 (LOR 2)', 'Academic Transcript', 'Passport Copy'];

  useEffect(() => {
    fetchTasks();
    fetchDocuments();
    fetchProfile();
  }, []);

  // Fetch Profile for SOP Review targets
  const fetchProfile = async () => {
    try {
      const res = await profileAPI.get();
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to retrieve profile for target mapping:', err);
    }
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await tasksAPI.getAll();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch Documents
  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await documentsAPI.getAll();
      setDocuments(res.data);
      // Pre-fill inputs with existing drive URLs
      const inputs = {};
      res.data.forEach(doc => {
        inputs[doc.document_type] = doc.google_drive_url || '';
      });
      setDocInputs(inputs);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Task Actions
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await tasksAPI.create(newTask);
      setNewTask({ title: '', description: '', due_date: '', status: 'pending' });
      setShowAddTask(false);
      fetchTasks();
      showNotification('Task added successfully!');
    } catch (err) {
      setErrorMsg('Failed to create task');
    }
  };

  const handleUpdateStatus = async (task, newStatus) => {
    try {
      await tasksAPI.update(task.id, { ...task, status: newStatus });
      fetchTasks();
      showNotification('Task updated successfully!');
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to delete this task?' : 'আপনি কি নিশ্চিত যে আপনি এই কাজটি মুছে ফেলতে চান?')) return;
    try {
      await tasksAPI.delete(id);
      fetchTasks();
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
      fetchDocuments();
      showNotification(`${docType} submitted successfully!`);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit document');
    }
  };

  const handleVerifyDoc = async (docId, newStatus) => {
    try {
      await documentsAPI.verify(docId, newStatus);
      fetchDocuments();
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
    <div className="space-y-8 dark:text-gray-100">
      
      {/* Dynamic Alert Banner (Notifications) */}
      {(urgentTasks.length > 0 || missingDocsCount > 0) ? (
        <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start gap-3 shadow-sm">
          <span className="text-xl">🚨</span>
          <div>
            <h4 className="font-bold text-red-800 dark:text-red-300 text-sm md:text-base">{t('notifTitle')}</h4>
            <div className="text-xs md:text-sm text-red-700 dark:text-red-400 mt-1 space-y-1">
              {urgentTasks.map(task => (
                <p key={task.id}>
                  ⚠️ <span className="font-semibold">[{t('notifUrgent')}]</span> "{task.title}" is due on {task.due_date}!
                </p>
              ))}
              {missingDocsCount > 0 && (
                <p>
                  📢 <span className="font-semibold">[{t('notifWarning')}]</span> You have {missingDocsCount} pending required documents to verify in your checklist.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 rounded-r-xl p-4 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">{t('notifNoAlerts')}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-blue-600 text-white py-2 px-4 rounded-xl shadow-lg fixed bottom-6 right-6 z-50 text-sm font-semibold flex items-center gap-2 animate-bounce">
          <span>✨</span> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-600 text-white py-2 px-4 rounded-xl shadow-lg fixed bottom-6 right-6 z-50 text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── TASKS MANAGER SECTION (2/3 columns) ────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('taskManagerTitle')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('taskManagerSubtitle')}</p>
              </div>
              <button
                onClick={() => setShowAddTask(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all hover:scale-105 active:scale-95 text-sm"
              >
                + {t('btnAdd')}
              </button>
            </div>

            {loadingTasks ? (
              <p className="text-gray-500 text-sm text-center py-6">{t('btnLoading')}</p>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <span className="text-4xl">📋</span>
                <p className="text-gray-500 text-sm mt-2">{lang === 'en' ? 'No application tasks yet. Create one to get started!' : 'কোনো আবেদন কাজ নেই। শুরু করতে একটি তৈরি করুন!'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/50 hover:shadow-md transition-all gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        <h4 className={`font-semibold text-gray-800 dark:text-white ${task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-5">{task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-red-500 dark:text-red-400 pl-5 font-medium">
                          📅 {t('taskDueDate')}: {task.due_date}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task, e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg py-1 px-2 text-xs font-semibold"
                      >
                        <option value="pending">{t('statusPending')}</option>
                        <option value="in_progress">{t('statusInProgress')}</option>
                        <option value="completed">{t('statusCompleted')}</option>
                      </select>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                        title={t('btnDelete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── SIDE PANEL: PROGRESS & ADD TASK MODAL (1/3 columns) ─── */}
        <div className="space-y-6">
          
          {/* Progress Circular Gauge */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t('taskCompletedRing')}</h3>
            <div className="relative flex items-center justify-center h-32 w-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="50" stroke="#E5E7EB" strokeWidth="10" fill="transparent" className="dark:stroke-gray-700" />
                <circle cx="64" cy="64" r="50" stroke="#0ea5e9" strokeWidth="10" fill="transparent"
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * taskProgress) / 100}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span className="absolute text-2xl font-black text-gray-800 dark:text-white">{taskProgress}%</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              {completedTasksCount} of {tasks.length} {t('taskCompleted')}
            </p>
          </div>

          {/* Add Task Modal overlay (styled cleanly as inline card) */}
          {showAddTask && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-blue-500 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white">{t('taskAddModal')}</h3>
                <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold">×</button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('taskTitle')}</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('taskPlaceholder')}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{lang === 'en' ? 'Description' : 'বর্ণনা'}</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('taskDueDate')}</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('btnCancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    {t('btnSave')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ─── DOCUMENT CHECKLIST SYSTEM SECTION (Google Drive submissions) ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('docTitle')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('docSubtitle')}</p>
        </div>

        {loadingDocs ? (
          <p className="text-gray-500 text-sm text-center py-6">{t('btnLoading')}</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">{t('docType')}</th>
                  <th className="py-3 px-4">{t('docStatus')}</th>
                  <th className="py-3 px-4">{t('docDriveUrl')}</th>
                  {isAdmin && <th className="py-3 px-4">{lang === 'en' ? 'Admin Action' : 'এডমিন অ্যাকশন'}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {REQUIRED_DOCS.map(docType => {
                  const matched = documents.find(d => d.document_type === docType);
                  const status = matched ? matched.status : 'missing';
                  const existingUrl = matched ? matched.google_drive_url : '';
                  const inputValue = docInputs[docType] || '';

                  return (
                    <tr key={docType} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10">
                      <td className="py-4 px-4 font-semibold text-gray-800 dark:text-white">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span>{docType}</span>
                          {docType === 'Statement of Purpose (SOP)' && (
                            <button
                              onClick={() => setShowSopReviewer(true)}
                              className="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2.5 rounded-xl text-[10px] transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0"
                            >
                              ✨ {t('sopReviewBtn') || 'AI Review'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          status === 'verified' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400' :
                          status === 'uploaded' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-400' :
                          'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
                        }`}>
                          {status === 'verified' ? t('docVerified') :
                           status === 'uploaded' ? t('docSubmitted') : t('docMissing')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 max-w-md">
                          <input
                            type="url"
                            value={inputValue}
                            onChange={(e) => handleDocUrlChange(docType, e.target.value)}
                            placeholder={t('docLinkPlaceholder')}
                            disabled={status === 'verified'}
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 text-xs bg-gray-50 dark:bg-gray-900/50 disabled:opacity-60"
                          />
                          {status !== 'verified' && (
                            <button
                              onClick={() => handleSubmitDocUrl(docType)}
                              disabled={!inputValue.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-all disabled:opacity-50"
                            >
                              {t('docVerifyBtn')}
                            </button>
                          )}
                          {existingUrl && (
                            <a
                              href={existingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline text-xs flex items-center gap-1 shrink-0 ml-1"
                            >
                              🔗 {lang === 'en' ? 'Open link' : 'লিঙ্ক খুলুন'}
                            </a>
                          )}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-4">
                          {matched && status === 'uploaded' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleVerifyDoc(matched.id, 'verified')}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2.5 rounded-lg text-xs"
                              >
                                ✅ {lang === 'en' ? 'Verify' : 'যাচাই'}
                              </button>
                              <button
                                onClick={() => handleVerifyDoc(matched.id, 'missing')}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2.5 rounded-lg text-xs"
                              >
                                ❌ {lang === 'en' ? 'Reject' : 'প্রত্যাখ্যান'}
                              </button>
                            </div>
                          )}
                          {matched && status === 'verified' && (
                            <button
                              onClick={() => handleVerifyDoc(matched.id, 'uploaded')}
                              className="border border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-semibold py-1 px-2.5 rounded-lg text-xs"
                            >
                              {lang === 'en' ? 'Revoke Verification' : 'যাচাইকরণ বাতিল'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI SOP Reviewer Modal */}
      {showSopReviewer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-700 overflow-hidden transform transition-all duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/40">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-white">
                    {t('sopReviewTitle') || 'AI Statement of Purpose (SOP) Analyzer'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lang === 'en' 
                      ? 'Powered by local Gemma AI model' 
                      : 'লোকাল গেমা এআই মডেল দ্বারা চালিত'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSopReviewer(false);
                  setReviewResult('');
                  setReviewError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl font-bold transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Target Information Badge */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
                    {lang === 'en' ? 'Target Application Profiles' : 'আবেদনের লক্ষ্য বিবরণ'}
                  </p>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>📚 {lang === 'en' ? 'Field' : 'বিভাগ'}: {profile?.field_of_interest || (lang === 'en' ? 'Not Set (Set in profile)' : 'সেট করা নেই')}</span>
                    <span>🌍 {lang === 'en' ? 'Country' : 'দেশ'}: {profile?.preferred_countries || (lang === 'en' ? 'Not Set (Set in profile)' : 'সেট করা নেই')}</span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowSopReviewer(false)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                >
                  ✏️ {lang === 'en' ? 'Update Profile targets' : 'প্রোফাইল আপডেট করুন'}
                </Link>
              </div>

              <form onSubmit={handleReviewSop} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {lang === 'en' ? 'Paste your SOP / Motivation Letter Draft' : 'আপনার এসওপি / মোটিভেশন লেটার ড্রাফট পেস্ট করুন'}
                  </label>
                  <textarea
                    value={sopText}
                    onChange={(e) => setSopText(e.target.value)}
                    placeholder={lang === 'en' 
                      ? "Dear Admissions Committee,\n\nI am writing to express my strong interest in the master's program..." 
                      : "সম্মানিত অ্যাডমিশন কমিটি,\n\nআমি আমার তীব্র আগ্রহের কথা জানাতে লিখছি..."}
                    className="w-full h-48 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                    required
                    disabled={loadingReview}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    {lang === 'en' ? `${sopText.split(/\s+/).filter(Boolean).length} words` : `${sopText.length} টি অক্ষর`}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSopReviewer(false);
                        setReviewResult('');
                        setReviewError('');
                      }}
                      className="px-5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      disabled={loadingReview}
                    >
                      {t('btnCancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={loadingReview || !sopText.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {loadingReview ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white animate-scan"></div>
                          <span>{lang === 'en' ? 'Evaluating...' : 'মূল্যায়ন করা হচ্ছে...'}</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>{lang === 'en' ? 'Review SOP' : 'এসওপি রিভিউ করুন'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Detailed Scanning Loading Screen */}
              {loadingReview && (
                <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 animate-pulse relative overflow-hidden min-h-[250px]">
                  {/* Laser scan effect */}
                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan"></div>
                  
                  <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-indigo-500 border-b-purple-500 border-l-transparent animate-spin"></div>
                  
                  <div className="text-center space-y-2">
                    <p className="font-extrabold text-blue-700 dark:text-blue-400 text-sm animate-bounce">
                      {lang === 'en' ? 'AI Review Processing...' : 'এআই রিভিউ প্রসেস করা হচ্ছে...'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {getLoadingMessage()}
                    </p>
                    <p className="text-[10px] text-gray-400 italic">
                      {lang === 'en' ? '(Local Gemma models take 10-15 seconds to ensure comprehensive structural checks)' : '(লোকাল গেমা মডেলের মাধ্যমে সম্পূর্ণ গঠন চেক করতে ১০-১৫ সেকেন্ড সময় লাগতে পারে)'}
                    </p>
                  </div>
                </div>
              )}

              {reviewError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-5 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-bold">{lang === 'en' ? 'Evaluation Failed' : 'মূল্যায়ন ব্যর্থ হয়েছে'}</p>
                    <p className="text-xs mt-1">{reviewError}</p>
                  </div>
                </div>
              )}

              {/* Output results */}
              {reviewResult && !loadingReview && (
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-700 rounded-2xl p-6 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                    <h4 className="font-black text-gray-800 dark:text-white flex items-center gap-2">
                      📝 {lang === 'en' ? 'AI Evaluation Report' : 'এআই মূল্যায়ন রিপোর্ট'}
                    </h4>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 font-extrabold px-2.5 py-1 rounded-full">
                      {lang === 'en' ? 'Ready' : 'প্রস্তুত'}
                    </span>
                  </div>

                  {/* Render Markdown using ReactMarkdown component props override */}
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h3: ({node, ...props}) => <h3 className="text-base font-black text-blue-700 dark:text-blue-400 mt-4 mb-2 flex items-center gap-1.5" {...props} />,
                        p: ({node, ...props}) => <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 font-medium" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 text-sm text-gray-600 dark:text-gray-300 space-y-1.5" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-black text-gray-900 dark:text-white" {...props} />,
                      }}
                    >
                      {reviewResult}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowSopReviewer(false);
                  setReviewResult('');
                  setReviewError('');
                }}
                className="bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-100 font-bold px-6 py-2 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-sm"
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
