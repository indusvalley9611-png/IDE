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
} from 'lucide-react';

export function MobileAppDownloadBanner() {
  const { language } = useLanguage();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running as installed standalone PWA
    const standaloneCheck =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneCheck);

    // Check if mobile device or viewport
    const checkMobile = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isMobileWidth = window.innerWidth < 768;
      setIsMobile(isMobileUA || isMobileWidth);

      const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsIos(isApple);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('swasthyasetu_download_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // Capture PWA beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredPwaPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if ((window as any).deferredPwaPrompt) {
      setInstallPrompt((window as any).deferredPwaPrompt);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setInstallSuccess(true);
          setInstallPrompt(null);
          setTimeout(() => setIsDismissed(true), 3500);
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
      return;
    }

    // If on iOS, open visual guide
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    // Generic fallback: check if Chrome on Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      alert(
        getLoc({
          en: 'To download SwasthyaSetu: Tap the 3 dots (⋮) menu in Chrome and select "Install app" or "Add to Home screen".',
          kn: 'ಸ್ವಾಸ್ಥ್ಯಸೇತು ಆಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು: ಕ್ರೋಮ್ ಮೆನು (⋮) ತೆರೆದು "Install app" ಆಯ್ಕೆಮಾಡಿ.',
          hi: 'स्वास्थ सेतु ऐप डाउनलोड करने के लिए: क्रोम मेनू (⋮) पर टैप करें और "Install app" चुनें।',
          ta: 'செயலியை பதிவிறக்க: குரோம் மெனுவில் (⋮) "Install app" என்பதை தேர்ந்தெடுக்கவும்.',
          te: 'యాప్ డౌన్‌లోడ్ చేయడానికి: క్రోమ్ మెనూ (⋮) లో "Install app" ఎంచుకోండి.',
          mr: 'स्वास्थ सेतू ॲप डाउनलोड करण्यासाठी: क्रोम मेनू (⋮) टॅप करा आणि "Install app" निवडा.',
        })
      );
    } else {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('swasthyasetu_download_dismissed', 'true');
    } catch (_) {}
  };

  // If already running as installed app or dismissed or not on mobile, do not render banner
  if (!isMobile || isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* ── STICKY TOP/BOTTOM MOBILE DOWNLOAD BAR ── */}
      <div className="fixed top-0 left-0 right-0 z-[85] bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white shadow-xl px-3.5 py-2.5 border-b border-emerald-400/30 flex items-center justify-between gap-2.5 animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shrink-0 border border-white/30 shadow-xs relative">
            <HeartPulse className="w-4.5 h-4.5 text-white animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-emerald-300 absolute -top-0.5 -right-0.5 ring-2 ring-emerald-900" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight truncate text-white">
                SwasthyaSetu Mobile App
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-emerald-100/90 truncate font-medium">
              {getLoc({
                en: 'Install app for 1-Tap Offline & SOS',
                kn: 'ಆಫ್‌ಲೈನ್ ಮತ್ತು ೧೦೮ ತುರ್ತು ಸೇವೆಗೆ ಆಪ್ ಸ್ಥಾಪಿಸಿ',
                hi: '१-टैप ऑफलाइन और आपातकालीन सेवा हेतु ऐप इंस्टॉल करें',
                ta: 'ஆஃப்லைன் பயன்பாட்டிற்கு செயலியை நிறுவுக',
                te: 'ఆఫ్‌లైన్ సేవల కొరకు యాప్ ఇన్‌స్టాల్ చేయండి',
                mr: '१-टॅप ऑफलाइन व १०८ आपत्कालीन सेवेसाठी ॲप इन्स्टॉल करा',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-950 font-black text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700 animate-bounce" />
            <span>
              {getLoc({
                en: 'Download App',
                kn: 'ಡೌನ್‌ಲೋಡ್ ಆಪ್',
                hi: 'ऐप डाउनलोड करें',
                ta: 'பதிவிறக்கு',
                te: 'డౌన్‌లోడ్',
                mr: 'ॲप डाउनलोड',
              })}
            </span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── SUCCESS TOAST NOTIFICATION ── */}
      {installSuccess && (
        <div className="fixed top-14 left-4 right-4 z-[90] bg-emerald-600 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2.5 animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <div className="text-xs">
            <p className="font-black">App Installed Successfully!</p>
            <p className="text-[11px] text-emerald-100">SwasthyaSetu is now on your home screen with offline capability.</p>
          </div>
        </div>
      )}

      {/* ── IOS / SAFARI INSTALLATION GUIDE MODAL ── */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {getLoc({
                    en: 'Download on iPhone / iPad',
                    kn: 'ಐಫೋನ್‌ನಲ್ಲಿ ಆಪ್ ಸ್ಥಾಪಿಸಿ',
                    hi: 'आईफोन में ऐप इंस्टॉल करें',
                    ta: 'ஐபோனில் செயலியை நிறுவுக',
                    te: 'ఐఫోన్‌లో యాప్ ఇన్‌స్టాల్ చేయండి',
                    mr: 'आयफोनमध्ये ॲप डाउनलोड करा',
                  })}
                </h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {getLoc({
                      en: 'Tap the Share Button',
                      kn: 'ಶೇರ್ ಬಟನ್ ಟ್ಯಾಪ್ ಮಾಡಿ',
                      hi: 'शेयर बटन पर टैप करें',
                      ta: 'பகிர் பொத்தானைத் தட்டவும்',
                      te: 'షేర్ బటన్‌ను నొక్కండి',
                      mr: 'शेअर बटनावर टॅप करा',
                    })}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    Tap the square icon with an arrow <Share className="w-3.5 h-3.5 text-blue-500 inline" /> at the bottom of Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {getLoc({
                      en: 'Select "Add to Home Screen"',
                      kn: '"ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ" ಆಯ್ಕೆಮಾಡಿ',
                      hi: '"Add to Home Screen" चुनें',
                      ta: '"Add to Home Screen" என்பதைத் தேர்ந்தெடுக்கவும்',
                      te: '"Add to Home Screen" ఎంచుకోండి',
                      mr: '"Add to Home Screen" निवडा',
                    })}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Scroll down the share sheet and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {getLoc({
                      en: 'Tap "Add" in Top Right',
                      kn: 'ಮೇಲಿನ ಬಲಭಾಗದಲ್ಲಿ "Add" ಟ್ಯಾಪ್ ಮಾಡಿ',
                      hi: 'ऊपर दाईं ओर "Add" पर टैप करें',
                      ta: 'மேலே உள்ள "Add" என்பதைத் தட்டவும்',
                      te: 'పైభాగంలో "Add" నొక్కండి',
                      mr: 'वर उजवीकडे "Add" टॅप करा',
                    })}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    SwasthyaSetu will now launch as a dedicated native app from your home screen.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
