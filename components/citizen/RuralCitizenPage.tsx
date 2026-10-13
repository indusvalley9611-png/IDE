'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  UserPlus,
  MapPin,
  CalendarCheck,
  Mic,
  WifiOff,
  Siren,
  Bell,
  ArrowLeft,
  ChevronRight,
  Moon,
  Sun,
  Languages,
  ShieldCheck,
  Phone,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface RuralCitizenPageProps {
  onBack: () => void;
  onOpenEmergency: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const FEATURES = [
  {
    id: 'registration',
    icon: UserPlus,
    color: 'emerald',
    titleEn: 'Self-Registration',
    titleMr: 'स्व-नोंदणी',
    descEn: 'Register and create a personal health profile. Get your ABHA health ID linked to government records.',
    descMr: 'आपली वैयक्तिक आरोग्य प्रोफाइल तयार करा. तुमची आभा आरोग्य ओळख शासकीय नोंदींशी जोडा.',
    actionEn: 'Start Registration',
    actionMr: 'नोंदणी सुरू करा',
  },
  {
    id: 'phc',
    icon: MapPin,
    color: 'blue',
    titleEn: 'Find Nearby PHCs',
    titleMr: 'जवळचे आरोग्य केंद्र शोधा',
    descEn: 'Locate nearby Primary Health Centres, sub-centres and available services with real-time capacity info.',
    descMr: 'जवळचे प्राथमिक आरोग्य केंद्रे, उपकेंद्रे आणि उपलब्ध सेवा थेट माहितीसह शोधा.',
    actionEn: 'Find Centres',
    actionMr: 'केंद्र शोधा',
  },
  {
    id: 'appointments',
    icon: CalendarCheck,
    color: 'violet',
    titleEn: 'Appointments & Follow-ups',
    titleMr: 'भेट व पाठपुरावा',
    descEn: 'View your upcoming appointments and receive follow-up reminders for treatments and check-ups.',
    descMr: 'आपल्या येणाऱ्या भेटी पाहा आणि उपचार व तपासणींसाठी पाठपुरावा स्मरणपत्रे मिळवा.',
    actionEn: 'View Appointments',
    actionMr: 'भेट पाहा',
  },
  {
    id: 'language',
    icon: Mic,
    color: 'amber',
    titleEn: 'Local Language & Voice',
    titleMr: 'स्थानिक भाषा व आवाज',
    descEn: 'Use Marathi, Hindi and regional dialects. Voice assistance available for low-literacy users.',
    descMr: 'मराठी, हिंदी व स्थानिक बोलीभाषा वापरा. कमी साक्षरतेसाठी आवाज सहाय्य उपलब्ध.',
    actionEn: 'Switch Language',
    actionMr: 'भाषा बदला',
  },
  {
    id: 'offline',
    icon: WifiOff,
    color: 'slate',
    titleEn: 'Offline Access',
    titleMr: 'ऑफलाईन प्रवेश',
    descEn: 'Save permitted health information offline. Records automatically sync when internet returns.',
    descMr: 'परवानगी असलेली आरोग्य माहिती ऑफलाईन साठवा. इंटरनेट मिळताच नोंदी आपोआप समक्रमित होतात.',
    actionEn: 'Enable Offline',
    actionMr: 'ऑफलाईन सक्रिय करा',
  },
  {
    id: 'emergency',
    icon: Siren,
    color: 'rose',
    titleEn: 'Emergency Help',
    titleMr: 'आपत्कालीन मदत',
    descEn: 'Find appropriate emergency facilities, contact 108 ambulance, and get GPS-assisted guidance.',
    descMr: 'योग्य आपत्कालीन सुविधा शोधा, १०८ रुग्णवाहिका संपर्क करा आणि GPS मार्गदर्शन मिळवा.',
    actionEn: 'Get Emergency Help',
    actionMr: 'आपत्कालीन मदत मिळवा',
    isEmergency: true,
  },
  {
    id: 'notifications',
    icon: Bell,
    color: 'teal',
    titleEn: 'Health Notifications',
    titleMr: 'आरोग्य सूचना',
    descEn: 'Get reminders for medicines, doctor visits, vaccination schedules and health check-ups.',
    descMr: 'औषधे, डॉक्टरांची भेट, लसीकरण वेळापत्रक आणि आरोग्य तपासणींसाठी स्मरणपत्रे मिळवा.',
    actionEn: 'Enable Notifications',
    actionMr: 'सूचना सक्रिय करा',
  },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; badge: string; badgeText: string; btn: string; border: string; ring: string }> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    icon: 'bg-emerald-600',
    badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
    badgeText: '',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    border: 'border-emerald-200 dark:border-emerald-900 hover:border-emerald-500',
    ring: 'ring-emerald-500/20',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    icon: 'bg-blue-600',
    badge: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300',
    badgeText: '',
    btn: 'bg-blue-600 hover:bg-blue-700',
    border: 'border-blue-200 dark:border-blue-900 hover:border-blue-500',
    ring: 'ring-blue-500/20',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    icon: 'bg-violet-600',
    badge: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300',
    badgeText: '',
    btn: 'bg-violet-600 hover:bg-violet-700',
    border: 'border-violet-200 dark:border-violet-900 hover:border-violet-500',
    ring: 'ring-violet-500/20',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    icon: 'bg-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
    badgeText: '',
    btn: 'bg-amber-500 hover:bg-amber-600',
    border: 'border-amber-200 dark:border-amber-900 hover:border-amber-500',
    ring: 'ring-amber-500/20',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-900/40',
    icon: 'bg-slate-600',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    badgeText: '',
    btn: 'bg-slate-700 hover:bg-slate-800',
    border: 'border-slate-200 dark:border-slate-700 hover:border-slate-500',
    ring: 'ring-slate-500/20',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    icon: 'bg-rose-600',
    badge: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300',
    badgeText: '',
    btn: 'bg-rose-600 hover:bg-rose-700',
    border: 'border-rose-300 dark:border-rose-900 hover:border-rose-500',
    ring: 'ring-rose-500/20',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    icon: 'bg-teal-600',
    badge: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300',
    badgeText: '',
    btn: 'bg-teal-600 hover:bg-teal-700',
    border: 'border-teal-200 dark:border-teal-900 hover:border-teal-500',
    ring: 'ring-teal-500/20',
  },
};

