import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Carousel = () => {
  const slides = [
    {
      image: '/assets/hero1.png',
      title: 'Your Global Future Starts Here',
      subtitle: 'Unlock opportunities at 500+ top universities worldwide.',
      cta: 'Explore Countries',
      link: '/countries',
    },
    {
      image: '/assets/hero2.png',
      title: 'AI-Powered Study Planning',
      subtitle: 'Get a personalized 5-year roadmap tailored to your dreams.',
      cta: 'Get Your Plan',
      link: '/register',
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-2xl group">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-linear"
          />
          
          {/* Content */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fadeInUp">
              {slide.title}
            </h2>
            <p className="text-lg md:text-xl text-gray-200 mb-8 animate-fadeInUp delay-200">
              {slide.subtitle}
            </p>
            <div className="flex gap-4 animate-fadeInUp delay-500">
              <Link
                to={slide.link}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {slide.cta}
              </Link>
              <Link
                to="/register"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-3 px-8 rounded-xl border border-white/30 transition-all hover:scale-105"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .delay-200 { animation-delay: 0.2s; }
        .delay-500 { animation-delay: 0.4s; }
      `}} />
    </div>
  );
};

export default Carousel;
