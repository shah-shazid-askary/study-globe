import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../context/LanguageContext';
import { aiAPI } from '../services/api';
import { readFileAsText } from '../utils/fileReader';

const LorReviewSection = () => {
  const { lang } = useLanguage();
  const [lorText, setLorText] = useState('');
  const [lorFileName, setLorFileName] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewResult, setReviewResult] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLorFileName(file.name);
    setReviewError('');

    try {
      const text = await readFileAsText(file);
      setLorText(text);
    } catch (err) {
      setReviewError(
        err.message || 
        (lang === 'en'
          ? 'Unable to read the selected file. Please upload a PDF, DOCX, or text-based LOR file.'
          : 'নির্বাচিত ফাইলটি পড়া যায়নি। অনুগ্রহ করে একটি পিডিএফ, ডকএক্স, বা টেক্সট ফাইল আপলোড করুন।')
      );
      setLorFileName('');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!lorText.trim()) return;

    setLoadingReview(true);
    setReviewError('');
    setReviewResult('');

    try {
      const res = await aiAPI.reviewSop({
        sop_text: lorText,
        target_program: '',
        target_country: '',
        review_type: 'lor',
      });
      setReviewResult(res.data.feedback || 'No review content returned.');
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to evaluate letter of recommendation. Try again.');
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleReviewSubmit} className="space-y-4">
        <div>
          <label htmlFor="dashboard-lor-file" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {lang === 'en' ? 'Upload LOR file' : 'LOR ফাইল আপলোড করুন'}
          </label>
          <input
            id="dashboard-lor-file"
            type="file"
            accept=".txt,.md,.text,.rtf,.pdf,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700 transition file:cursor-pointer"
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            {lang === 'en'
              ? 'PDF, DOCX and text files are supported. You can also paste the letter below.'
              : 'PDF, DOCX এবং টেক্সট ফাইল সমর্থিত। নিচে লেটার পেস্ট করেও পাঠাতে পারেন।'}
          </p>
          {lorFileName && (
            <p className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 animate-fadeIn">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
              {lang === 'en' ? 'Loaded file:' : 'লোড করা ফাইল:'} {lorFileName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="dashboard-lor-text" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {lang === 'en' ? 'Paste LOR text' : 'LOR টেক্সট পেস্ট করুন'}
          </label>
          <textarea
            id="dashboard-lor-text"
            value={lorText}
            onChange={(e) => setLorText(e.target.value)}
            rows={8}
            placeholder={
              lang === 'en' 
                ? 'Paste the recommendation letter here...' 
                : 'এখানে রেফারেন্স লেটার পেস্ট করুন...'
            }
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            type="submit"
            disabled={loadingReview || !lorText.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
          >
            {loadingReview ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                {lang === 'en' ? 'Reviewing...' : 'রিভিউ হচ্ছে...'}
              </span>
            ) : (
              lang === 'en' ? 'Review LOR' : 'LOR রিভিউ করুন'
            )}
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {lang === 'en' ? 'Feedback appears below after analysis.' : 'বিশ্লেষণের পরে ফিডব্যাক নিচে দেখান হবে।'}
          </span>
        </div>
      </form>

      {loadingReview && (
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/20 p-4 text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-3 animate-pulse">
          <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
          <span>{lang === 'en' ? 'Analyzing the letter...' : 'লেটার বিশ্লেষণ করা হচ্ছে...'}</span>
        </div>
      )}

      {reviewError && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300 animate-fadeIn">
          {reviewError}
        </div>
      )}

      {reviewResult && !loadingReview && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-black text-gray-800 dark:text-white">
              {lang === 'en' ? 'AI LOR Review' : 'এআই LOR রিভিউ'}
            </h4>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300">
              {lang === 'en' ? 'Ready' : 'প্রস্তুত'}
            </span>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({ node, ...props }) => <h3 className="text-base font-black text-indigo-700 dark:text-indigo-400 mt-4 mb-2" {...props} />,
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

export default LorReviewSection;
