'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, SUPPORTED_LANGUAGES, translations } from '@/lib/translations';

const ORDERED_LANGUAGES: Language[] = ['en', 'kn', 'hi', 'ta', 'te'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('swasthyasetu_lang') as Language | null;
      if (saved && (ORDERED_LANGUAGES.includes(saved) || saved === 'mr')) {
        setLanguageState(saved);
        return;
      }
      if (typeof navigator !== 'undefined') {
        const browserLang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
        if (browserLang.startsWith('kn')) {
          setLanguageState('kn');
          localStorage.setItem('swasthyasetu_lang', 'kn');
          return;
        }
        if (browserLang.startsWith('hi')) {
          setLanguageState('hi');
          localStorage.setItem('swasthyasetu_lang', 'hi');
          return;
        }
        if (browserLang.startsWith('ta')) {
          setLanguageState('ta');
          localStorage.setItem('swasthyasetu_lang', 'ta');
          return;
        }
        if (browserLang.startsWith('te')) {
          setLanguageState('te');
          localStorage.setItem('swasthyasetu_lang', 'te');
          return;
        }
      }
      setLanguageState('en');
      localStorage.setItem('swasthyasetu_lang', 'en');
    } catch {
      // Fallback
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('swasthyasetu_lang', lang);
    } catch {
      // ignore
    }
  };

  // Cycles through all 5 languages: English -> Kannada -> Hindi -> Tamil -> Telugu
  const toggleLanguage = () => {
    const currentIndex = ORDERED_LANGUAGES.indexOf(language);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ORDERED_LANGUAGES.length;
    setLanguage(ORDERED_LANGUAGES[nextIndex]);
  };

  const t = (key: keyof typeof translations['en']): string => {
    const langDict = translations[language] || translations['en'];
    if (langDict && (langDict as any)[key]) {
      return (langDict as any)[key];
    }
    return translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
