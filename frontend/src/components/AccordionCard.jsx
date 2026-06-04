import React from 'react';

const AccordionCard = ({
  isOpen,
  onToggle,
  title,
  subtitle,
  icon,
  iconBgClass = 'bg-blue-50 dark:bg-blue-950/20',
  activeChevronClass = 'text-blue-600 dark:text-blue-400',
  id,
  children,
  gradientClass = ''
}) => {
  const contentId = `${id}-content`;
  const buttonId = `${id}-button`;

  const isGradient = !!gradientClass;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={`w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-blue-400/25 transition-all duration-205 ${
          isGradient
            ? `${gradientClass} hover:opacity-95`
            : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className={`text-3xl ${
            isGradient ? 'bg-white/20' : iconBgClass
          } p-3 rounded-2xl flex items-center justify-center w-14 h-14 shrink-0 transition-transform duration-300 ${isOpen ? 'scale-105' : ''}`}>
            {icon}
          </span>
          <div className="space-y-0.5">
            <h3 className={`font-extrabold text-lg leading-tight ${
              isGradient ? 'text-white' : 'text-gray-800 dark:text-white'
            }`}>
              {title}
            </h3>
            <p className={`text-xs leading-normal ${
              isGradient ? 'text-blue-100/90' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {subtitle}
            </p>
          </div>
        </div>
        <div className="shrink-0 ml-4">
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              isOpen 
                ? `rotate-180 ${isGradient ? 'text-white' : activeChevronClass}` 
                : `${isGradient ? 'text-white/70' : 'text-gray-400'}`
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Smooth height transition wrapper */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccordionCard;

