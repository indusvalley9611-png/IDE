'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSync } from '@/context/SyncContext';
import { Role } from '@/lib/types';
import {
  Users,
  Stethoscope,
  HeartPulse,
  Languages,
  Moon,
  Sun,
  Shield,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Wifi,
  WifiOff,
  X,
  Check,
  Lock,
  HelpCircle,
  PhoneCall,
  Activity,
  Building2,
  UserCheck,
  Smartphone,
  ChevronRight,
  Sparkles,
  Database,
  CheckCircle2,
  ArrowUpRight,
  Send,
  AlertTriangle,
} from 'lucide-react';

interface LandingPitchPageProps {
  onNavigateToSignIn: () => void;
  onSelectRole?: (role: Role | 'patient') => void;
  onOpenEmergency?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function LandingPitchPage({
  onNavigateToSignIn,
  onSelectRole,
  onOpenEmergency,
  isDarkMode,
  onToggleDarkMode,
}: LandingPitchPageProps) {
  const { language, toggleLanguage } = useLanguage();
  const {
    effectiveOnline,
    isSimulatedOffline,
    isSyncing,
    syncQueue,
    triggerManualSync,
    toggleSimulatedOffline,
  } = useSync();

  const isMr = language === 'mr';

  // Compliance Explainer Modal State
  const [complianceModal, setComplianceModal] = useState<'ABDM' | 'DISHA' | 'OFFLINE' | null>(null);

  // Phone Mockup Interactive Simulation State
  const [phoneOnline, setPhoneOnline] = useState<boolean>(false);
  const [phoneStep, setPhoneStep] = useState<'form' | 'enqueued' | 'syncing' | 'synced'>('form');
  const [phoneVitals, setPhoneVitals] = useState({
    name: 'प्रिया कांबळे (Priya Kamble)',
    bp: '150/95',
    hb: '9.2',
    risk: 'High (Pre-eclampsia)',
  });
  const [autoSimActive, setAutoSimActive] = useState<boolean>(true);

  // Auto-cycle the phone demo every few seconds to show the journey effortlessly
  useEffect(() => {
    if (!autoSimActive) return;
    const timer = setInterval(() => {
      setPhoneStep((prev) => {
        if (prev === 'form') {
          return 'enqueued';
        }
        if (prev === 'enqueued') {
          setPhoneOnline(true);
          return 'syncing';
        }
        if (prev === 'syncing') {
          return 'synced';
        }
        // synced -> reset back to offline form
        setPhoneOnline(false);
        return 'form';
      });
    }, 3800);
    return () => clearInterval(timer);
  }, [autoSimActive]);

  const handleManualPhoneAction = () => {
    setAutoSimActive(false);
    if (phoneStep === 'form') {
      setPhoneStep('enqueued');
    } else if (phoneStep === 'enqueued') {
      setPhoneOnline(true);
      setPhoneStep('syncing');
      setTimeout(() => setPhoneStep('synced'), 1600);
    } else if (phoneStep === 'synced') {
      setPhoneOnline(false);
      setPhoneStep('form');
    }
  };

  // Animated Stat Counters on Scroll / Mount
  const [countersVisible, setCountersVisible] = useState(false);
  const [statVals, setStatVals] = useState({ subcentres: 0, timeReduction: 0, offlineAvail: 0, abhaCount: 0 });
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCountersVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!countersVisible) return;
    const duration = 1500;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      const progress = Math.min(1, frame / totalFrames);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);

      setStatVals({
        subcentres: Math.round(14 * eased),
        timeReduction: Math.round(73 * eased),
        offlineAvail: Math.round(100 * eased),
        abhaCount: Math.round(1240 * eased),
      });

      if (frame >= totalFrames) clearInterval(interval);
    }, frameRate);

    return () => clearInterval(interval);
  }, [countersVisible]);

  // Convert numbers to Marathi numerals if Marathi is active
  const toDevanagari = (num: number | string) => {
    if (!isMr) return String(num);
    const dMap: { [key: string]: string } = {
      '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
      '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
    };
    return String(num).replace(/[0-9]/g, (w) => dMap[w] || w);
  };

  const handleRoleCardClick = (roleKey: Role | 'patient') => {
    if (onSelectRole) {
      onSelectRole(roleKey);
    } else {
      onNavigateToSignIn();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">

      {/* ── 1. GOVERNMENT HEADER BAR WITH GROUPED CONTROLS ── */}
      <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white px-3 sm:px-8 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left Emblem & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-lg shadow-orange-600/30 border border-orange-400/30">
              MH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                  {isMr
                    ? 'सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन'
                    : 'Public Health Department, Government of Maharashtra'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                {isMr
                  ? 'राष्ट्रीय आरोग्य अभियान · राष्ट्रीय डिजिटल आरोग्य परिसंस्था'
                  : 'National Health Mission · National Digital Health Ecosystem'}
              </p>
            </div>
          </div>

          {/* Right Grouped Controls: Status, Sim Toggle, Theme, Language & Emergency/Login */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            
            {/* Live Connectivity Badge */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${
              effectiveOnline
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
            }`}>
              {effectiveOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>
                {effectiveOnline
                  ? (isMr ? 'ऑनलाईन (थेट सिंक)' : 'Online (Live Sync)')
                  : (isMr ? 'ऑफलाईन (स्थानिक DB)' : 'Offline (Local DB)')}
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="font-mono">
                {isMr ? `${toDevanagari(syncQueue.length)} प्रलंबित` : `${syncQueue.length} queued`}
              </span>
              {syncQueue.length > 0 && (
                <button
                  onClick={() => triggerManualSync()}
                  disabled={isSyncing}
                  className="ml-1 p-0.5 rounded hover:bg-emerald-800/50 text-white cursor-pointer"
                  title={isMr ? 'प्रलंबित नोंदी सिंक करा' : 'Sync queued changes'}
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* Grouped Header Controls Box */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              {/* Renamed "Demo: Offline Mode" button */}
              <button
                onClick={toggleSimulatedOffline}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  isSimulatedOffline
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={isMr ? 'ग्रामीण नेटवर्क स्थिती चाचणी' : 'Toggle simulated rural network disconnection'}
              >
                {isSimulatedOffline ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span className="hidden sm:inline">{isMr ? 'नेटवर्क जोडा' : 'Reconnect'}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-orange-400" />
                    <span>{isMr ? 'डेमो: ऑफलाईन मोड' : 'Demo: Offline Mode'}</span>
                  </>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="px-2 py-1 rounded-lg text-slate-200 text-xs font-bold hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                title="Switch Language / भाषा बदला"
              >
                <Languages className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] font-black">
                  {isMr ? 'मराठी' : 'EN'}
                </span>
              </button>
            </div>

            {/* Quick Emergency 108 Trigger in Header */}
            <button
              onClick={() => onOpenEmergency ? onOpenEmergency() : onNavigateToSignIn()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-rose-600/30 cursor-pointer"
              title="१०८ आपत्कालीन रुग्णवाहिका / Emergency Ambulance 108"
            >
              <PhoneCall className="w-3.5 h-3.5 fill-white" />
              <span>{isMr ? '१०८ रुग्णवाहिका' : '108 Helpline'}</span>
            </button>

            {/* Sign In CTA */}
            <button
              onClick={onNavigateToSignIn}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/30"
            >
              <span>{isMr ? 'लॉगिन' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION WITH ASHA PHONE MOCKUP (TIGHTENED SPACING & HIGH CONTRAST) ── */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 px-4 sm:px-8 pt-8 pb-10 sm:py-12 relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Bold Typography & Compliance Badges (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Badges Strip with High Contrast & Larger Size */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/50 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                {isMr ? 'ABDM व DISHA प्रमाणित' : 'ABDM & DISHA COMPLIANT'}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                {isMr ? '१००% ऑफलाईन-सक्षम' : '100% Offline-Capable'}
              </span>
            </div>

            {/* Permanent Bilingual Brand Wordmark */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                Swasthya<span className="text-orange-500">Setu</span>
              </h1>
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-orange-400">
                स्वास्थ्य<span className="text-white">सेतू</span>
              </div>
            </div>

            {/* High Contrast, Larger Subtitle */}
            <p className="text-base sm:text-xl text-slate-200 font-medium leading-relaxed max-w-2xl">
              {isMr ? (
                <>
                  दुर्गम ग्रामीण व आदिवासी पाड्यांतील <strong className="text-white font-extrabold underline decoration-orange-500 underline-offset-4">आशा कार्यकर्त्यांना</strong>{' '}
                  <strong className="text-white font-extrabold">प्राथमिक आरोग्य केंद्रे (PHC)</strong> आणि{' '}
                  <strong className="text-white font-extrabold">जिल्हा रुग्णालयांशी</strong> अखंड जोडणारे शून्य-डेटा-हानी सार्वजनिक आरोग्य समन्वय व्यासपीठ.
                </>
              ) : (
                <>
                  Multi-tier public healthcare coordination platform connecting{' '}
                  <strong className="text-white font-extrabold underline decoration-orange-500 underline-offset-4">ASHA Workers</strong> in remote hamlets with{' '}
                  <strong className="text-white font-extrabold">PHCs</strong> and <strong className="text-white font-extrabold">District Hospitals</strong> with guaranteed zero data loss.
                </>
              )}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <button
                onClick={onNavigateToSignIn}
                className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
              >
                <span>{isMr ? 'आरोग्य पोर्टलवर प्रवेश करा' : 'Access Healthcare Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenEmergency && (
                <button
                  onClick={onOpenEmergency}
                  className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-rose-600/30 flex items-center gap-2 cursor-pointer border border-rose-500/40"
                >
                  <PhoneCall className="w-4 h-4 fill-white" />
                  <span>{isMr ? '१०८ आपत्कालीन मदत' : 'Emergency 108'}</span>
                </button>
              )}
            </div>

            {/* Compliance badges pill buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <button
                onClick={() => setComplianceModal('ABDM')}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>{isMr ? 'ABDM टप्पे (M1-M3)' : 'ABDM Milestones (M1-M3)'}</span>
                <HelpCircle className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => setComplianceModal('DISHA')}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isMr ? 'DISHA डेटा गोपनीयता' : 'DISHA Privacy Norms'}</span>
                <HelpCircle className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => setComplianceModal('OFFLINE')}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-orange-400" />
                <span>{isMr ? 'स्थानिक IndexedDB सुरक्षितता' : 'IndexedDB Resilience'}</span>
                <HelpCircle className="w-3 h-3 text-slate-500" />
              </button>
            </div>

          </div>

          {/* Right Column: Interactive Phone Mockup (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[340px] sm:max-w-[360px] bg-slate-950 rounded-[44px] p-3 border-4 border-slate-700/80 shadow-2xl shadow-orange-500/10 relative">
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-2 z-30 border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="w-8 h-1.5 rounded-full bg-slate-800" />
              </div>

              {/* Phone Screen Container */}
              <div className="bg-slate-900 rounded-[36px] overflow-hidden border border-slate-800 flex flex-col pt-8 pb-3 px-3.5 min-h-[490px] relative text-slate-100">
                
                {/* Simulated Phone Top Status Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 border-b border-slate-800 font-mono">
                  <span className="font-bold text-white">09:41</span>
                  <div className="flex items-center gap-2">
                    {phoneOnline ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Wifi className="w-3 h-3" /> 4G LTE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <WifiOff className="w-3 h-3" /> {isMr ? 'नेटवर्क नाही' : 'No Signal'}
                      </span>
                    )}
                    <span>94%</span>
                  </div>
                </div>

                {/* Simulated App Header inside Phone */}
                <div className="pt-2.5 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-orange-600 flex items-center justify-center text-[10px] font-black text-white">
                      MH
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-white leading-tight">
                        {isMr ? 'आशा सहाय्यक' : 'ASHA Sahayak'}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {isMr ? 'वेल्हे उपकेंद्र · पुणे' : 'Velhe Sub-Centre · Pune'}
                      </div>
                    </div>
                  </div>

                  {/* Mode Badge */}
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    phoneOnline
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  }`}>
                    {phoneOnline ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        {isMr ? 'ऑनलाईन' : 'ONLINE'}
                      </>
                    ) : (
                      <>
                        <Database className="w-2.5 h-2.5 text-amber-400" />
                        {isMr ? 'ऑफलाईन' : 'OFFLINE'}
                      </>
                    )}
                  </span>
                </div>

                {/* Main Screen State Animation */}
                <div className="flex-1 flex flex-col justify-between py-2 space-y-2">
                  
                  {/* Step Banner */}
                  <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/80">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-orange-400 font-bold uppercase tracking-wide">
                        {phoneStep === 'form' && (isMr ? '१. ऑफलाईन नोंदणी' : '1. Offline Screening')}
                        {phoneStep === 'enqueued' && (isMr ? '२. स्थानिक साठवणूक' : '2. IndexedDB Enqueued')}
                        {phoneStep === 'syncing' && (isMr ? '३. सर्व्हर समक्रमण' : '3. Network Syncing')}
                        {phoneStep === 'synced' && (isMr ? '४. रेफरल पूर्ण' : '4. Referral Closed-Loop')}
                      </span>
                      <span className="text-slate-400 font-mono text-[9px]">
                        {phoneStep === 'synced' ? '100%' : phoneStep === 'syncing' ? '75%' : phoneStep === 'enqueued' ? '50%' : '25%'}
                      </span>
                    </div>

                    {/* Progress bar inside phone */}
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-orange-500 transition-all duration-500 ${
                        phoneStep === 'form' ? 'w-1/4' : phoneStep === 'enqueued' ? 'w-2/4' : phoneStep === 'syncing' ? 'w-3/4' : 'w-full bg-emerald-500'
                      }`} />
                    </div>
                  </div>

                  {/* Dynamic Card Display */}
                  <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {isMr ? 'गरोदर माता तपासणी' : 'ANC Triage Encounter'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                        {isMr ? 'उच्च धोका' : 'High Risk'}
                      </span>
                    </div>

                    <div>
                      <div className="font-black text-white text-xs">{phoneVitals.name}</div>
                      <div className="text-[10px] text-slate-400">ABHA: 91-8821-4402-1920</div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">{isMr ? 'रक्तदाब (BP)' : 'Blood Pressure'}</span>
                        <span className="text-xs font-black text-rose-400">{phoneVitals.bp} mmHg</span>
                      </div>
                      <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">{isMr ? 'हिमोग्लोबिन' : 'Haemoglobin'}</span>
                        <span className="text-xs font-black text-amber-400">{phoneVitals.hb} g/dL</span>
                      </div>
                    </div>

                    {/* Status Feedback in Phone */}
                    <div className="pt-1">
                      {phoneStep === 'form' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded-lg border border-amber-900/50">
                          <Database className="w-3 h-3 shrink-0" />
                          <span>{isMr ? 'नेटवर्क नसताना नोंदी सुरक्षित केल्या' : 'Capturing vitals locally without cellular network'}</span>
                        </div>
                      )}
                      {phoneStep === 'enqueued' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-300 bg-blue-950/40 p-1.5 rounded-lg border border-blue-900/50">
                          <Database className="w-3 h-3 shrink-0" />
                          <span>{isMr ? 'स्थानिक IndexedDB रांगेत (१ प्रलंबित)' : 'Encrypted in local IndexedDB (1 queued)'}</span>
                        </div>
                      )}
                      {phoneStep === 'syncing' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-purple-300 bg-purple-950/40 p-1.5 rounded-lg border border-purple-900/50 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                          <span>{isMr ? 'वेल्हे PHC कडे पाठवत आहे...' : 'Pushing to Velhe PHC node via 4G...'}</span>
                        </div>
                      )}
                      {phoneStep === 'synced' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-900/50">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{isMr ? 'औंध जिल्हा रुग्णालयात ICU बेड #०४ आरक्षित' : 'ICU Bed #04 Reserved at Aundh District Hospital'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Trigger Button inside Phone */}
                  <button
                    onClick={handleManualPhoneAction}
                    className="w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {phoneStep === 'form' && (
                      <>
                        <Database className="w-3 h-3" />
                        <span>{isMr ? 'ऑफलाईन नोंदणी साठवा' : 'Save Offline Record'}</span>
                      </>
                    )}
                    {phoneStep === 'enqueued' && (
                      <>
                        <Wifi className="w-3 h-3" />
                        <span>{isMr ? 'नेटवर्क जोडून सिंक करा' : 'Connect 4G & Sync Now'}</span>
                      </>
                    )}
                    {phoneStep === 'syncing' && (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>{isMr ? 'समक्रमण सुरू आहे...' : 'Syncing Encounters...'}</span>
                      </>
                    )}
                    {phoneStep === 'synced' && (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        <span>{isMr ? 'पुन्हा प्रात्यक्षिक पहा' : 'Restart Phone Demo'}</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <span className="text-[9px] text-slate-500">
                      {isMr ? '📱 आशा कार्यकर्त्या टॅब्लेट / मोबाईल सिम्युलेटर' : '📱 ASHA Tablet / Smartphone Simulator'}
                    </span>
                  </div>

                </div>

                {/* Phone Bottom Home Bar */}
                <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-1" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. QUANTIFIED IMPACT & PILOT METRICS (ANIMATED ON SCROLL + SOURCE FOOTNOTE) ── */}
      <section ref={statsRef} className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-8 shadow-inner">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            
            {/* Stat 1: Subcentres */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-orange-500/40 transition-colors">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-500/30">
                {isMr ? 'प्रायोगिक डेटा (PILOT)' : 'PILOT DATA'}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-orange-400 mt-2 font-mono">
                {toDevanagari(statVals.subcentres)}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200 mt-1">
                {isMr ? 'उपकेंद्रे व प्राथमिक केंद्रे' : 'Sub-Centres & PHCs Mapped'}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {isMr ? 'पुणे ग्रामीण (वेल्हे व नसरापूर)' : 'Pune Rural (Velhe & Nasrapur)'}
              </span>
            </div>

            {/* Stat 2: Referral Time */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-orange-500/40 transition-colors">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                {isMr ? 'प्रक्षेपित (PROJECTED)' : 'PROJECTED'}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2 font-mono">
                {toDevanagari(statVals.timeReduction)}%
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200 mt-1">
                {isMr ? 'रेफरल वेळेत बचत' : 'Referral Time Reduction'}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {isMr ? 'तातडीचे डिजिटल मार्ग नियोजन' : 'Smart Digital Transit Routing'}
              </span>
            </div>

            {/* Stat 3: Offline Availability */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-orange-500/40 transition-colors">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                {isMr ? 'प्रायोगिक डेटा (PILOT)' : 'PILOT DATA'}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-blue-400 mt-2 font-mono">
                {toDevanagari(statVals.offlineAvail)}%
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200 mt-1">
                {isMr ? 'ऑफलाईन उपलब्धता' : 'Offline Availability'}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {isMr ? 'नेटवर्क नसताना शून्य डेटा हानी' : 'Zero Data Loss on 2G/No-Network'}
              </span>
            </div>

            {/* Stat 4: ABHA Longitudinal Records */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-orange-500/40 transition-colors">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                {isMr ? 'प्रायोगिक डेटा (PILOT)' : 'PILOT DATA'}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-purple-400 mt-2 font-mono">
                {toDevanagari(statVals.abhaCount)}+
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200 mt-1">
                {isMr ? 'आभा डिजिटल आरोग्य नोंदी' : 'ABHA Longitudinal EHRs'}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {isMr ? 'एकात्मिक ABDM रचना' : 'Unified ABDM Architecture'}
              </span>
            </div>

          </div>

          {/* Transparent Source Footnote Line */}
          <div className="text-center pt-2">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              <span className="text-orange-400 font-bold">* {isMr ? 'स्रोत व संदर्भ:' : 'Source & Reference:'}</span>{' '}
              {isMr
                ? 'वेल्हे तालुका प्राथमिक आरोग्य केंद्र, नसरापूर उपकेंद्र आणि औंध जिल्हा रुग्णालय पुणे प्रायोगिक डेटा (२०२५-२६).'
                : 'Velhe Taluka Primary Health Centre, Nasrapur Sub-Centre, and District Hospital Aundh Pune Field Validation Data (2025-26).'}
            </p>
          </div>

        </div>
      </section>

      {/* ── 4. "HOW IT WORKS" PROCESS STRIP: REGISTER → TRIAGE → REFER → SYNC ── */}
      <section className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-orange-400 bg-orange-950/80 px-3 py-1 rounded-full border border-orange-500/30">
              {isMr ? 'अखंड कार्यपद्धती' : 'Closed-Loop Workflow'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isMr ? 'स्वास्थ्यसेतू कसे कार्य करते?' : 'How SwasthyaSetu Works'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {isMr
                ? 'गावपातळीवरील उपकेंद्रापासून ते जिल्हा रुग्णालयापर्यंतच्या उपचारांची चार-टप्पीय बंद-लूप साखळी.'
                : 'A seamless four-step continuum of care connecting rural hamlets to tertiary ICUs.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            
            {/* Step 1: Register */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  १
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-900">
                  {isMr ? 'ऑफलाईन सक्षम' : 'Offline First'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-orange-400 transition-colors">
                  {isMr ? '१. नोंदणी (Register)' : '1. Register'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isMr
                    ? 'आशा कार्यकर्त्या दुर्गम भागात नेटवर्क नसतानाही ABHA आयडी व प्राथमिक तपासणी (BP, Hb, साखर) स्थानिक IndexedDB मध्ये नोंदवतात.'
                    : 'ASHA captures patient ABHA and vital screening indicators (BP, Hb, edema) securely into encrypted local IndexedDB.'}
                </p>
              </div>
              <div className="text-[10px] text-orange-400 font-bold flex items-center gap-1 pt-1">
                <span>{isMr ? 'शून्य नेटवर्क आवश्यक' : 'Zero Signal Needed'}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Step 2: Triage */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  २
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-900">
                  {isMr ? 'AI क्लिनिकल ट्रायज' : 'AI Risk Engine'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-orange-400 transition-colors">
                  {isMr ? '२. ट्रायज (Triage)' : '2. Triage'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isMr
                    ? 'प्रणालीतील AI जोखीम विश्लेषक तत्काळ प्री-एक्लॅम्पसिया किंवा तीव्र आजारांचा धोका ओळखून रंग-संकेत प्राधान्य (Red/Yellow/Green) ठरवतो.'
                    : 'Automated clinical risk stratification classifies patients into Red/Yellow/Green priority with predictive escalation warnings.'}
                </p>
              </div>
              <div className="text-[10px] text-orange-400 font-bold flex items-center gap-1 pt-1">
                <span>{isMr ? 'प्राधान्यक्रम वर्गीकरण' : 'Prioritized Triage'}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Step 3: Refer */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  ३
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900">
                  {isMr ? 'खाट व रुग्णवाहिका' : 'Beds & Transit'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-orange-400 transition-colors">
                  {isMr ? '३. रेफरल (Refer)' : '3. Refer'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isMr
                    ? 'PHC वैद्यकीय अधिकारी जिल्हा रुग्णालयातील उपलब्ध ICU खाटा तपासून थेट रेफरल टोकन व १०८ रुग्णवाहिका मार्ग आरक्षित करतात.'
                    : 'PHC Doctor inspects live district hospital bed matrix, generating digital referral tokens and dispatching 108 transit.'}
                </p>
              </div>
              <div className="text-[10px] text-orange-400 font-bold flex items-center gap-1 pt-1">
                <span>{isMr ? 'थेट खाट आरक्षण' : 'Live Bed Reservation'}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Step 4: Sync */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  ४
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-900">
                  {isMr ? 'अखंड चक्र पूर्ण' : 'Closed Loop'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                  {isMr ? '४. सिंक (Sync)' : '4. Sync'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isMr
                    ? 'नेटवर्क उपलब्ध होताच सर्व नोंदी राज्य सर्व्हरशी समक्रमित होतात, आणि रुग्णाच्या डिस्चार्जनंतर आशा सेविकेला फॉलो-अप सूचना जातात.'
                    : 'Background worker synchronizes state ledger. Counter-referral discharge care is pushed back to the village ASHA.'}
                </p>
              </div>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 pt-1">
                <span>{isMr ? 'शून्य डेटा हानी हमी' : 'Zero Data Overwrite'}</span>
                <Check className="w-3 h-3" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 5. 4 ROLE WORKSPACE CARDS: ASHA WORKER, PHC DOCTOR, DISTRICT OFFICER, CITIZEN ── */}
      <section className="bg-slate-950 px-4 sm:px-8 py-10 sm:py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-orange-400 bg-orange-950/80 px-3 py-1 rounded-full border border-orange-500/30">
              {isMr ? 'भूमिका-आधारित प्रवेश' : 'Role-Based Portals'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isMr ? 'तुमच्या आरोग्य भूमिकेतून प्रवेश करा' : 'Access Your Specialized Workspace'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {isMr
                ? 'प्रत्येक भूमिकेसाठी विशिष्ट साधने, ऑफलाईन नोंदणी, क्लिनिकल निर्णय सहाय्य व जिल्हा नियंत्रण फलक.'
                : 'Tailored workspaces for ground health workers, clinic doctors, district command, and patients.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: ASHA Worker */}
            <div
              onClick={() => handleRoleCardClick('asha')}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/60 rounded-3xl p-6 transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-4 hover:shadow-orange-500/10 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/40 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                    {isMr ? 'गाव पातळी · उपकेंद्र' : 'Grassroots · Sub-Centre'}
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors">
                    {isMr ? 'आशा कार्यकर्त्या' : 'ASHA Worker'}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isMr
                    ? 'ऑफलाईन ABHA नोंदणी, घरपोच माता व बाल आरोग्य तपासणी, आणि नेटवर्क नसताना स्थानिक साठवणूक.'
                    : 'Offline ABHA registration, household maternal screening, and robust IndexedDB local queues.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-black text-orange-400">
                <span>{isMr ? 'आशा पोर्टल उघडा' : 'Launch ASHA Portal'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: PHC Doctor */}
            <div
              onClick={() => handleRoleCardClick('phc_doctor')}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/60 rounded-3xl p-6 transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-4 hover:shadow-orange-500/10 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                    {isMr ? 'प्राथमिक केंद्र · क्लिनिक' : 'Primary Care · Clinic'}
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">
                    {isMr ? 'प्रा.आ.के. डॉक्टर' : 'PHC Doctor'}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isMr
                    ? 'AI जोखीम मूल्यांकन, सिंक केलेल्या नोंदींची तपासणी, ई-प्रिस्क्रिप्शन आणि जिल्हा रुग्णालयात रेफरल निर्मिती.'
                    : 'AI triage stratification, synchronized EHR review, e-prescriptions, and tertiary hospital referral.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-black text-blue-400">
                <span>{isMr ? 'वैद्यकीय कक्ष उघडा' : 'Launch PHC Workspace'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: District Officer */}
            <div
              onClick={() => handleRoleCardClick('district_officer')}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/60 rounded-3xl p-6 transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-4 hover:shadow-orange-500/10 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                    {isMr ? 'जिल्हा प्रशासन · कमांड' : 'District Command · DHO'}
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">
                    {isMr ? 'जिल्हा आरोग्य अधिकारी' : 'District Officer'}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isMr
                    ? 'थेट ICU/ऑक्सिजन खाटांची स्थिती, साथरोग अलर्ट, औषध साठा मॉनिटरिंग आणि रुग्णवाहिका समन्वय.'
                    : 'Live ICU/oxygen bed allocation matrix, epidemic outbreak radar, stock monitoring, and 108 dispatch.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-black text-purple-400">
                <span>{isMr ? 'कमांड सेंटर उघडा' : 'Open Command Centre'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Citizen */}
            <div
              onClick={() => handleRoleCardClick('patient')}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/60 rounded-3xl p-6 transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between space-y-4 hover:shadow-orange-500/10 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    {isMr ? 'नागरिक व रुग्ण · ABHA' : 'Citizen & Patient · ABHA'}
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                    {isMr ? 'नागरिक / रुग्ण' : 'Citizen / Patient'}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isMr
                    ? 'आपले ABHA डिजिटल कार्ड डाउनलोड करा, उपचारांचा इतिहास पहा आणि आपत्कालीन १०८ मदत मिळवा.'
                    : 'Download ABHA health card, view longitudinal visit records, prescriptions, and tap for emergency help.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-black text-emerald-400">
                <span>{isMr ? 'नागरिक नोंदणी' : 'Citizen Access'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. BOTTOM CALL TO ACTION BANNER ── */}
      <section className="bg-slate-900 px-4 sm:px-8 py-10">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-8 sm:p-10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-orange-500/30">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-orange-200">
                {isMr ? 'महाराष्ट्र सार्वजनिक आरोग्य परिसंस्था' : 'Maharashtra Public Health Ecosystem'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isMr ? 'आरोग्य सेवेचा प्रत्यक्ष अनुभव घ्या' : 'Experience the Healthcare Portal'}
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 font-medium leading-relaxed">
              {isMr
                ? 'आशा सेविका, प्राथमिक आरोग्य केंद्र, जिल्हा रुग्णालय आणि नागरिक आरोग्य नोंदींसाठी एकात्मिक लॉगिन.'
                : 'Unified single-sign on for ASHA workers, PHC clinicians, District Hospital specialists, and citizens.'}
            </p>
          </div>

          <button
            onClick={onNavigateToSignIn}
            className="px-6 py-4 rounded-2xl bg-white text-slate-900 hover:bg-orange-50 font-black text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-2.5 shrink-0 cursor-pointer scale-100 hover:scale-105 active:scale-95"
          >
            <span>{isMr ? 'लॉगिन पृष्ठावर जा' : 'Continue to Sign In'}</span>
            <ArrowRight className="w-5 h-5 text-orange-600" />
          </button>
        </div>
      </section>

      {/* ── 7. ALWAYS-VISIBLE RED EMERGENCY (108) FLOATING BUTTON ── */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => onOpenEmergency ? onOpenEmergency() : onNavigateToSignIn()}
          className="flex items-center gap-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-5 py-3.5 rounded-full shadow-2xl hover:shadow-rose-600/50 transition-all border-2 border-white/30 text-sm font-black cursor-pointer group animate-bounce"
          style={{ animationDuration: '3s' }}
          aria-label="Call 108 Emergency Helpline"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <PhoneCall className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase font-black tracking-wider text-rose-200 leading-none">
              {isMr ? 'तातडीची रुग्णवाहिका' : 'Emergency Ambulance'}
            </div>
            <div className="text-base font-black leading-tight">
              {isMr ? '१०८ मदत केंद्र' : '108 Helpline'}
            </div>
          </div>
          <span className="relative flex h-3 w-3 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </button>
      </div>

      {/* ── 8. COMPLIANCE EXPLAINER MODAL ── */}
      {complianceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  {complianceModal === 'ABDM'
                    ? (isMr ? 'आयुष्मान भारत डिजिटल मिशन (ABDM) सुसंगतता' : 'Ayushman Bharat Digital Mission (ABDM) Compliance')
                    : complianceModal === 'DISHA'
                    ? (isMr ? 'DISHA व माहिती तंत्रज्ञान कायदा २००० कलम ४३A डेटा गोपनीयता' : 'DISHA & IT Act 2000 Section 43A Data Privacy')
                    : (isMr ? 'स्थानिक IndexedDB ऑफलाईन साठवणूक व सिंक' : 'Offline-First Local Storage & Conflict-Free Sync')}
                </h3>
              </div>
              <button
                onClick={() => setComplianceModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              {complianceModal === 'ABDM' && (
                <>
                  <p>
                    <strong className="text-white">
                      {isMr ? 'टप्पा १ (आभा निर्मिती - M1):' : 'Milestone M1 (ABHA Creation):'}
                    </strong>{' '}
                    {isMr
                      ? 'नागरिकांसाठी सुलभ डिजिटल ओळख व आभा कार्ड निर्मिती सक्षम करते.'
                      : 'Enables seamless registration and token-based digital identity generation for citizens.'}
                  </p>
                  <p>
                    <strong className="text-white">
                      {isMr ? 'टप्पा २ (आरोग्य माहिती प्रदाता - M2):' : 'Milestone M2 (Health Information Provider - HIP):'}
                    </strong>{' '}
                    {isMr
                      ? 'FHIR-सुसंगत डिस्चार्ज सारांश, तपासणी अहवाल आणि वैद्यकीय नोंदी तयार करते.'
                      : 'Generates FHIR-compliant discharge summaries, encounter notes, and diagnostic investigations.'}
                  </p>
                  <p>
                    <strong className="text-white">
                      {isMr ? 'टप्पा ३ (आरोग्य माहिती वापरकर्ता - M3):' : 'Milestone M3 (Health Information User - HIU):'}
                    </strong>{' '}
                    {isMr
                      ? 'रुग्णाच्या संमतीने अधिकृत डॉक्टरांना मागील वैद्यकीय इतिहास पाहण्याची परवानगी देते.'
                      : 'Allows authorized clinicians to view permitted historical EHR with patient consent gateway.'}
                  </p>
                </>
              )}

              {complianceModal === 'DISHA' && (
                <>
                  <p>
                    <strong className="text-white">
                      {isMr ? 'राज्य डेटा सार्वभौमत्व:' : 'State Data Sovereignty:'}
                    </strong>{' '}
                    {isMr
                      ? 'सर्व क्लिनिकल नोंदी आणि एनक्रिप्टेड ऑडिट ट्रेल महाराष्ट्र राज्य डेटा केंद्रात सुरक्षित राहतात.'
                      : 'All clinical records and encrypted audit logs reside within the Maharashtra State Data Center infrastructure.'}
                  </p>
                  <p>
                    <strong className="text-white">
                      {isMr ? 'कनिष्ठ-अधिकार प्रवेश नियंत्रण:' : 'Least-Privilege Role Authorization:'}
                    </strong>{' '}
                    {isMr
                      ? 'आशा कार्यकर्त्या आणि इतर कर्मचाऱ्यांना केवळ त्यांच्या कर्तव्याशी संबंधित माहितीच उपलब्ध होते.'
                      : 'ASHA workers, pharmacists, and MOs access only the scoped data required for their clinical duty.'}
                  </p>
                  <p>
                    <strong className="text-white">
                      {isMr ? 'शून्य व्यावसायिक ट्रॅकिंग:' : 'Zero Commercial Tracking:'}
                    </strong>{' '}
                    {isMr
                      ? 'कोणतेही बाह्य व्यावसायिक ट्रॅकिंग किंवा जाहिरात स्क्रिप्ट नाही.'
                      : 'No external marketing telemetry, ad-trackers, or unauthorized third-party scripts.'}
                  </p>
                </>
              )}

              {complianceModal === 'OFFLINE' && (
                <>
                  <p>
                    <strong className="text-white">
                      {isMr ? 'क्रिप्टोग्राफिक ट्रान्झॅक्शन रांग:' : 'Cryptographic Transaction Queue:'}
                    </strong>{' '}
                    {isMr
                      ? 'प्रत्येक ऑफलाईन नोंदणी ब्राऊझरच्या IndexedDB मध्ये अचूक वेळेसह सुरक्षित ठेवली जाते.'
                      : 'Every offline patient screening and referral draft is persisted to browser IndexedDB with deterministic timestamps.'}
                  </p>
                  <p>
                    <strong className="text-white">
                      {isMr ? 'तक्रारमुक्त डेटा समक्रमण:' : 'Monotonic Conflict-Free Reconciliation:'}
                    </strong>{' '}
                    {isMr
                      ? 'इंटरनेट पूर्ववत होताच बॅकग्राउंड सर्व्हिस वर्कर सर्व नोंदी योग्य क्रमाने सर्व्हरवर पाठवते.'
                      : 'Background service worker detects signal restoration and transmits transactions in order without silent overwrites.'}
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setComplianceModal(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {isMr ? 'माहिती खिडकी बंद करा' : 'Close Explainer'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
