import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { profileAPI, countriesAPI, programsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Real user_profiles schema:
// user_id, date_of_birth, phone, current_education_level,
// field_of_interest, preferred_countries, budget_range, target_intake

const Profile = () => {
  const { user, updateUser } = useAuth();
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
            // preferred_countries is TEXT[] in DB — join to string for the input
            preferred_countries: Array.isArray(p.preferred_countries)
              ? p.preferred_countries.join(', ')
              : (p.preferred_countries || ''),
            budget_range: p.budget_range || '',
            target_intake: p.target_intake || '',
          });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile.' });
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
      // Patch the live user context so Dashboard welcome name updates instantly
      if (formData.full_name && formData.full_name.trim()) {
        updateUser({ full_name: formData.full_name.trim() });
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to update profile. Please try again.' });
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
      setAiError(err.response?.data?.error || 'Failed to generate recommendations. Please try again.');
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
    { label: 'Full Name', name: 'full_name', type: 'text', placeholder: 'e.g. John Doe' },
    { label: 'Phone', name: 'phone', type: 'text', placeholder: 'e.g. +880 1700-000000' },
    { label: 'Date of Birth', name: 'date_of_birth', type: 'date', placeholder: '' },
    { label: 'Budget Range', name: 'budget_range', type: 'text', placeholder: 'e.g. $10,000–$20,000/yr' },
  ];

  const educationLevels = ['Bachelor', 'Masters', 'PhD'];
  const upcomingIntakes = [
    'Fall 2026',
    'Spring 2027',
    'Fall 2027',
    'Spring 2028',
    'Fall 2028'
  ];

  const displayName = formData.full_name || user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {displayName}</h1>
      <p className="text-gray-500 mb-6">
        Logged in as: <span className="font-medium text-blue-600">
          {formData.full_name || user?.full_name || user?.user_metadata?.full_name 
            ? `${formData.full_name || user?.full_name || user?.user_metadata?.full_name} (${user?.email})` 
            : `${displayName} (${user?.email})`}
        </span>
      </p>

      {message.text && (
        <div className={`rounded-lg p-4 mb-6 text-sm border ${message.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-600 border-red-200'
          }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {textFields.map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} name={name} value={formData[name]} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder={placeholder} />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field of Interest</label>
            <select name="field_of_interest" value={formData.field_of_interest} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Select a field</option>
              {dbFields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Country</label>
            <select name="preferred_countries" value={formData.preferred_countries} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Select a country</option>
              {dbCountries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Intake</label>
            <select name="target_intake" value={formData.target_intake} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Select intake season</option>
              {upcomingIntakes.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Degree Level</label>
            <select name="current_education_level" value={formData.current_education_level} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Select level</option>
              {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* ── AI Recommendations Section ─────────────────────────────────────────────────── */}
      <div id="generate-plan" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Profile based Recommendations</h2>
        <p className="text-gray-500 mb-6">Please fill up the above form, save your profile and Let our AI match you with the perfect universities and programs based on your profile</p>

        {!recommendations && !loadingAi && (
          <div className="flex justify-center w-full">
            <button
              onClick={handleGeneratePlan}
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
            >
              <span>✨</span> Generate Personalized Plan
            </button>
          </div>
        )}

        {loadingAi && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col items-center justify-center space-y-3">
            <div className="flex gap-1 items-center">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-blue-600 font-medium text-sm animate-pulse">Analyzing your profile & finding the best matches...</p>
          </div>
        )}

        {aiError && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 mt-4">
            {aiError}
            <button onClick={handleGeneratePlan} className="ml-4 underline text-sm">Retry</button>
          </div>
        )}

        {recommendations && !loadingAi && (
          <div className="mt-4">
            <div className="prose prose-blue max-w-none bg-gray-50 border border-gray-200 p-6 rounded-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {recommendations}
              </ReactMarkdown>
            </div>
            <button
              onClick={handleGeneratePlan}
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium transition mx-auto block"
            >
              🔄 Regenerate Plan
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