export function RuralCitizenPage({
  onBack,
  onOpenEmergency,
  isDarkMode,
  onToggleDarkMode,
}: RuralCitizenPageProps) {
  const { language, toggleLanguage } = useLanguage();
  const isMr = language === 'mr';
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleFeatureAction = (feature: typeof FEATURES[0]) => {
    if (feature.isEmergency) {
      onOpenEmergency();
      return;
    }
    if (feature.id === 'language') {
      toggleLanguage();
      showToast(language === 'en' ? 'भाषा मराठी झाली' : 'Language switched to English');
      return;
    }
    setActiveFeature(activeFeature === feature.id ? null : feature.id);
    showToast(isMr ? `${feature.titleMr} — लवकरच उपलब्ध` : `${feature.titleEn} — Coming soon`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">

      {/* ── HEADER ── */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shrink-0 shadow-xs">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white tracking-wide leading-tight">
                {isMr ? 'ग्रामीण नागरिक पोर्टल' : 'Rural Citizen Portal'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isMr ? 'स्वास्थ्यसेतू · महाराष्ट्र सार्वजनिक आरोग्य' : 'SwasthyaSetu · Maharashtra Public Health'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{isMr ? 'EN' : 'मर'}</span>
          </button>
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-600 text-white px-4 sm:px-8 py-8 sm:py-10">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isMr ? 'ABDM अनुपालित · आभा आरोग्य ओळख' : 'ABDM Compliant · ABHA Health ID'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            {isMr
              ? 'ग्रामीण नागरिकांसाठी आरोग्य सेवा'
              : 'Healthcare for Rural Citizens'}
          </h1>
          <p className="text-sm text-green-100 leading-relaxed max-w-lg mx-auto">
            {isMr
              ? 'नोंदणी करा, जवळचे केंद्र शोधा, भेटी बुक करा आणि आपत्कालीन मदत मिळवा — सर्व एकाच ठिकाणी.'
              : 'Register, find nearby centres, book appointments, and access emergency help — all in one place.'}
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-4">

        <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {isMr ? 'उपलब्ध सेवा' : 'Available Services'}
        </h2>

        <div className="space-y-3">
          {FEATURES.map((feature, idx) => {
            const c = COLOR_MAP[feature.color];
            const Icon = feature.icon;
            const isExpanded = activeFeature === feature.id;

            return (
              <div
                key={feature.id}
                className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${c.border} ${isExpanded ? `ring-2 ${c.ring}` : ''} bg-white dark:bg-slate-900`}
              >
                {/* Card Header */}
                <button
                  onClick={() => handleFeatureAction(feature)}
                  className="w-full p-4 sm:p-5 text-left flex items-center gap-4 cursor-pointer group"
                >
                  {/* Number badge */}
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${c.icon} text-white flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {isMr ? feature.titleMr : feature.titleEn}
                      </h3>
                      {feature.isEmergency && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                          SOS
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                      {isMr ? feature.descMr : feature.descEn}
                    </p>
                  </div>

                  {/* Action arrow */}
                  <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                </button>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className={`px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 ${c.bg}`}>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      {isMr ? feature.descMr : feature.descEn}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(isMr ? 'लवकरच उपलब्ध होईल' : 'Coming soon')}
                        className={`px-4 py-2 rounded-xl ${c.btn} text-white text-xs font-black transition-all cursor-pointer shadow-xs`}
                      >
                        {isMr ? feature.actionMr : feature.actionEn}
                      </button>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {isMr ? 'लवकरच उपलब्ध' : 'Coming soon'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── EMERGENCY CALL-OUT BANNER ── */}
        <div className="mt-6 p-4 rounded-2xl border-2 border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-black text-rose-900 dark:text-rose-200">
                {isMr ? '१०८ तातडीची वैद्यकीय मदत' : '108 Emergency Medical SOS'}
              </h4>
              <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80">
                {isMr ? 'रुग्ण व कुटुंबियांसाठी तात्काळ आपत्कालीन मार्गदर्शन.' : 'Instant emergency assistance for patients & families.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenEmergency}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shrink-0 flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{isMr ? 'मदत मिळवा' : 'GET HELP'}</span>
          </button>
        </div>

        {/* ── FOOTER COMPLIANCE ── */}
        <div className="pt-4 text-center border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {isMr
                ? 'माहिती तंत्रज्ञान कायदा २००० व ABDM मानकांनुसार सुरक्षित. आपली माहिती सुरक्षित आहे.'
                : 'Secured under IT Act 2000 §43A & ABDM standards. Your data is safe.'}
            </span>
          </p>
        </div>

      </main>

      {/* ── TOAST ── */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xl">
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
