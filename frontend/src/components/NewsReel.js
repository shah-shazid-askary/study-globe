import React from 'react';

const NewsReel = () => {
  const news = [
    "🎓 Fall 2026 Admissions are now OPEN for top UK universities!",
    "💰 New Scholarship Alert: Fulbright Program applications starting next month.",
    "🌍 Study in Canada: Fast-track visa processing updated for 2026 students.",
    "✨ AI-Powered Roadmap: Get your personalized study plan in under 2 minutes.",
    "🚀 500+ New Master's Programs added to our Australia database.",
  ];

  return (
    <div className="bg-blue-600 dark:bg-blue-900 text-white overflow-hidden py-2 text-sm font-medium transition-colors duration-300">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...news, ...news].map((item, index) => (
          <span key={index} className="mx-8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
            {item}
          </span>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

export default NewsReel;
