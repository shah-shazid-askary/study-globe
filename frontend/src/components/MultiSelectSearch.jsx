import React, { useState, useRef, useEffect } from 'react';

const MultiSelectSearch = ({ label, options = [], selected = [], onChange, placeholder, lang = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    let updated;
    if (selected.includes(option)) {
      updated = selected.filter((item) => item !== option);
    } else {
      updated = [...selected, option];
    }
    onChange(updated);
  };

  const removeOption = (option, e) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="relative space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
          {label}
        </label>
      )}

      {/* Selected tags bubble display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-pointer min-h-[42px] flex flex-wrap gap-1.5 items-center transition"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400 select-none">
            {placeholder || (lang === 'en' ? 'Select options...' : 'অপশন সিলেক্ট করুন...')}
          </span>
        ) : (
          selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold transition-all hover:bg-blue-100"
            >
              {item}
              <button
                type="button"
                onClick={(e) => removeOption(item, e)}
                className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-200 focus:outline-none text-sm leading-none"
              >
                &times;
              </button>
            </span>
          ))
        )}
        <span className="ml-auto text-gray-400 select-none pr-1">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Searchable Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden animate-fadeIn max-h-60 flex flex-col">
          {/* Search bar input */}
          <div className="p-2 border-b border-gray-150 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search options...' : 'অনুসন্ধান করুন...'}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md px-3 py-1.5 text-xs text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on input click
            />
          </div>

          {/* Options list scroll */}
          <div className="overflow-y-auto flex-1 max-h-48 divide-y divide-gray-100 dark:divide-gray-700">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-center text-gray-500 dark:text-gray-400">
                {lang === 'en' ? 'No matches found' : 'কোন ফলাফল পাওয়া যায়নি'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={`flex items-center justify-between px-4 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectSearch;
