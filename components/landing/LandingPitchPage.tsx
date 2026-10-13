'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Moon, Sun, Languages, HeartPulse } from 'lucide-react';

interface LandingPitchPageProps {
  onNavigateToSignIn: () => void;
  onSelectRole?: (role: string) => void;
  onOpenEmergency?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function LandingPitchPage({
  onNavigateToSignIn,
  isDarkMode,
  onToggleDarkMode,
}: LandingPitchPageProps) {
  const { language, toggleLanguage } = useLanguage();
  const isMr = language === 'mr';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-xs font-black text-white">
            MH
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">
            {isMr ? 'महाराष्ट्र सार्वजनिक आरोग्य विभाग' : 'Public Health Dept, Govt. of Maharashtra'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Languages className="w-3.5 h-3.5 text-orange-400" />
            {isMr ? 'EN' : 'मर'}
          </button>
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
          </button>
        </div>
      </header>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8">

        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center shadow-2xl shadow-orange-600/30">
          <HeartPulse className="w-8 h-8 text-white" />
        </div>

        {/* Name */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Swasthya<span className="text-orange-500">Setu</span>
          </h1>
          <p className="text-xl sm:text-2xl font-black text-orange-400 mt-1">
            स्वास्थ्यसेतू
          </p>
        </div>

        {/* Tagline */}
        <p className="text-slate-400 text-sm sm:text-base max-w-sm">
          {isMr
            ? 'महाराष्ट्र सार्वजनिक आरोग्य समन्वय व्यासपीठ'
            : 'Maharashtra Public Health Coordination Platform'}
        </p>

        {/* Single Login Button */}
        <button
          onClick={onNavigateToSignIn}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-base transition-all shadow-xl shadow-orange-600/30 cursor-pointer"
        >
          <span>{isMr ? 'लॉगिन करा' : 'Sign In'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-800">
        {isMr ? 'राष्ट्रीय आरोग्य अभियान · ABDM व DISHA सुसंगत' : 'National Health Mission · ABDM & DISHA Compliant'}
      </footer>

    </div>
  );
}
