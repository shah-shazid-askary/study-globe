import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { profileAPI, countriesAPI, programsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Real user_profiles schema:
// user_id, date_of_birth, phone, current_education_level,
// field_of_interest, preferred_countries, budget_range, target_intake

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    phone: '',
    current_education_level: '',
    field_of_interest: '',
    preferred_countries: '',
    budget_range: '',
    target_intake: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dbCountries, setDbCountries] = useState([]);
  const [dbFields, setDbFields] = useState([]);

  const [recommendations, setRecommendations] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, countriesRes, programsRes] = await Promise.all([
          profileAPI.get(),
          countriesAPI.getAll().catch(() => ({ data: [] })),
          programsAPI.getAll().catch(() => ({ data: [] }))
        ]);
        setDbCountries(countriesRes.data || []);

        const allFields = (programsRes.data || []).map(p => p.field).filter(Boolean);
        const uniqueFields = [...new Set(allFields)].sort();
        setDbFields(uniqueFields);

        const p = profileRes.data;
        if (p && Object.keys(p).length > 0) {
          setFormData({
            full_name: p.full_name || '',
            date_of_birth: p.date_of_birth || '',
            phone: p.phone || '',
            current_education_level: p.current_education_level || '',
            field_of_interest: p.field_of_interest || '',
            preferred_countries: Array.isArray(p.preferred_countries)
              ? p.preferred_countries.join(', ')
              : (p.preferred_countries || ''),
            budget_range: p.budget_range || '',
            target_intake: p.target_intake || '',
          });
        }
      } catch (err) {
        setMessage({ type: 'error', text: lang === 'en' ? 'Failed to load profile.' : 'প্রোফাইল লোড করতে ব্যর্থ হয়েছে।' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!loading && location.hash === '#generate-plan') {
      setTimeout(() => {
        const element = document.getElementById('generate-plan');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-blue-400', 'transition-all', 'duration-1000');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-blue-400');
          }, 2500);
        }
      }, 100);
    }
  }, [loading, location.hash]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await profileAPI.update(formData);
      if (formData.full_name && formData.full_name.trim()) {
        updateUser({ full_name: formData.full_name.trim() });
      }
      setMessage({ type: 'success', text: lang === 'en' ? 'Profile updated successfully!' : 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || (lang === 'en' ? 'Failed to update profile. Please try again.' : 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।') });
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePlan = async () => {
    setLoadingAi(true);
    setAiError('');
    try {
      const res = await profileAPI.getRecommendations();
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setAiError(err.response?.data?.error || (lang === 'en' ? 'Failed to generate recommendations. Please try again.' : 'সুপারিশ তৈরি করতে ব্যর্থ হয়েছে।'));
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const textFields = [
    { label: lang === 'en' ? 'Full Name' : 'পুরো নাম', name: 'full_name', type: 'text', placeholder: 'e.g. John Doe' },
    { label: lang === 'en' ? 'Phone' : 'ফোন', name: 'phone', type: 'text', placeholder: 'e.g. +880 1700-000000' },
    { label: lang === 'en' ? 'Date of Birth' : 'জন্ম তারিখ', name: 'date_of_birth', type: 'date', placeholder: '' },
    { label: lang === 'en' ? 'Budget Range' : 'বাজেট পরিসর', name: 'budget_range', type: 'text', placeholder: 'e.g. $10,000–$20,000/yr' },
  ];

  const educationLevels = ['Bachelor', 'Masters', 'PhD'];
  const upcomingIntakes = ['Fall 2026', 'Spring 2027', 'Fall 2027', 'Spring 2028', 'Fall 2028'];

  const displayName = formData.full_name || user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  // Shared input class
  const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition";

  return (
    <div className="max-w-2xl mx-auto space-y-8 dark:text-gray-100">
      {/* ── Premium Gradient Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl p-6 shadow-lg">
        <div className="absolute -right-6 -top-6 text-8xl opacity-10 select-none pointer-events-none">👤</div>
        <div className="absolute right-8 bottom-0 text-6xl opacity-10 select-none pointer-events-none">🎓</div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1 relative z-10">
          {lang === 'en' ? `👤 Welcome back, ${displayName}!` : `👤 স্বাগতম, ${displayName}!`}
        </h1>
        <p className="text-blue-100/90 text-sm relative z-10">
          {lang === 'en' ? 'Logged in as:' : 'লগ ইন করেছেন:'}{' '}
          <span className="font-bold text-white">
            {formData.full_name || user?.full_name || user?.user_metadata?.full_name
              ? `${formData.full_name || user?.full_name || user?.user_metadata?.full_name} (${user?.email})`
              : `${displayName} (${user?.email})`}
          </span>
        </p>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`rounded-xl p-4 text-sm border font-medium ${message.type === 'success'
          ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
          : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-extrabold text-gray-800 dark:text-white mb-5">
          {lang === 'en' ? '✏️ Edit Profile' : '✏️ প্রোফাইল সম্পাদনা'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {textFields.map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={inputCls}
                placeholder={placeholder}
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              {lang === 'en' ? 'Field of Interest' : 'আগ্রহের ক্ষেত্র'}
            </label>
            <select name="field_of_interest" value={formData.field_of_interest} onChange={handleChange} className={inputCls}>
              <option value="">{lang === 'en' ? 'Select a field' : 'একটি বিভাগ বেছে নিন'}</option>
              {dbFields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              {lang === 'en' ? 'Preferred Country' : 'পছন্দের দেশ'}
            </label>
            <select name="preferred_countries" value={formData.preferred_countries} onChange={handleChange} className={inputCls}>
              <option value="">{lang === 'en' ? 'Select a country' : 'একটি দেশ বেছে নিন'}</option>
              {dbCountries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              {lang === 'en' ? 'Target Intake' : 'লক্ষ্য ভর্তি মৌসুম'}
            </label>
            <select name="target_intake" value={formData.target_intake} onChange={handleChange} className={inputCls}>
              <option value="">{lang === 'en' ? 'Select intake season' : 'ভর্তি মৌসুম বেছে নিন'}</option>
              {upcomingIntakes.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              {lang === 'en' ? 'Target Degree Level' : 'লক্ষ্য ডিগ্রি স্তর'}
            </label>
            <select name="current_education_level" value={formData.current_education_level} onChange={handleChange} className={inputCls}>
              <option value="">{lang === 'en' ? 'Select level' : 'স্তর বেছে নিন'}</option>
              {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors"
          >
            {saving ? (lang === 'en' ? 'Saving...' : 'সংরক্ষণ হচ্ছে...') : (lang === 'en' ? '💾 Save Profile' : '💾 প্রোফাইল সংরক্ষণ')}
          </button>
        </form>
      </div>

      {/* AI Recommendations Section */}
      <div id="generate-plan" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-white mb-1 text-center">
          {lang === 'en' ? '🎯 Profile-based Recommendations' : '🎯 প্রোফাইল ভিত্তিক সুপারিশ'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">
          {lang === 'en'
            ? 'Fill out your profile, save it, and let our AI match you with the best universities and programs.'
            : 'আপনার প্রোফাইল পূরণ করুন, সংরক্ষণ করুন, এবং আমাদের এআই আপনার জন্য সেরা বিশ্ববিদ্যালয় ও প্রোগ্রাম খুঁজে দেবে।'}
        </p>

        {!recommendations && !loadingAi && (
          <div className="flex justify-center">
            <button
              onClick={handleGeneratePlan}
              className="bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 px-6 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2"
            >
              <span>✨</span>
              {lang === 'en' ? 'Generate Personalized Plan' : 'ব্যক্তিগতকৃত পরিকল্পনা তৈরি করুন'}
            </button>
          </div>
        )}

        {loadingAi && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/40 rounded-xl p-6 flex flex-col items-center justify-center space-y-3">
            <div className="flex gap-1 items-center">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm animate-pulse">
              {lang === 'en' ? 'Analyzing your profile & finding the best matches...' : 'প্রোফাইল বিশ্লেষণ করা হচ্ছে এবং সেরা মিল খোঁজা হচ্ছে...'}
            </p>
          </div>
        )}

        {aiError && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl p-4 mt-4 flex items-center justify-between">
            <span className="text-sm">{aiError}</span>
            <button onClick={handleGeneratePlan} className="ml-4 underline text-xs font-semibold">
              {lang === 'en' ? 'Retry' : 'পুনরায় চেষ্টা'}
            </button>
          </div>
        )}

        {recommendations && !loadingAi && (
          <div className="mt-4">
            <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-6 rounded-xl">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h3: ({ node, ...props }) => <h3 className="text-base font-black text-blue-700 dark:text-blue-400 mt-4 mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 text-sm text-gray-600 dark:text-gray-300 space-y-1" {...props} />,
                  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-black text-gray-900 dark:text-white" {...props} />,
                }}
              >
                {recommendations}
              </ReactMarkdown>
            </div>
            <button
              onClick={handleGeneratePlan}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold transition mx-auto block"
            >
              🔄 {lang === 'en' ? 'Regenerate Plan' : 'পরিকল্পনা পুনরায় তৈরি করুন'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
