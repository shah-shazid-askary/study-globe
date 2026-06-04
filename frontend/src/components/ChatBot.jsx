import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatBot = () => {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize first message in the selected language
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: lang === 'en'
          ? "Hi! I'm your StudyGlobe assistant. Ask me about universities, scholarships, or intake dates. 🎓"
          : "হ্যালো! আমি আপনার স্টাডিগ্লোব উপদেষ্টা। আমাকে বিশ্ববিদ্যালয়, স্কলারশিপ বা আবেদনের শেষ তারিখ সম্পর্কে জিজ্ঞাসা করতে পারেন। 🎓",
      }
    ]);
  }, [lang]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Don't render if user isn't logged in
  if (!isAuthenticated) return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { messages: updatedMessages });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply },
      ]);
    } catch (err) {
      const status = err.response?.status;
      const errText =
        status === 429
          ? (lang === 'en' ? '⏳ The AI is a bit busy. Please wait a few seconds.' : '⏳ এআই এখন ব্যস্ত। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।')
          : err.response?.data?.error || (lang === 'en' ? 'Sorry, something went wrong.' : 'দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${errText}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      {open && (
        <div
          style={{ width: 380, height: 520, bottom: 88, right: 24 }}
          className="fixed z-50 flex flex-col rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 flex-shrink-0 shadow-sm">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg shadow-inner">🤖</div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                {lang === 'en' ? 'StudyGlobe Expert Advisor' : 'স্টাডিগ্লোব বিশেষজ্ঞ উপদেষ্টা'}
              </p>
              <p className="text-blue-100 text-[10px] font-medium uppercase tracking-wider">
                {lang === 'en' ? 'Online & Ready to Help' : 'অনলাইন ও সহায়তার জন্য প্রস্তুত'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all text-xl leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs mr-2 self-end mb-1 shadow-sm">🤖</div>
                )}
                <div
                  className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:text-blue-900 dark:prose-headings:text-blue-400 prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 text-gray-800 dark:text-gray-100">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({node, ...props}) => (
                            <div className="my-3 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200" {...props} />
                              </div>
                            </div>
                          ),
                          thead: ({node, ...props}) => <thead className="bg-blue-50/50 text-blue-900" {...props} />,
                          th: ({node, ...props}) => <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider" {...props} />,
                          td: ({node, ...props}) => <td className="px-3 py-2 text-[11px] border-t border-gray-50 bg-white" {...props} />,
                          tr: ({node, ...props}) => <tr className="hover:bg-blue-50/30 transition-colors" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs shadow-sm">🤖</div>
                <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <span className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="flex gap-2 p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'en' ? 'Ask about universities…' : 'বিশ্ববিদ্যালয় বা স্কলারশিপ নিয়ে জিজ্ঞাসা করুন…'}
              disabled={loading}
              className="flex-1 border border-gray-300 dark:border-gray-600 bg-transparent rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-400 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Bubble ──────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ bottom: 24, right: 24 }}
        className="fixed z-50 w-14 h-14 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  );
};

export default ChatBot;
