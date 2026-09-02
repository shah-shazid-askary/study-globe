import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* ══════════════════════════════════════════════════════════
   INLINE SVG ICON LIBRARY — Heroicons / Phosphor inspired
   All icons: fill="none", stroke="currentColor", w-stroke=2
   ══════════════════════════════════════════════════════════ */

/* Chat bubble with dots */
const IconChat = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <circle cx="9" cy="11" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="11" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="11" r=".5" fill="currentColor" stroke="none"/>
  </svg>
);

/* X close */
const IconX = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* Send arrow */
const IconSend = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none"/>
  </svg>
);

/* Robot/AI bot */
const IconBot = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="12" rx="3"/>
    <path d="M8 8V6a4 4 0 0 1 8 0v2"/>
    <circle cx="9.5" cy="14" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="14.5" cy="14" r="1.5" fill="currentColor" stroke="none"/>
    <path d="M9 18h6"/>
  </svg>
);

/* Person user */
const IconUser = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

/* Alert triangle */
const IconAlert = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/* Sparkle stars — used in header for AI flair */
const IconSparkle = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
  </svg>
);

/* Copy icon */
const IconCopy = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

/* Checkmark icon */
const IconCheck = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const formatTime = (ts) => {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS — drives all inline styles for dark/light
   ══════════════════════════════════════════════════════════ */
const tokens = (isDark) => ({
  /* Window */
  windowBg:          isDark ? '#0d1117' : '#ffffff',
  windowBorder:      isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
  windowShadow:      isDark
    ? '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
    : '0 32px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',

  /* Messages area */
  msgAreaBg:         isDark ? '#0d1117' : '#f9fafb',

  /* Bot bubble */
  botBubbleBg:       isDark ? '#161b22' : '#ffffff',
  botBubbleBorder:   isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
  botBubbleText:     isDark ? '#e6edf3' : '#1f2937',

  /* User bubble */
  userBubbleBg:      'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
  userBubbleText:    '#ffffff',

  /* Error bubble */
  errBubbleBg:       isDark ? 'rgba(239,68,68,0.1)' : '#fff1f2',
  errBubbleBorder:   isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.2)',
  errBubbleText:     isDark ? '#fca5a5' : '#dc2626',

  /* Bot avatar */
  botAvatarBg:       isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
  botAvatarBorder:   isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)',
  botAvatarText:     isDark ? '#818cf8' : '#4f46e5',

  /* User avatar */
  userAvatarBg:      isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',
  userAvatarBorder:  isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.15)',
  userAvatarText:    isDark ? '#60a5fa' : '#2563eb',

  /* Input bar */
  inputBarBg:        isDark ? '#0d1117' : '#ffffff',
  inputBarBorder:    isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
  inputBg:           isDark ? '#161b22' : '#f9fafb',
  inputBorder:       isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  inputBorderFocus:  '#6366f1',
  inputText:         isDark ? '#e6edf3' : '#1f2937',
  inputPlaceholder:  isDark ? '#6b7280' : '#9ca3af',

  /* Scrollbar */
  scrollbarTrack:    isDark ? '#161b22' : '#f1f5f9',
  scrollbarThumb:    isDark ? '#30363d' : '#cbd5e1',

  /* Typing dots */
  typingDot:         isDark ? '#818cf8' : '#6366f1',
});

/* ══════════════════════════════════════════════════════════
   CHATBOT COMPONENT
   ══════════════════════════════════════════════════════════ */
