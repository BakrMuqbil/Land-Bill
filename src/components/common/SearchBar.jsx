import React, { useState, useEffect, useRef } from 'react';

export default function SearchBar({
  onSearch,
  placeholder = 'بحث...',
  className = '',
  initialValue = ''
}) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // تنفيذ البحث عند تغيير النص
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(query);
    }, 300); // تأخير 300ms لتحسين الأداء

    return () => clearTimeout(delayDebounce);
  }, [query, onSearch]);

  // مسح البحث
  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  // اختصار لوحة المفاتيح (Ctrl+K أو Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        handleClear();
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative flex items-center rounded-2xl transition-all duration-300
        ${isFocused 
          ? 'bg-white ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10' 
          : 'bg-slate-50/80 hover:bg-slate-50 border border-slate-200'
        }
      `}>
        {/* أيقونة البحث */}
        <div className="flex-shrink-0 pl-4">
          <svg className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* حقل الإدخال */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-3.5 px-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          dir="rtl"
        />

        {/* اختصار لوحة المفاتيح */}
        {!query && !isFocused && (
          <div className="flex-shrink-0 hidden sm:flex items-center gap-1 mr-2">
            <kbd className="px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 rounded border border-slate-200">
              ⌘K
            </kbd>
          </div>
        )}

        {/* زر مسح البحث */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 mr-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            aria-label="مسح البحث"
          >
            <svg className="w-4 h-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* إحصائيات البحث (اختياري) */}
      {isFocused && query && (
        <div className="absolute -bottom-7 right-0 text-xs text-slate-400 font-medium">
          اضغط Esc للإلغاء
        </div>
      )}
    </div>
  );
}
