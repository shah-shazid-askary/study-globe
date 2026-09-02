import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Carousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[540px] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between p-8 group">
      
      {/* ── Background Animations & Glows ────────────────────── */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="absolute -right-24 -top-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
      <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />

      {/* ── Slide 1: Your Global Future Starts Here ──────────── */}
      <div
        className={`absolute inset-0 p-8 flex flex-col justify-between transition-all duration-1000 ease-in-out ${
          current === 0 ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-12 scale-95 -z-10 pointer-events-none'
        }`}
      >
        {/* Top Text Content */}
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Global Access
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Your Global Future <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-md">
            Unlock opportunities at 500+ top universities across 54 countries with automated requirements audits and smart checklist systems.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              to="/countries"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Explore Countries
            </Link>
            <Link
              to="/register"
              className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2.5 px-5 rounded-xl border border-white/10 transition-all hover:scale-105"
            >
              Join Now
            </Link>
          </div>
        </div>

        {/* Bottom Graphic Content */}
        <div className="relative h-44 w-full flex items-center justify-center overflow-hidden">
          {/* Animated SVG Globe representation */}
          <svg className="w-40 h-40 text-blue-500/20 absolute animate-spin-slow" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 2" />
            <ellipse cx="50" cy="50" rx="45" ry="15" stroke="currentColor" strokeWidth="0.5" />
            <ellipse cx="50" cy="50" rx="15" ry="45" stroke="currentColor" strokeWidth="0.5" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" />
          </svg>

          {/* Floating Dest Cards */}
          <div className="absolute flex gap-4 w-full justify-around px-4 z-20">
            {[
              { country: 'Germany', code: 'de', prog: 'TU Munich', delay: 'delay-75' },
              { country: 'Canada', code: 'ca', prog: 'U of Toronto', delay: 'delay-150' },
              { country: 'United Kingdom', code: 'gb', prog: 'Oxford', delay: 'delay-300' }
            ].map((d, idx) => (
              <div
                key={idx}
                className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-blue-500/40 rounded-xl p-3 shadow-xl hover:-translate-y-2 transition-all duration-300 w-28 text-center flex flex-col items-center gap-1.5 animate-float ${d.delay}`}
              >
                <img
                  src={`https://flagcdn.com/w40/${d.code}.png`}
                  alt={d.country}
                  className="w-8 h-5 object-cover rounded shadow-sm"
                />
                <div>
                  <h4 className="text-[10px] font-black text-white">{d.country}</h4>
                  <p className="text-[8px] text-slate-500 font-bold">{d.prog}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slide 2: AI-Powered Study Planning ────────────────── */}
      <div
        className={`absolute inset-0 p-8 flex flex-col justify-between transition-all duration-1000 ease-in-out ${
          current === 1 ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-12 scale-95 -z-10 pointer-events-none'
        }`}
      >
        {/* Top Text Content */}
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            AI Roadmap
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            AI-Powered <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Study Planning
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-md">
            Get an instant custom study timeline. Verify document readiness, benchmark eligibility, and run Statement of Purpose audits using LLM guidance.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              to="/register"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20"
            >
              Get Your Plan
            </Link>
            <Link
              to="/login"
              className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2.5 px-5 rounded-xl border border-white/10 transition-all hover:scale-105"
            >
              Explore Tools
            </Link>
          </div>
        </div>

        {/* Bottom Graphic Content (AI Planning dashboard visual) */}
        <div className="relative h-44 w-full flex items-center justify-center gap-6 px-4 z-20">
          
          {/* Main AI Compatibility Circle */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3 shrink-0 hover:border-purple-500/40 transition-colors w-40">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-purple-500" strokeWidth="3" strokeDasharray="96, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-[10px] font-black text-white">96%</span>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-white leading-tight">Eligibility Score</h4>
              <p className="text-[8px] text-slate-500 font-bold mt-0.5">Computer Science</p>
            </div>
          </div>

          {/* AI Roadmap Node Connector Mock */}
          <div className="flex flex-col gap-2.5 max-w-[200px] w-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3.5 shadow-xl hover:border-purple-500/30 transition-colors">
            <h5 className="text-[9px] font-black text-purple-400 uppercase tracking-wider">AI Analysis Result:</h5>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                <span className="text-[9px] text-slate-300 font-medium truncate">GPA & Language score matched</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[9px] text-slate-300 font-medium truncate">SOP needs 1 extra project reference</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Slide Navigation Dots ────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {[0, 1].map((index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === current ? 'bg-white w-7' : 'bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* ── Styles (Floating & Spin animation definitions) ────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .delay-75 { animation-delay: 0.75s; }
        .delay-150 { animation-delay: 1.5s; }
        .delay-300 { animation-delay: 2.25s; }
        
        .animate-spin-slow {
          animation: spin 30s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default Carousel;
