'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SUPPORTED_LANGUAGES, Language } from '@/lib/translations';
import { Languages, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  dropdownAlign?: 'left' | 'right';
  showLabel?: boolean;
}

export function LanguageSelector({
  className = '',
  dropdownAlign = 'right',
  showLabel = true,
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
        aria-label="Select language"
        title="Select Language / ಭಾಷೆ / भाषा / மொழி / భాష"
      >
        <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        {showLabel && (
          <span className="text-[11px] font-black">
            {currentLang.native}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
            Select Language
          </div>

          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs">{lang.native}</span>
                    <span className="text-[10px] text-slate-400">{lang.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
