import React from 'react';

const NewsReel = () => {
  const news = [
    {
      text: "Fall 2026 Admissions are now OPEN for top UK universities!",
      badge: "UK Admissions",
      badgeClass: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      )
    },
    {
      text: "New Scholarship Alert: Fulbright Program applications starting next month.",
      badge: "Scholarship",
      badgeClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      )
    },
    {
      text: "Study in Canada: Fast-track visa processing updated for 2026 students.",
      badge: "Canada Visa",
      badgeClass: "bg-sky-500/15 border-sky-500/30 text-sky-400",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="14" y2="17" />
        </svg>
      )
    },
    {
      text: "AI-Powered Roadmap: Get your personalized study plan in under 2 minutes.",
      badge: "AI Tool",
      badgeClass: "bg-purple-500/15 border-purple-500/30 text-purple-400",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.3-6.3l-.7.7M6.7 17.3l-.7.7m12.6 0l-.7-.7M6.7 6.7l-.7-.7" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    },
    {
      text: "500+ New Master's Programs added to our Australia database.",
      badge: "Database",
      badgeClass: "bg-blue-500/15 border-blue-500/30 text-blue-400",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 text-slate-100 flex items-center h-11 overflow-hidden transition-all duration-300 relative">
      
      {/* ── Left Live Badge ─────────────────────────────────── */}
      <div className="absolute left-0 top-0 bottom-0 bg-slate-950 border-r border-slate-800/80 px-4 md:px-6 flex items-center gap-2 z-20 shadow-[8px_0_15px_rgba(2,6,23,0.9)] shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Updates
        </span>
      </div>

      {/* ── Scrolling Area ───────────────────────────────────── */}
      <div className="flex-1 overflow-hidden h-full flex items-center pl-24 md:pl-28">
        <div className="flex animate-marquee whitespace-nowrap items-center py-1.5">
          {[...news, ...news].map((item, index) => (
            <div key={index} className="mx-8 flex items-center gap-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-full pl-2.5 pr-4 py-1 transition-all duration-300 cursor-pointer shadow-sm group">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${item.badgeClass} group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300">
                {item.badge}
              </span>
              <span className="text-xs text-slate-300 font-semibold group-hover:text-white transition-colors duration-300">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

export default NewsReel;
