'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';
import {
  Download,
  Smartphone,
  Share,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Zap,
  WifiOff,
  Siren,
} from 'lucide-react';

export function MobileAppDownloadBanner() {
  const { language } = useLanguage();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showImmediateModal, setShowImmediateModal] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already installed & running in standalone mobile app mode
    const standaloneCheck =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneCheck);

    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const isMobileWidth = window.innerWidth < 768;
    const mobileDetected = isMobileUA || isMobileWidth;
    setIsMobile(mobileDetected);

    const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIos(isApple);

    // If not standalone and on mobile, show download popup AS SOON AS link opens!
    if (!standaloneCheck && mobileDetected) {
      const dismissed = sessionStorage.getItem('swasthyasetu_download_dismissed');
      // If not explicitly dismissed in this session, trigger immediately
      if (dismissed !== 'true') {
        const timer = setTimeout(() => {
          setShowImmediateModal(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }

    // Capture beforeinstallprompt immediately
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredPwaPrompt = e;
      if (!standaloneCheck) {
        setShowImmediateModal(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if ((window as any).deferredPwaPrompt) {
      setInstallPrompt((window as any).deferredPwaPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptToUse = installPrompt || (typeof window !== 'undefined' ? (window as any).deferredPwaPrompt : null);

    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const choice = await promptToUse.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setInstallSuccess(true);
          setShowImmediateModal(false);
          setInstallPrompt(null);
          if (typeof window !== 'undefined') (window as any).deferredPwaPrompt = null;
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
      return;
    }

    // If on iOS Safari, open visual iOS step guide
    if (isIos) {
      setShowImmediateModal(false);
      setShowIosGuide(true);
      return;
    }

    // Generic Android fallback: show guide
    setShowImmediateModal(false);
    setShowIosGuide(true);
  };

  const handleDismissModal = () => {
    setShowImmediateModal(false);
    try {
      sessionStorage.setItem('swasthyasetu_download_dismissed', 'true');
    } catch (_) {}
  };

  if (!isMobile || isStandalone) {
    return null;
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════════
          1. IMMEDIATE DOWNLOAD POPUP (APPEARS AS SOON AS LINK IS OPENED ON MOBILE)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {showImmediateModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border-2 border-emerald-500/40 dark:border-emerald-500/30 space-y-4 animate-in slide-in-from-bottom-6 duration-300 relative overflow-hidden">
            {/* Top gradient highlight strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />

            {/* Header with App Icon */}
            <div className="flex items-start justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 shrink-0 border border-white/20">
                  <HeartPulse className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Official Mobile App
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      Free
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    SwasthyaSetu App
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    National Health Mission · ABDM
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismissModal}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Value Proposition Highlights */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold">Instant 1-Tap Home Screen Access</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <WifiOff className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold">Works 100% Offline Without Internet</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Siren className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-bold">Emergency 108 SOS Medical Dispatch</span>
              </div>
            </div>

            {/* Primary Action Button: DOWNLOAD / INSTALL APP NOW */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer"
              >
                <Download className="w-4.5 h-4.5 animate-bounce" />
                <span>
                  {getLoc({
                    en: 'Download & Install App Now',
                    kn: 'ಈಗಲೇ ಆಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
                    hi: 'अभी ऐप डाउनलोड व इंस्टॉल करें',
                    ta: 'இப்போதே செயலியை பதிவிறக்குக',
                    te: 'ఇప్పుడే యాప్ డౌన్‌లోడ్ చేసుకోండి',
                    mr: 'आत्ताच ॲप डाउनलोड व इन्स्टॉल करा',
                  })}
                </span>
              </button>

              <button
                onClick={handleDismissModal}
                className="w-full py-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {getLoc({
                  en: 'Continue using web browser',
                  kn: 'ವೆಬ್ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ',
                  hi: 'ब्राउज़र में जारी रखें',
                  ta: 'வலை உலாவியில் தொடரவும்',
                  te: 'బ్రౌజర్‌లో కొనసాగించండి',
                  mr: 'ब्राउझरमध्ये पुढे जा',
                })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          2. STICKY TOP DOWNLOAD BAR (STAYS ACCESSIBLE ON MOBILE AT ALL TIMES)
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-[70] bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white shadow-lg px-3 py-2 border-b border-emerald-400/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shrink-0 border border-white/30">
            <HeartPulse className="w-4 h-4 text-white animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight truncate text-white">
                SwasthyaSetu App
              </span>
              <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded-full bg-emerald-400 text-slate-950">
                Install
              </span>
            </div>
            <p className="text-[10px] text-emerald-100 truncate font-medium">
              1-Tap Offline & 108 SOS Mobile App
            </p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-950 font-black text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>
            {getLoc({
              en: 'Download App',
              kn: 'ಆಪ್ ಡೌನ್‌ಲೋಡ್',
              hi: 'ऐप डाउनलोड',
              ta: 'பதிவிறக்கு',
              te: 'డౌన్‌లోడ్',
              mr: 'ॲप डाउनलोड',
            })}
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          3. INSTALLATION SUCCESS NOTIFICATION
         ═══════════════════════════════════════════════════════════════════════════ */}
      {installSuccess && (
        <div className="fixed top-14 left-4 right-4 z-[110] bg-emerald-600 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2.5 animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <div className="text-xs">
            <p className="font-black">App Installed Successfully!</p>
            <p className="text-[11px] text-emerald-100">SwasthyaSetu is now on your device home screen with offline capability.</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          4. IOS SAFARI / ANDROID BROWSER STEP-BY-STEP INSTALL GUIDE MODAL
         ═══════════════════════════════════════════════════════════════════════════ */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border-2 border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {isIos ? 'Install on iPhone / iPad' : 'Download on Mobile Device'}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Add to your Home Screen in 3 seconds
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {isIos ? 'Tap the Share Button' : 'Tap the Menu Button (⋮)'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isIos ? (
                      <>
                        Tap the share square icon <Share className="w-3.5 h-3.5 text-blue-500 inline mx-0.5" /> at the bottom bar of Safari.
                      </>
                    ) : (
                      'Tap the three dots (⋮) in the top-right corner of your browser.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Select &ldquo;Add to Home Screen&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> (or &ldquo;Install app&rdquo;).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Tap &ldquo;Add&rdquo; / &ldquo;Install&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    The SwasthyaSetu app icon will now appear on your phone&apos;s home screen like a native app.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
