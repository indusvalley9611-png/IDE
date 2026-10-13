'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('mr');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('swasthyasetu_lang') as Language;
      const validLangs: Language[] = ['en', 'kn', 'hi', 'ta', 'te', 'mr'];
      if (saved && validLangs.includes(saved)) {
        setLanguageState(saved);
        return;
      }
      // Default to English ('en') if not set
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

  const toggleLanguage = () => {
    const validLangs: Language[] = ['en', 'kn', 'hi', 'ta', 'te', 'mr'];
    const idx = validLangs.indexOf(language);
    const nextLang = validLangs[(idx + 1) % validLangs.length];
    setLanguage(nextLang);
  };

  const t = (key: keyof typeof translations['en']): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
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