const ChatBot = () => {
  const { isAuthenticated } = useAuth();
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tk = tokens(isDark);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const windowRef  = useRef(null);
  const inputElem  = useRef(null);

  /* ── Init greeting ──────────────────────────── */
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: lang === 'en'
        ? "Hi! I'm your **StudyGlobe AI Advisor**. Ask me anything about universities, scholarships, visa requirements, or intake dates."
        : "হ্যালো! আমি আপনার **স্টাডিগ্লোব উপদেষ্টা**। বিশ্ববিদ্যালয়, স্কলারশিপ বা ইনটেক সম্পর্কে জিজ্ঞাসা করুন।",
      timestamp: Date.now()
    }]);
  }, [lang]);

  /* ── Auto scroll ────────────────────────────── */
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  /* ── Focus input on open ────────────────────── */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  /* ── DOM: apply dark/light to window via ref ── */
  useEffect(() => {
    const win = windowRef.current;
    if (!win) return;
    win.style.background  = tk.windowBg;
    win.style.borderColor = tk.windowBorder;
    win.style.boxShadow   = tk.windowShadow;
  }, [isDark, open, tk.windowBg, tk.windowBorder, tk.windowShadow]);

  /* ── DOM: apply scrollbar colors ─────────────── */
  useEffect(() => {
    const style = document.getElementById('chatbot-scrollbar-style');
    if (style) {
      style.textContent = `
        .chatbot-msgs::-webkit-scrollbar { width: 4px; }
        .chatbot-msgs::-webkit-scrollbar-track { background: ${tk.scrollbarTrack}; }
        .chatbot-msgs::-webkit-scrollbar-thumb { background: ${tk.scrollbarThumb}; border-radius: 4px; }
      `;
    }
  }, [isDark, tk.scrollbarTrack, tk.scrollbarThumb]);

  const applyInputStyle = useCallback(() => {
    const el = inputElem.current;
    if (!el) return;
    el.style.background    = tk.inputBg;
    el.style.color         = tk.inputText;
    el.style.borderColor   = inputFocused ? tk.inputBorderFocus : tk.inputBorder;
    el.style.outline       = inputFocused ? `3px solid ${tk.inputBorderFocus}20` : 'none';
  }, [tk, inputFocused]);

  useEffect(() => { applyInputStyle(); }, [isDark, inputFocused, applyInputStyle]);

  /* ── Handle Copy ────────────────────────────── */
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(() => {});
  };

  if (!isAuthenticated) return null;

  /* ── Send message ──────────────────────────── */
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chat', { messages: updated });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, timestamp: Date.now() }]);
    } catch (err) {
      const status = err.response?.status;
      const errText = status === 429
        ? (lang === 'en' ? 'The AI is busy right now — please wait a moment.' : 'এআই এখন ব্যস্ত। একটু অপেক্ষা করুন।')
        : (err.response?.data?.error || (lang === 'en' ? 'Something went wrong. Please try again.' : 'কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।'));
      setMessages(prev => [...prev, { role: 'assistant', content: `[ERROR] ${errText}`, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <>
      {/* Scrollbar style injection */}
      <style id="chatbot-scrollbar-style" />

      {/* ── Chat window ──────────────────────────────────── */}
      {open && (
        <div
          ref={windowRef}
          style={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: 400,
            height: 580,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 24,
            border: `1px solid ${tk.windowBorder}`,
            background: tk.windowBg,
            boxShadow: tk.windowShadow,
            overflow: 'hidden',
            animation: 'chatSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          {/* ── Header ─────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #1d4ed8 100%)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Background shimmer */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.15,
              background: 'radial-gradient(ellipse at 80% 20%, #818cf8 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />

            {/* Bot avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', position: 'relative', flexShrink: 0,
              backdropFilter: 'blur(8px)',
            }}>
              <IconBot size={22} />
              {/* Online dot */}
              <span style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 10, height: 10,
                background: '#22c55e', borderRadius: '50%',
                border: '2px solid #1e1b4b',
                boxShadow: '0 0 6px rgba(34,197,94,0.7)',
              }} />
            </div>

            {/* Title */}
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#ffffff', fontWeight: 800, fontSize: 14,
                letterSpacing: '-0.01em', lineHeight: 1.3,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {lang === 'en' ? 'StudyGlobe Advisor' : 'স্টাডিগ্লোব উপদেষ্টা'}
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  color: '#fbbf24',
                }}>
                  <IconSparkle size={12} />
                </span>
              </div>
              <div style={{
                color: 'rgba(199,210,254,0.85)', fontSize: 10,
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                {lang === 'en' ? 'AI Assistant • Online' : 'এআই সহকারী • অনলাইন'}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
            >
              <IconX size={16} />
            </button>
          </div>

          {/* ── Messages ───────────────────────────────── */}
          <div
            className="chatbot-msgs"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: tk.msgAreaBg,
            }}
          >
            {messages.map((msg, i) => {
              const isBot   = msg.role === 'assistant';
              const isError = msg.content.startsWith('[ERROR]');
              const text    = isError ? msg.content.replace('[ERROR]', '').trim() : msg.content;

              return (
                <div key={i} className="chatbot-bubble-container" style={{
                  display: 'flex',
                  justifyContent: isBot ? 'flex-start' : 'flex-end',
                  alignItems: 'flex-end',
                  gap: 8,
                  animation: 'chatMsgIn 0.25s ease-out both',
                }}>
                  {/* Bot avatar */}
                  {isBot && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                      background: isError ? 'rgba(239,68,68,0.12)' : tk.botAvatarBg,
                      border: `1px solid ${isError ? 'rgba(239,68,68,0.25)' : tk.botAvatarBorder}`,
                      color: isError ? '#ef4444' : tk.botAvatarText,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 2,
                    }}>
                      {isError ? <IconAlert size={14} /> : <IconBot size={14} />}
                    </div>
                  )}

                  {/* Bubble & Timestamp Wrapper */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: isBot ? '84%' : '78%',
                  }}>
                    {/* Bubble */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      padding: isBot ? '14px 32px 14px 16px' : '10px 14px',
                      borderRadius: isBot ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                      fontSize: 13,
                      lineHeight: 1.65,
                      background: isBot
                        ? (isError ? tk.errBubbleBg : tk.botBubbleBg)
                        : tk.userBubbleBg,
                      border: `1px solid ${isBot ? (isError ? tk.errBubbleBorder : tk.botBubbleBorder) : 'transparent'}`,
                      color: isBot
                        ? (isError ? tk.errBubbleText : tk.botBubbleText)
                        : tk.userBubbleText,
                      boxShadow: isBot
                        ? (isDark ? '0 2px 12px rgba(0,0,0,0.35)' : '0 2px 12px rgba(0,0,0,0.07)')
                        : '0 4px 20px rgba(99,102,241,0.4)',
                    }}>
                      {isBot && (
                        <button
                          className="chatbot-copy-btn"
                          onClick={() => handleCopy(text, i)}
                          title={lang === 'en' ? 'Copy response' : 'কপি করুন'}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                            color: isDark ? '#9ca3af' : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
                            e.currentTarget.style.color = isDark ? '#ffffff' : '#111827';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                            e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280';
                          }}
                        >
                          {copiedIndex === i ? <IconCheck size={12} /> : <IconCopy size={12} />}
                        </button>
                      )}
                    {isBot ? (
                      <div>
                        {isError && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            marginBottom: 8, fontWeight: 700,
                            color: tk.errBubbleText, fontSize: 12,
                          }}>
                            <IconAlert size={14} /> System Notice
                          </div>
                        )}
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            /* ── Paragraphs ── */
                            p: ({ children }) => (
                              <p style={{
                                margin: '0 0 10px 0',
                                lineHeight: 1.7,
                                fontSize: 13,
                                color: tk.botBubbleText,
                              }}>{children}</p>
                            ),

                            /* ── Headings ── */
                            h1: ({ children }) => (
                              <div style={{
                                fontSize: 15, fontWeight: 800, margin: '14px 0 6px',
                                color: isDark ? '#e2e8f0' : '#1e293b',
                                letterSpacing: '-0.02em', lineHeight: 1.3,
                                paddingBottom: 6,
                                borderBottom: `2px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
                              }}>{children}</div>
                            ),
                            h2: ({ children }) => (
                              <div style={{
                                fontSize: 13.5, fontWeight: 800, margin: '12px 0 5px',
                                color: isDark ? '#c7d2fe' : '#4338ca',
                                letterSpacing: '-0.01em', lineHeight: 1.35,
                                display: 'flex', alignItems: 'center', gap: 6,
                              }}>
                                <span style={{
                                  width: 3, height: 14, borderRadius: 2,
                                  background: 'linear-gradient(180deg,#818cf8,#6366f1)',
                                  display: 'inline-block', flexShrink: 0,
                                }} />
                                {children}
                              </div>
                            ),
                            h3: ({ children }) => (
                              <div style={{
                                fontSize: 12.5, fontWeight: 700, margin: '10px 0 4px',
                                color: isDark ? '#a5b4fc' : '#4f46e5',
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                              }}>{children}</div>
                            ),

                            /* ── Bold / Italic ── */
                            strong: ({ children }) => (
                              <strong style={{
                                fontWeight: 800,
                                color: isDark ? '#c7d2fe' : '#3730a3',
                              }}>{children}</strong>
                            ),
                            em: ({ children }) => (
                              <em style={{
                                fontStyle: 'italic',
                                color: isDark ? '#94a3b8' : '#475569',
                              }}>{children}</em>
                            ),

                            /* ── Horizontal rule ── */
                            hr: () => (
                              <div style={{
                                margin: '12px 0',
                                height: 1,
                                background: isDark
                                  ? 'linear-gradient(90deg,transparent,rgba(99,102,241,0.35),transparent)'
                                  : 'linear-gradient(90deg,transparent,rgba(99,102,241,0.2),transparent)',
                              }} />
                            ),

                            /* ── Blockquote ── */
                            blockquote: ({ children }) => (
                              <div style={{
                                margin: '10px 0',
                                padding: '10px 14px',
                                borderRadius: 10,
                                borderLeft: `3px solid ${isDark ? '#6366f1' : '#818cf8'}`,
                                background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
                                color: isDark ? '#a5b4fc' : '#4338ca',
                                fontSize: 12.5, fontStyle: 'italic',
                              }}>{children}</div>
                            ),

                            /* ── Unordered list ── */
                            ul: ({ children }) => (
                              <ul style={{
                                margin: '8px 0', padding: 0,
                                listStyle: 'none', display: 'flex',
                                flexDirection: 'column', gap: 5,
                              }}>{children}</ul>
                            ),

                            /* ── Ordered list ── */
                            ol: ({ children }) => (
                              <ol style={{
                                margin: '8px 0', padding: 0,
                                listStyle: 'none', display: 'flex',
                                flexDirection: 'column', gap: 5,
                                counterReset: 'item',
                              }}>{children}</ol>
                            ),

                            /* ── List item ── */
                            li: ({ children, ordered, index }) => (
                              <li style={{
                                display: 'flex', alignItems: 'flex-start', gap: 8,
                                fontSize: 13, lineHeight: 1.6,
                                color: tk.botBubbleText,
                              }}>
                                <span style={{
                                  flexShrink: 0, marginTop: 4,
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: isDark ? '#818cf8' : '#6366f1',
                                  display: 'block',
                                }} />
                                <span style={{ flex: 1 }}>{children}</span>
                              </li>
                            ),

                            /* ── Inline code ── */
                            code: ({ inline, children, className }) => {
                              if (inline !== false) {
                                return (
                                  <code style={{
                                    background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(99,102,241,0.08)',
                                    border: `1px solid ${isDark ? 'rgba(139,92,246,0.25)' : 'rgba(99,102,241,0.15)'}`,
                                    padding: '1px 6px', borderRadius: 5,
                                    fontSize: 11.5, fontFamily: "'JetBrains Mono','Fira Code',monospace",
                                    color: isDark ? '#c4b5fd' : '#4f46e5',
                                    fontWeight: 600,
                                  }}>{children}</code>
                                );
                              }
                              return (
                                <div style={{
                                  margin: '10px 0',
                                  borderRadius: 10, overflow: 'hidden',
                                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
                                }}>
                                  <div style={{
                                    padding: '6px 12px',
                                    background: isDark ? '#0d1117' : '#1e293b',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                  }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                                  </div>
                                  <pre style={{
                                    margin: 0, padding: '12px 14px',
                                    background: isDark ? '#161b22' : '#0f172a',
                                    fontSize: 11.5, lineHeight: 1.7,
                                    fontFamily: "'JetBrains Mono','Fira Code',monospace",
                                    color: '#e2e8f0', overflowX: 'auto',
                                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                  }}>
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              );
                            },

                            /* ── Anchors ── */
                            a: ({ href, children }) => (
                              <a
                                href={href} target="_blank" rel="noopener noreferrer"
                                style={{
                                  color: isDark ? '#60a5fa' : '#2563eb',
                                  textDecoration: 'none', fontWeight: 600,
                                  borderBottom: `1px solid ${isDark ? 'rgba(96,165,250,0.35)' : 'rgba(37,99,235,0.35)'}`,
                                  paddingBottom: 1,
                                }}
                                onMouseEnter={e => { e.target.style.borderBottomColor = isDark ? '#60a5fa' : '#2563eb'; }}
                                onMouseLeave={e => { e.target.style.borderBottomColor = isDark ? 'rgba(96,165,250,0.35)' : 'rgba(37,99,235,0.35)'; }}
                              >{children}</a>
                            ),

                            /* ── Table ── */
                            table: ({ children }) => (
                              <div style={{
                                overflowX: 'auto', margin: '12px 0', borderRadius: 12,
                                border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
                                boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
                              }}>
                                <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead style={{
                                background: isDark
                                  ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(79,70,229,0.15))'
                                  : 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(79,70,229,0.05))',
                              }}>{children}</thead>
                            ),
                            th: ({ children }) => (
                              <th style={{
                                padding: '8px 12px', textAlign: 'left',
                                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                color: isDark ? '#a5b4fc' : '#4338ca',
                                borderBottom: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
                                whiteSpace: 'nowrap',
                              }}>{children}</th>
                            ),
                            td: ({ children }) => (
                              <td style={{
                                padding: '8px 12px', fontSize: 12,
                                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                                color: tk.botBubbleText, lineHeight: 1.5,
                              }}>{children}</td>
                            ),
                            tr: ({ children }) => (
                              <tr style={{ transition: 'background 0.1s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.03)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                              >{children}</tr>
                            ),
                          }}
                        >
                          {text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap', fontWeight: 500, fontSize: 13 }}>{text}</div>
                    )}
                  </div>

                  {/* Timestamp */}
                  {msg.timestamp && (
                    <div style={{
                      fontSize: 10,
                      color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                      marginTop: 4,
                      marginLeft: isBot ? 4 : 0,
                      marginRight: isBot ? 0 : 4,
                      fontWeight: 600,
                    }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  )}
                </div>

                {/* User avatar */}
                {!isBot && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                    background: tk.userAvatarBg,
                    border: `1px solid ${tk.userAvatarBorder}`,
                    color: tk.userAvatarText,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 2,
                  }}>
                    <IconUser size={14} />
                  </div>
                )}
              </div>
            );
            })}

            {/* ── Typing indicator ── */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 10,
                  background: tk.botAvatarBg, border: `1px solid ${tk.botAvatarBorder}`,
                  color: tk.botAvatarText,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconBot size={14} />
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '18px 18px 18px 4px',
                  background: tk.botBubbleBg,
                  border: `1px solid ${tk.botBubbleBorder}`,
                  boxShadow: isDark ? '0 1px 8px rgba(0,0,0,0.3)' : '0 1px 8px rgba(0,0,0,0.06)',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 160, 320].map((delay, i) => (
                    <span key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: tk.typingDot,
                      display: 'inline-block',
                      animation: `chatDot 1.2s ease-in-out ${delay}ms infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>


          {/* ── Input bar ──────────────────────────────── */}
          <div style={{
            display: 'flex', gap: 8, padding: '12px 16px',
            background: tk.inputBarBg,
            borderTop: `1px solid ${tk.inputBarBorder}`,
            flexShrink: 0,
          }}>
            <input
              ref={(el) => { inputRef.current = el; inputElem.current = el; }}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={lang === 'en' ? 'Ask about universities, visas, scholarships…' : 'বিশ্ববিদ্যালয় বা স্কলারশিপ নিয়ে জিজ্ঞাসা করুন…'}
              disabled={loading}
              style={{
                flex: 1, padding: '11px 16px', borderRadius: 14,
                border: `1.5px solid ${inputFocused ? tk.inputBorderFocus : tk.inputBorder}`,
                outline: inputFocused ? `3px solid rgba(99,102,241,0.15)` : 'none',
                background: tk.inputBg, color: tk.inputText,
                fontSize: 13, fontWeight: 500,
                transition: 'border-color 0.15s, outline 0.15s',
                cursor: loading ? 'not-allowed' : 'text',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send"
              style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: (!input.trim() || loading)
                  ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)')
                  : 'linear-gradient(135deg, #6366f1 0%, #2563eb 100%)',
                border: 'none',
                color: (!input.trim() || loading) ? (isDark ? '#6366f180' : '#a5b4fc') : '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
                boxShadow: (!input.trim() || loading) ? 'none' : '0 4px 14px rgba(99,102,241,0.4)',
                transition: 'all 0.2s',
                transform: 'scale(1)',
              }}
              onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseDown={e => { if (!loading && input.trim()) e.currentTarget.style.transform = 'scale(0.94)'; }}
              onMouseUp={e => { if (!loading && input.trim()) e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <IconSend size={17} />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Trigger Button ───────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open AI advisor'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: 18,
          background: open
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #2563eb 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(99,102,241,0.45)',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'rotate(0deg) scale(1)' : 'rotate(0deg) scale(1)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.45)'; }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.93)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
      >
        <div style={{ transition: 'transform 0.3s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          {open ? <IconX size={22} /> : <IconChat size={22} />}
        </div>

        {/* Unread badge when closed */}
        {!open && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 14, height: 14, borderRadius: '50%',
            background: '#22c55e', border: '2px solid ' + (isDark ? '#111827' : '#ffffff'),
            boxShadow: '0 0 6px rgba(34,197,94,0.7)',
          }} />
        )}
      </button>

      {/* ── Global keyframe animations ──────────────────────── */}
      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%           { transform: translateY(-6px); opacity: 1;   }
        }
        .chatbot-copy-btn {
          opacity: 0;
          transition: opacity 0.2s ease, background 0.15s, color 0.15s;
        }
        .chatbot-bubble-container:hover .chatbot-copy-btn {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default ChatBot;
