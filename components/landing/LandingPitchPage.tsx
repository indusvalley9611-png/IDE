'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ArrowRight, Moon, Sun, HeartPulse, PhoneCall, ShieldCheck } from 'lucide-react';

interface LandingPitchPageProps {
  onNavigateToSignIn: () => void;
  onSelectRole?: (role: string) => void;
  onOpenEmergency?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function LandingPitchPage({
  onNavigateToSignIn,
  onOpenEmergency,
  isDarkMode,
  onToggleDarkMode,
}: LandingPitchPageProps) {
  const { language } = useLanguage();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  const t = {
    deptHeader: getLoc({
      en: 'Public Health Department, Government Health Platform',
      kn: 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಇಲಾಖೆ, ಸರ್ಕಾರಿ ಆರೋಗ್ಯ ವೇದಿಕೆ',
      hi: 'सार्वजनिक स्वास्थ्य विभाग, सरकारी स्वास्थ्य मंच',
      ta: 'பொது சுகாதாரத் துறை, அரசு சுகாதார தளம்',
      te: 'ప్రజా ఆరోగ్య విభాగం, ప్రభుత్వ ఆరోగ్య వేదిక',
      mr: 'महाराष्ट्र सार्वजनिक आरोग्य विभाग',
    }),
    appTitle: getLoc({
      en: 'SwasthyaSetu',
      kn: 'ಸ್ವಾಸ್ಥ್ಯಸೇತು',
      hi: 'स्वास्थ्यसेतु',
      ta: 'சுவஸ்த்யாசேது',
      te: 'స్వాస్థ్యసేతు',
      mr: 'स्वास्थ्यसेतू',
    }),
    tagline: getLoc({
      en: 'Integrated Public Health Coordination & Smart Triage Platform',
      kn: 'ಸಮಗ್ರ ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಸಮನ್ವಯ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ರೆಫರಲ್ ವೇದಿಕೆ',
      hi: 'एकीकृत सार्वजनिक स्वास्थ्य समन्वय और स्मार्ट रेफरल मंच',
      ta: 'ஒருங்கிணைந்த பொது சுகாதார ஒருங்கிணைப்பு மற்றும் ஸ்மார்ட் பரிந்துரை தளம்',
      te: 'సమగ్ర ప్రజా ఆరోగ్య సమన్వయ మరియు స్మార్ట్ రిఫరల్ వేదిక',
      mr: 'महाराष्ट्र सार्वजनिक आरोग्य समन्वय व गतिमान ट्रायज व्यासपीठ',
    }),
    signInBtn: getLoc({
      en: 'Sign In / Access Portal',
      kn: 'ಲಾಗ್ ಇನ್ ಮಾಡಿ / ಪೋರ್ಟಲ್ ಪ್ರವೇಶ',
      hi: 'लॉगिन करें / पोर्टल खोलें',
      ta: 'உள்நுழைக / தளம் அணுகல்',
      te: 'సైన్ ఇన్ చేయండి / పోర్టల్ తెరవండి',
      mr: 'लॉगिन करा / पोर्टल उघडा',
    }),
    ambulanceBadge: getLoc({
      en: 'EMERGENCY AMBULANCE',
      kn: 'ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್',
      hi: 'आपातकालीन एम्बुलेंस',
      ta: 'அவசர ஆம்புலன்ஸ்',
      te: 'అత్యవసర అంబులెన్స్',
      mr: 'तातडीची रुग्णवाहिका',
    }),
    emergencyHelpline: getLoc({
      en: '108 Helpline',
      kn: '೧೦೮ ಸಹಾಯವಾಣಿ',
      hi: '१०८ हेल्पलाइन',
      ta: '108 உதவி எண்',
      te: '108 హెల్ప్‌లైన్',
      mr: '१०८ मदत केंद्र',
    }),
    footer: getLoc({
      en: 'National Health Mission · ABDM & DISHA Compliant · 24x7 Offline First',
      kn: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ · ABDM ಮತ್ತು DISHA ಅನುಸರಣೆ · ಆಫ್‌ಲೈನ್ ಸಿದ್ಧ',
      hi: 'राष्ट्रीय स्वास्थ्य मिशन · ABDM और DISHA अनुपालन · 24x7 ऑफलाइन सक्षम',
      ta: 'தேசிய சுகாதார இயக்கம் · ABDM & DISHA இணக்கம் · ஆஃப்லைன் இயக்கம்',
      te: 'జాతీయ ఆరోగ్య మిషన్ · ABDM & DISHA అనుకూలం · ఆఫ్‌లైన్ సిద్ధం',
      mr: 'राष्ट्रीय आरोग्य अभियान · ABDM व DISHA सुसंगत · २४x७ ऑफलाईन सक्षम',
    }),
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 relative selection:bg-orange-500 selection:text-white">

      {/* ── TOP BAR (Clean Light & Dark Header) ── */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-orange-600/30 shrink-0">
            MH
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold hidden sm:inline">
            {t.deptHeader}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* 6-Language Dropdown Selector */}
          <LanguageSelector dropdownAlign="right" />
        </div>
      </header>

      {/* ── CENTER CONTENT HERO ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center gap-8 max-w-xl mx-auto w-full">

        {/* Logo Icon */}
        <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-orange-600/30 text-white animate-in zoom-in-95 duration-200">
          <HeartPulse className="w-10 h-10 text-white animate-pulse" />
        </div>

        {/* Platform Name */}
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Swasthya<span className="text-orange-600 dark:text-orange-500">Setu</span>
          </h1>
          <p className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400">
            {t.appTitle}
          </p>
        </div>

        {/* Tagline */}
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-md font-medium leading-relaxed">
          {t.tagline}
        </p>

        {/* Main Sign In / Access Portal Button */}
        <button
          onClick={onNavigateToSignIn}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-base transition-all shadow-xl shadow-orange-600/30 cursor-pointer group"
        >
          <span>{t.signInBtn}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

      </main>

      {/* ── FLOATING RED EMERGENCY SOS BUTTON (108) ── */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => onOpenEmergency ? onOpenEmergency() : onNavigateToSignIn()}
          className="flex items-center gap-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-rose-600/50 transition-all border-2 border-white/40 text-sm font-black cursor-pointer group"
          aria-label="Call 108 Emergency Helpline"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <PhoneCall className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase font-black tracking-wider text-rose-200 leading-none">
              {t.ambulanceBadge}
            </div>
            <div className="text-sm sm:text-base font-black leading-tight">
              {t.emergencyHelpline}
            </div>
          </div>
          <span className="relative flex h-3 w-3 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </button>
      </div>

      {/* ── FOOTER COMPLIANCE ── */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 transition-colors">
        <div className="flex items-center justify-center gap-1.5 font-medium px-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t.footer}</span>
        </div>
      </footer>

    </div>
  );
}
