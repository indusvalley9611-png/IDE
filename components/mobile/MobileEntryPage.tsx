'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';
import {
  Siren,
  Phone,
  ShieldCheck,
  Moon,
  Sun,
  Download,
  ChevronRight,
  HeartPulse,
  Users,
  ArrowRight,
  Leaf,
} from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface MobileEntryPageProps {
  onOpenEmergency: () => void;
  onNavigateToSignIn: () => void;
  onNavigateToRuralCitizen?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function MobileEntryPage({
  onOpenEmergency,
  onNavigateToSignIn,
  onNavigateToRuralCitizen,
  isDarkMode,
  onToggleDarkMode,
}: MobileEntryPageProps) {
  const { language } = useLanguage();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  const t = {
    deptHeader: getLoc({
      en: 'Integrated Public Health',
      kn: 'ಸಮಗ್ರ ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ',
      hi: 'एकीकृत सार्वजनिक स्वास्थ्य',
      ta: 'ஒருங்கிணைந்த பொது சுகாதாரம்',
      te: 'సమగ్ర ప్రజా ఆరోగ్యం',
      mr: 'सार्वजनिक आरोग्य व्यासपीठ',
    }),
    installTitle: getLoc({
      en: 'Install SwasthyaSetu App',
      kn: 'ಸ್ವಾಸ್ಥ್ಯಸೇತು ಆಪ್ ಸ್ಥಾಪಿಸಿ',
      hi: 'स्वास्थ सेतु ऐप इंस्टॉल करें',
      ta: 'சுவஸ்த்யாசேது செயலியை நிறுவுக',
      te: 'స్వాస్థ్యసేతు యాప్ ఇన్‌స్టాల్ చేయండి',
      mr: 'होम स्क्रीनवर ॲप जोडा',
    }),
    installDesc: getLoc({
      en: '1-Tap Offline & Emergency Access',
      kn: '೧-ಟ್ಯಾಪ್ ಆಫ್‌ಲೈನ್ ಮತ್ತು ತುರ್ತು ಪ್ರವೇಶ',
      hi: '१-टैप ऑफलाइन और आपातकालीन एक्सेस',
      ta: '1-தட்டல் ஆஃப்லைன் மற்றும் அவசர அணுகல்',
      te: '1-ట్యాప్ ఆఫ్‌లైన్ మరియు అత్యవసర యాక్సెస్',
      mr: '१-टॅप आपत्कालीन व ऑफलाइन प्रवेश',
    }),
    installBtn: getLoc({
      en: 'Install',
      kn: 'ಸ್ಥಾಪಿಸಿ',
      hi: 'इंस्टॉल',
      ta: 'நிறுவுக',
      te: 'ఇన్‌స్టాల్',
      mr: 'डाऊनलोड',
    }),
    sosBadge: getLoc({
      en: 'Immediate SOS',
      kn: 'ತುರ್ತು ಎಸ್‌ಒಎಸ್',
      hi: 'तत्काल एसओएस',
      ta: 'உடனடி எஸ்ஓஎஸ்',
      te: 'తక్షణ ఎస్ఓఎస్',
      mr: 'आपत्कालीन सेवा',
    }),
    sosTitle: getLoc({
      en: '108 Emergency Medical SOS',
      kn: '೧೦೮ ತುರ್ತು ವೈದ್ಯಕೀಯ ಸೇವೆ',
      hi: '१०८ आपातकालीन चिकित्सा एसओएस',
      ta: '108 அவசர மருத்துவ உதவி',
      te: '108 అత్యవసర వైద్య ఎస్ఓఎస్',
      mr: '१०८ तातडीची वैद्यकीय मदत',
    }),
    sosDesc: getLoc({
      en: 'Instant ambulance dispatch, nearest hospital capacity & GPS emergency response.',
      kn: 'ತಕ್ಷಣದ ಆಂಬ್ಯುಲೆನ್ಸ್ ರವಾನೆ, ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ತುರ್ತು ಸ್ಪಂದನೆ.',
      hi: 'त्वरित एम्बुलेंस प्रेषण, नजदीकी अस्पताल क्षमता और आपातकालीन रिस्पॉन्स।',
      ta: 'உடனடி ஆம்புலன்ஸ் அனுப்பல், அருகிலுள்ள மருத்துவமனை படுக்கைகள் மற்றும் உதவி.',
      te: 'తక్షణ అంబులెన్స్ పంపడం, సమీప ఆసుపత్రి పడకలు మరియు అత్యవసర స్పందన.',
      mr: 'अतितातडीची रुग्णवाहिका, जवळचे रुग्णालय बेड शोधणे व इमर्जन्सी ट्रायज.',
    }),
    sosBtn: getLoc({
      en: 'Trigger Emergency SOS (108)',
      kn: 'ತುರ್ತು ಸಹಾಯವನ್ನು ಪ್ರಾರಂಭಿಸಿ (೧೦೮)',
      hi: 'आपातकालीन मदद शुरू करें (१०८)',
      ta: 'அவசர உதவியைத் தொடங்கவும் (108)',
      te: 'అత్యవసర సహాయాన్ని ప్రారంభించండి (108)',
      mr: 'आपत्कालीन मदत सुरू करा',
    }),
    citizenBadge: getLoc({
      en: 'Citizen Health Portal',
      kn: 'ನಾಗರಿಕ ಆರೋಗ್ಯ ಪೋರ್ಟಲ್',
      hi: 'नागरिक स्वास्थ्य पोर्टल',
      ta: 'குடிமக்கள் சுகாதார தளம்',
      te: 'పౌరుల ఆరోగ్య పోర్టల్',
      mr: 'नागरिक सेवा',
    }),
    citizenAccess: getLoc({
      en: 'Direct Access',
      kn: 'ನೇರ ಪ್ರವೇಶ',
      hi: 'सीधा प्रवेश',
      ta: 'நேரடி அணுகல்',
      te: 'ప్రత్యక్ష ప్రవేశం',
      mr: 'सार्वजनिक प्रवेश',
    }),
    citizenTitle: getLoc({
      en: 'Rural Citizen Health Portal',
      kn: 'ಗ್ರಾಮೀಣ ನಾಗರಿಕ ಆರೋಗ್ಯ ಪೋರ್ಟಲ್',
      hi: 'ग्रामीण नागरिक स्वास्थ्य पोर्टल',
      ta: 'கிராமப்புற குடிமக்கள் சுகாதார தளம்',
      te: 'గ్రామీణ పౌరుల ఆరోగ్య పోರ್టల్',
      mr: 'ग्रामीण नागरिक पोर्टल',
    }),
    citizenDesc: getLoc({
      en: 'Self-registration, free medicines & lab tests directory, nearest PHC locator, health alerts & medicine reminders.',
      kn: 'ಸ್ವಯಂ ನೋಂದಣಿ, ಉಚಿತ ಔಷಧಗಳು ಮತ್ತು ಪರೀಕ್ಷೆಗಳು, ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿ ಶೋಧ ಮತ್ತು ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆಗಳು.',
      hi: 'स्व-पंजीकरण, मुफ्त दवाएं और लैब टेस्ट, नजदीकी पीएचसी खोज, और दवा रिमाइंडर।',
      ta: 'சுய பதிவு, இலவச மருந்துகள் & பரிசோதனைகள், அருகிலுள்ள PHC தேடல் மற்றும் நினைவூட்டல்கள்.',
      te: 'స్వయం నమోదు, ఉచిత మందులు & ల్యాబ్ పరీక్షలు, సమీప PHC మరియు హెచ్చరికలు.',
      mr: 'स्व-नोंदणी, मोफत औषधे व तपासण्या यादी, जवळचे PHC शोध, आणि थेट आरोग्य सूचना व स्मरणपत्रे.',
    }),
    citizenBtn: getLoc({
      en: 'Open Rural Citizen Portal',
      kn: 'ಗ್ರಾಮೀಣ ನಾಗರಿಕ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ',
      hi: 'ग्रामीण नागरिक पोर्टल खोलें',
      ta: 'கிராமப்புற குடிமக்கள் தளத்தைத் திறக்கவும்',
      te: 'గ్రామీణ పౌరుల పోర్టల్ తెరవండి',
      mr: 'ग्रामीण नागरिक पोर्टल उघडा',
    }),
    staffBadge: getLoc({
      en: 'Healthcare Gateway',
      kn: 'ಆರೋಗ್ಯ ಗೇಟ್‌ವೇ',
      hi: 'स्वास्थ्य गेटवे',
      ta: 'சுகாதார நுழைவாயில்',
      te: 'ఆరోగ్య గేట్‌వే',
      mr: 'शासकीय पोर्टल',
    }),
    staffTitle: getLoc({
      en: 'Healthcare Staff & Patient Sign In',
      kn: 'ಆರೋಗ್ಯ ಸಿಬ್ಬಂದಿ ಮತ್ತು ರೋಗಿ ಸೈನ್ ಇನ್',
      hi: 'स्वास्थ्य कर्मी और मरीज साइन इन',
      ta: 'சுகாதார ஊழியர்கள் & நோயாளி உள்நுழைவு',
      te: 'ఆరోగ్య సిబ్బంది మరియు రోగి సైన్ ఇన్',
      mr: 'आरोग्य कर्मचारी व रुग्ण प्रवेश',
    }),
    staffDesc: getLoc({
      en: 'ASHA workers, PHC doctors, Specialists, DHO, Nurses, Pharmacists & Citizen ABHA health records.',
      kn: 'ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರು, ಪಿಎಚ್‌ಸಿ ವೈದ್ಯರು, ತಜ್ಞರು, ಡಿಎಚ್‌ಒ ಮತ್ತು ಆಭಾ ಆರೋಗ್ಯ ದಾಖಲೆಗಳು.',
      hi: 'आशा कार्यकर्ता, पीएचसी डॉक्टर, विशेषज्ञ, डीएचओ और नागरिक आभा स्वास्थ्य रिकॉर्ड।',
      ta: 'ஆஷா ஊழியர்கள், PHC மருத்துவர்கள், நிபுணர்கள் மற்றும் ஆபா பதிவுகள்.',
      te: 'ఆశా కార్యకర్తలు, PHC వైద్యులు, నిపుణులు మరియు ఆభా ఆరోగ్య రికార్డులు.',
      mr: 'आशा सेविका, वैद्यकीय अधिकारी, तज्ज्ञ डॉक्टर, जिल्हा अधिकारी व नागरिकांचे आभा (ABHA) ईएचआर रेकॉर्ड्स.',
    }),
    staffBtn: getLoc({
      en: 'Staff Sign In & EHR Access',
      kn: 'ಸಿಬ್ಬಂದಿ ಸೈನ್ ಇನ್ ಮತ್ತು ಇಎಚ್‌ಆರ್ ಪ್ರವೇಶ',
      hi: 'स्टाफ लॉगिन और ईएचआर एक्सेस',
      ta: 'ஊழியர் உள்நுழைவு & EHR அணுகல்',
      te: 'సిబ్బంది సైన్ ఇన్ & EHR ప్రవేశం',
      mr: 'लॉगिन व ईएचआर पोर्टल उघडा',
    }),
    footer: getLoc({
      en: 'Public Health Department · National Health Mission',
      kn: 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಇಲಾಖೆ · ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ',
      hi: 'सार्वजनिक स्वास्थ्य विभाग · राष्ट्रीय स्वास्थ्य मिशन',
      ta: 'பொது சுகாதாரத் துறை · தேசிய சுகாதார இயக்கம்',
      te: 'ప్రజా ఆరోగ్య విభాగం · జాతీయ ఆరోగ్య మిషన్',
      mr: 'सार्वजनिक आरोग्य विभाग · राष्ट्रीय आरोग्य अभियान',
    }),
  };

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true)
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (typeof window !== 'undefined' && (window as any).deferredPwaPrompt) {
      setInstallPrompt((window as any).deferredPwaPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      setIsInstalling(true);
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsInstalled(true);
          setInstallPrompt(null);
        }
      } catch (err) {
        console.error('PWA install error:', err);
      } finally {
        setIsInstalling(false);
      }
    } else {
      alert(
        language === 'mr'
          ? 'तुमच्या फोनच्या होम स्क्रीनवर ॲप जोडण्यासाठी: ब्राउझरच्या शेअर किंवा तीन ठिपक्यांच्या मेनूवर टॅप करा आणि "Add to Home Screen / होम स्क्रीनवर जोडा" निवडा.'
          : 'To add SwasthyaSetu to your Home Screen: Tap your browser share or menu button (⋮) and select "Add to Home Screen".'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 selection:bg-rose-500 selection:text-white">
      
      {/* ── 1. MOBILE APP TOP BAR (Clean Light & Dark Header) ── */}
      <header className="px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-300">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-rose-950/30 shrink-0">
            <HeartPulse className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white block leading-none">
              Swasthya<span className="text-emerald-600 dark:text-emerald-400">Setu</span>
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase block mt-0.5">
              {t.deptHeader}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* 6-Language Selector */}
          <LanguageSelector dropdownAlign="right" />
        </div>
      </header>

      {/* ── 2. MAIN 3-OPTION ACTION HUB ── */}
      <main className="flex-1 flex flex-col justify-center px-4 py-5 max-w-md mx-auto w-full space-y-4">
        
        {/* PWA "Add to Home Screen" Download Banner */}
        {!isInstalled && (
          <div className="rounded-2xl p-3.5 bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between gap-3 shadow-md transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500/20 text-white dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-500/30 shadow-xs">
                <Download className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {t.installTitle}
                </p>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-300/80 truncate font-medium">
                  {t.installDesc}
                </p>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 active:scale-95 text-white dark:text-slate-950 font-black text-xs shadow-md transition-all shrink-0 cursor-pointer"
            >
              {isInstalling ? '...' : t.installBtn}
            </button>
          </div>
        )}

        {/* ═══ OPTION 1: EMERGENCY SOS (TOP, PROMINENT, HIGH URGENCY) ═══ */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 rounded-3xl blur-xs opacity-70 group-hover:opacity-100 transition duration-300 animate-pulse" />
          
          <div className="relative rounded-2xl bg-gradient-to-b from-rose-50 via-red-50/80 to-amber-50/40 dark:from-rose-950/95 dark:via-red-950/90 dark:to-slate-900 border-2 border-rose-500 dark:border-rose-500/80 p-5 shadow-xl flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Siren className="w-3.5 h-3.5 animate-bounce" />
                  <span>{t.sosBadge}</span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md border border-rose-300 dark:border-rose-700/50">
                  Dial 108
                </span>
              </div>

              <h2 className="text-xl font-black text-rose-950 dark:text-white leading-tight">
                {t.sosTitle}
              </h2>

              <p className="text-xs text-rose-900/80 dark:text-rose-200/80 mt-1.5 leading-relaxed font-medium">
                {t.sosDesc}
              </p>
            </div>

            <button
              onClick={onOpenEmergency}
              className="mt-5 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-98 text-white font-black text-sm tracking-wide shadow-lg shadow-rose-900/40 dark:shadow-rose-900/70 flex items-center justify-center gap-2 cursor-pointer transition-transform"
            >
              <Phone className="w-4.5 h-4.5" />
              <span>{t.sosBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══ OPTION 2: RURAL CITIZEN PORTAL (PRIMARY CITIZEN ENTRY) ═══ */}
        {onNavigateToRuralCitizen && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border-2 border-emerald-500/60 p-5 shadow-lg flex flex-col justify-between hover:border-emerald-500 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.citizenBadge}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700/50">
                  {t.citizenAccess}
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {t.citizenTitle}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {t.citizenDesc}
              </p>
            </div>

            <button
              onClick={onNavigateToRuralCitizen}
              className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black text-xs tracking-wide shadow-md shadow-emerald-950/20 dark:shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-transform"
            >
              <Leaf className="w-4 h-4" />
              <span>{t.citizenBtn}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ═══ OPTION 3: SIGN IN & HEALTHCARE STAFF EHR GATEWAY ═══ */}
        <div className="rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t.staffBadge}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                ABDM Enabled
              </span>
            </div>

            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {t.staffTitle}
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              {t.staffDesc}
            </p>
          </div>

          <button
            onClick={onNavigateToSignIn}
            className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-700 via-slate-800 to-indigo-800 hover:from-teal-600 hover:to-slate-700 active:scale-98 text-white font-black text-xs tracking-wide shadow-md shadow-slate-950/20 dark:shadow-slate-950/50 flex items-center justify-center gap-2 cursor-pointer transition-transform"
          >
            <Users className="w-4 h-4" />
            <span>{t.staffBtn}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </main>

      {/* ── 3. FOOTER TRUST STRIP ── */}
      <footer className="px-4 py-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-center transition-colors">
        <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
          <span>{t.footer}</span>
        </div>
      </footer>

    </div>
  );
}
