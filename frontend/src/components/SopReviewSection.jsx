import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../context/LanguageContext';
import { aiAPI } from '../services/api';
import { readFileAsText } from '../utils/fileReader';

const SopReviewSection = () => {
  const { lang } = useLanguage();
  const [sopText, setSopText] = useState('');
  const [sopFileName, setSopFileName] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewResult, setReviewResult] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSopFileName(file.name);
    setReviewError('');

    try {
      const text = await readFileAsText(file);
      setSopText(text);
    } catch (err) {
      setReviewError(
        err.message || 
        (lang === 'en'
          ? 'Unable to read the selected file. Please upload a PDF, DOCX, or text-based SOP file.'
          : 'নির্বাচিত ফাইলটি পড়া যায়নি। অনুগ্রহ করে একটি পিডিএফ, ডকএক্স, বা টেক্সট ফাইল আপলোড করুন।')
      );
      setSopFileName('');
    }
  };

  const handleClearReview = () => {
    setReviewResult('');
    setReviewError('');
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!sopText.trim()) return;

    setLoadingReview(true);
    setReviewError('');
    setReviewResult('');

    try {
      const res = await aiAPI.reviewSop({
        sop_text: sopText,
        target_program: '',
        target_country: '',
      });
      setReviewResult(res.data.feedback || 'No review content returned.');
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to evaluate statement of purpose. Try again.');
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleReviewSubmit} className="space-y-4">
        <div>
          <label htmlFor="dashboard-sop-file" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {lang === 'en' ? 'Upload SOP file' : 'SOP ফাইল আপলোড করুন'}
          </label>
          <input
            id="dashboard-sop-file"
            type="file"
            accept=".txt,.md,.text,.rtf,.pdf,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 transition file:cursor-pointer"
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            {lang === 'en'
              ? 'PDF, DOCX, and text-based files are supported. You can also paste the SOP below.'
              : 'PDF, DOCX, এবং টেক্সট-ভিত্তিক ফাইল সমর্থিত। নিচে SOP পেস্টও করতে পারেন।'}
          </p>
          {sopFileName && (
            <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5 animate-fadeIn">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              {lang === 'en' ? 'Loaded file:' : 'লোড করা ফাইল:'} {sopFileName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="dashboard-sop-text" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {lang === 'en' ? 'Paste SOP text' : 'SOP টেক্সট পেস্ট করুন'}
          </label>
          <textarea
            id="dashboard-sop-text"
            value={sopText}
            onChange={(e) => setSopText(e.target.value)}
            rows={10}
            placeholder={
              lang === 'en'
                ? 'Paste your statement of purpose or motivation letter here...'
                : 'এখানে আপনার statement of purpose বা motivation letter পেস্ট করুন...'
            }
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            type="submit"
            disabled={loadingReview || !sopText.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
          >
            {loadingReview ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                {lang === 'en' ? 'Reviewing...' : 'রিভিউ হচ্ছে...'}
              </span>
            ) : (
              lang === 'en' ? 'Review SOP' : 'SOP রিভিউ করুন'
            )}
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {lang === 'en'
              ? 'The feedback will appear below immediately after analysis.'
              : 'বিশ্লেষণ শেষ হলে ফিডব্যাক নিচেই দেখানো হবে।'}
          </span>
        </div>
      </form>

      {loadingReview && (
        <div className="rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 p-4 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-3 animate-pulse">
          <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          <span>{lang === 'en' ? 'Analyzing your SOP now...' : 'আপনার SOP বিশ্লেষণ করা হচ্ছে...'}</span>
        </div>
      )}

      {reviewError && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300 animate-fadeIn flex items-start justify-between gap-3">
          <span>{reviewError}</span>
          <button
            type="button"
            onClick={handleClearReview}
            className="shrink-0 text-xs font-bold underline hover:no-underline"
          >
            {lang === 'en' ? 'Dismiss' : 'বাতিল'}
          </button>
        </div>
      )}

      {reviewResult && !loadingReview && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-black text-gray-800 dark:text-white">
              {lang === 'en' ? 'AI SOP Review' : 'এআই SOP রিভিউ'}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300">
                {lang === 'en' ? 'Ready' : 'প্রস্তুত'}
              </span>
              <button
                type="button"
                onClick={handleClearReview}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {lang === 'en' ? 'Clear' : 'মুছুন'}
              </button>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({ node, ...props }) => <h3 className="text-base font-black text-blue-700 dark:text-blue-400 mt-4 mb-2" {...props} />,
                p: ({ node, ...props }) => <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 font-medium" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 text-sm text-gray-600 dark:text-gray-300 space-y-1.5" {...props} />,
                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-black text-gray-900 dark:text-white" {...props} />,
              }}
            >
              {reviewResult}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default SopReviewSection;
