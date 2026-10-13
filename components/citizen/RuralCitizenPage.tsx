'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSync } from '@/context/SyncContext';
import { Language } from '@/lib/translations';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import {
  UserPlus,
  MapPin,
  CalendarCheck,
  Bell,
  ArrowLeft,
  ChevronRight,
  Moon,
  Sun,
  ShieldCheck,
  Check,
  Wifi,
  WifiOff,
  Database,
  FileText,
} from 'lucide-react';
import { CitizenAbhaRegistrationModal } from '@/components/citizen/CitizenAbhaRegistrationModal';
import { NearbyPhcMapModal } from '@/components/citizen/NearbyPhcMapModal';
import { PatientDownloadModal } from '@/components/auth/PatientDownloadModal';

interface RuralCitizenPageProps {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

interface LocalizedText {
  en: string;
  kn: string;
  hi: string;
  ta: string;
  te: string;
  mr?: string;
}

interface FeatureItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'indigo' | 'violet' | 'teal';
  title: LocalizedText;
  desc: LocalizedText;
  action: LocalizedText;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'registration',
    icon: UserPlus,
    color: 'emerald',
    title: {
      en: 'Self-Registration',
      kn: 'ಸ್ವಯಂ ನೋಂದಣಿ',
      hi: 'स्व-पंजीकरण',
      ta: 'சுய பதிவு',
      te: 'స్వయం నమోదు',
      mr: 'स्व-नोंदणी',
    },
    desc: {
      en: 'Register and create a personal health profile. Get your ABHA health ID linked to government records.',
      kn: 'ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ. ನಿಮ್ಮ ಆಭಾ ಐಡಿಯನ್ನು ಸರ್ಕಾರಿ ದಾಖಲೆಗಳಿಗೆ ಲಿಂಕ್ ಮಾಡಿ.',
      hi: 'अपनी व्यक्तिगत स्वास्थ्य प्रोफ़ाइल बनाएं। अपनी आभा स्वास्थ्य आईडी को सरकारी रिकॉर्ड से जोड़ें।',
      ta: 'தனிப்பட்ட சுகாதார சுயவிவரத்தை உருவாக்கவும். உங்கள் ஆபா ஐடியை அரசு பதிவுகளுடன் இணைக்கவும்.',
      te: 'వ్యక్తిగత ఆరోగ్య ప్రొఫైల్‌ను సృష్టించండి. మీ ఆభా ఐడీని ప్రభుత్వ రికార్డులతో అనుసంధానించండి.',
      mr: 'आपली वैयक्तिक आरोग्य प्रोफाइल तयार करा. तुमची आभा आरोग्य ओळख शासकीय नोंदींशी जोडा.',
    },
    action: {
      en: 'Start Registration',
      kn: 'ನೋಂದಣಿ ಪ್ರಾರಂಭಿಸಿ',
      hi: 'पंजीकरण शुरू करें',
      ta: 'பதிவைத் தொடங்கவும்',
      te: 'నమోదు ప్రారంభించండి',
      mr: 'नोंदणी सुरू करा',
    },
  },
  {
    id: 'phc',
    icon: MapPin,
    color: 'blue',
    title: {
      en: 'Find Nearby PHCs',
      kn: 'ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿಗಳನ್ನು ಹುಡುಕಿ',
      hi: 'निकटतम पीएचसी खोजें',
      ta: 'அருகிலுள்ள பிஎச்சிகளைத் தேடுங்கள்',
      te: 'సమీప పీహెచ్‌సీలను కనుగొనండి',
      mr: 'जवळचे आरोग्य केंद्र शोधा',
    },
    desc: {
      en: 'Locate nearby Primary Health Centres, sub-centres and available services with real-time capacity info.',
      kn: 'ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳು ಮತ್ತು ಲಭ್ಯವಿರುವ ಸೇವೆಗಳನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಹುಡುಕಿ.',
      hi: 'निकटवर्ती प्राथमिक स्वास्थ्य केंद्र, उप-केंद्र और उपलब्ध सेवाओं की वास्तविक स्थिति देखें।',
      ta: 'அருகிலுள்ள ஆரம்ப சுகாதார நிலையங்கள் மற்றும் கிடைக்கும் சேவைகளைக் கண்டறியவும்.',
      te: 'సమీప ప్రాథమిక ఆరోగ్య కేంద్రాలు మరియు అందుబాటులో ఉన్న సేవలను కనుగొనండి.',
      mr: 'जवळचे प्राथमिक आरोग्य केंद्रे, उपकेंद्रे आणि उपलब्ध सेवा थेट माहितीसह शोधा.',
    },
    action: {
      en: 'Find Centres',
      kn: 'ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ',
      hi: 'केंद्र खोजें',
      ta: 'மையங்களைத் தேடு',
      te: 'కేంద్రాలను కనుగొనండి',
    },
  },
  {
    id: 'ehr_download',
    icon: FileText,
    color: 'indigo',
    title: {
      en: 'Citizen Patient Health Portal (ABHA OTP)',
      kn: 'ನಾಗರಿಕ ರೋಗಿಯ ಆರೋಗ್ಯ ಪೋರ್ಟಲ್ (ಆಭಾ OTP)',
      hi: 'नागरिक मरीज स्वास्थ्य पोर्टल (आभा OTP)',
      ta: 'குடிமக்கள் நோயாளி சுகாதார தளம் (ஆபா OTP)',
      te: 'పౌరుల రోగి ఆరోగ్య పోర్టల్ (ఆభా OTP)',
      mr: 'नागरिक रुग्ण आरोग्य पोर्टल (आभा OTP)',
    },
    desc: {
      en: 'Download personal EHR records and referral tokens.',
      kn: 'ವೈಯಕ್ತಿಕ EHR ದಾಖಲೆಗಳು ಮತ್ತು ರೆಫರಲ್ ಟೋಕನ್‌ಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
      hi: 'व्यक्तिगत ईएचआर रिकॉर्ड और रेफरल टोकन डाउनलोड करें।',
      ta: 'தனிப்பட்ட EHR பதிவுகள் மற்றும் பரிந்துரை டோக்கன்களை பதிவிறக்கவும்.',
      te: 'వ్యక్తిగత EHR రికార్డులు మరియు రిఫరల్ టోకెన్‌లను డౌన్‌లోడ్ చేసుకోండి.',
      mr: 'वैयक्तिक आरोग्य नोंदी व संदर्भ टोकन डाउनलोड करा.',
    },
    action: {
      en: 'Download Records (ABHA OTP)',
      kn: 'ದಾಖಲೆಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (ABHA OTP)',
      hi: 'रिकॉर्ड डाउनलोड करें (ABHA OTP)',
      ta: 'பதிவுகளை பதிவிறக்கவும் (ABHA OTP)',
      te: 'రికార్డులను డౌన్‌లోడ్ చేయండి (ABHA OTP)',
      mr: 'नोंदी डाउनलोड करा (ABHA OTP)',
    },
  },
  {
    id: 'appointments',
    icon: CalendarCheck,
    color: 'violet',
    title: {
      en: 'Appointments & Follow-ups',
      kn: 'ನೇಮಕಾತಿಗಳು ಮತ್ತು ಫಾಲೋ-ಅಪ್',
      hi: 'अपॉइंटमेंट और फॉलो-अप',
      ta: 'சந்திப்புகள் மற்றும் பின்தொடர்தல்',
      te: 'అపాయింట్‌మెంట్‌లు & ఫాలో-అప్‌లు',
      mr: 'भेट व पाठपुरावा',
    },
    desc: {
      en: 'View your upcoming appointments and receive follow-up reminders for treatments and check-ups.',
      kn: 'ನಿಮ್ಮ ಮುಂಬರುವ ವೈದ್ಯಕೀಯ ಭೇಟಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಫಾಲೋ-ಅಪ್ ಜ್ಞಾಪನೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿ.',
      hi: 'अपनी आगामी डॉक्टर मुलाकातों को देखें और उपचार व जांच के लिए रिमाइंडर प्राप्त करें।',
      ta: 'உங்கள் வரவிருக்கும் மருத்துவ சந்திப்புகளைப் பார்க்கவும் மற்றும் நினைவூட்டல்களைப் பெறவும்.',
      te: 'మీ రాబోయే వైద్య నియామకాలను చూడండి మరియు తదుపరి రిమైండర్‌లను పొందండి.',
      mr: 'आपल्या येणाऱ्या भेटी पाहा आणि उपचार व तपासणींसाठी पाठपुरावा स्मरणपत्रे मिळवा.',
    },
    action: {
      en: 'View Appointments',
      kn: 'ಭೇಟಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      hi: 'अपॉइंटमेंट देखें',
      ta: 'சந்திப்புகளைப் பார்',
      te: 'అపాయింట్‌మెంట్‌లను చూడండి',
      mr: 'भेट पाहा',
    },
  },
  {
    id: 'notifications',
    icon: Bell,
    color: 'teal',
    title: {
      en: 'Health Notifications',
      kn: 'ಆರೋಗ್ಯ ಅಧಿಸೂಚನೆಗಳು',
      hi: 'स्वास्थ्य सूचनाएं',
      ta: 'சுகாதார அறிவிப்புகள்',
      te: 'ఆరోగ్య నోటిఫికేషన్‌లు',
      mr: 'आरोग्य सूचना',
    },
    desc: {
      en: 'Get reminders for medicines, doctor visits, vaccination schedules and health check-ups.',
      kn: 'ಔಷಧಗಳು, ವೈದ್ಯರ ಭೇಟಿಗಳು, ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿಗಳು ಮತ್ತು ತಪಾಸಣೆಗಳಿಗಾಗಿ ಜ್ಞಾಪನೆಗಳನ್ನು ಪಡೆಯಿರಿ.',
      hi: 'दवाओं, डॉक्टर की विजिट, टीकाकरण समय-सारणी और नियमित जांच के लिए अलर्ट प्राप्त करें।',
      ta: 'மருந்துகள், மருத்துவர் வருகைகள், தடுப்பூசி அட்டவணைகள் மற்றும் பரிசோதனைகளுக்கான நினைவூட்டல்களைப் பெறுங்கள்.',
      te: 'మందులు, వైద్యుల సందర్శనలు, టీకా షెడ్యూల్‌లు మరియు ఆరోగ్య పరీక్షల కోసం హెచ్చరికలను పొందండి.',
      mr: 'औषधे, डॉक्टरांची भेट, लसीकरण वेळापत्रक आणि आरोग्य तपासणींसाठी स्मरणपत्रे मिळवा.',
    },
    action: {
      en: 'Enable Notifications',
      kn: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ',
      hi: 'सूचनाएं चालू करें',
      ta: 'அறிவிப்புகளை இயக்கு',
      te: 'నోటిఫికేషన్‌లను ప్రారంభించండి',
      mr: 'सूचना सक्रिय करा',
    },
  },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; badge: string; btn: string; border: string; ring: string }> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    icon: 'bg-emerald-600',
    badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    border: 'border-emerald-200 dark:border-emerald-900 hover:border-emerald-500',
    ring: 'ring-emerald-500/20',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    icon: 'bg-blue-600',
    badge: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300',
    btn: 'bg-blue-600 hover:bg-blue-700',
    border: 'border-blue-200 dark:border-blue-900 hover:border-blue-500',
    ring: 'ring-blue-500/20',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    icon: 'bg-indigo-600',
    badge: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
    border: 'border-indigo-200 dark:border-indigo-900 hover:border-indigo-500',
    ring: 'ring-indigo-500/20',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    icon: 'bg-violet-600',
    badge: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300',
    btn: 'bg-violet-600 hover:bg-violet-700',
    border: 'border-violet-200 dark:border-violet-900 hover:border-violet-500',
    ring: 'ring-violet-500/20',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    icon: 'bg-teal-600',
    badge: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300',
    btn: 'bg-teal-600 hover:bg-teal-700',
    border: 'border-teal-200 dark:border-teal-900 hover:border-teal-500',
    ring: 'ring-teal-500/20',
  },
};

function getText(textObj: LocalizedText, lang: Language): string {
  return (textObj as any)[lang] || textObj.en;
}

export function RuralCitizenPage({
  onBack,
  isDarkMode,
  onToggleDarkMode,
}: RuralCitizenPageProps) {
  const { language } = useLanguage();
  const { effectiveOnline } = useSync();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);
  const [isPhcMapModalOpen, setIsPhcMapModalOpen] = useState(false);
  const [isEhrModalOpen, setIsEhrModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const portalTitle: LocalizedText = {
    en: 'Rural Citizen Portal',
    kn: 'ಗ್ರಾಮೀಣ ನಾಗರಿಕ ಪೋರ್ಟಲ್',
    hi: 'ग्रामीण नागरिक पोर्टल',
    ta: 'கிராமப்புற குடிமக்கள் தளம்',
    te: 'గ్రామీణ పౌరుల పోರ್టల్',
    mr: 'ग्रामीण नागरिक पोर्टल',
  };

  const portalSubtitle: LocalizedText = {
    en: 'SwasthyaSetu · Public Health Platform',
    kn: 'ಸ್ವಾಸ್ಥ್ಯಸೇತು · ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ವೇದಿಕೆ',
    hi: 'स्वास्थ्यसेतु · सार्वजनिक स्वास्थ्य मंच',
    ta: 'சுவஸ்த்யாசேது · பொது சுகாதார தளம்',
    te: 'స్వాస్థ్యసేతు · ప్రజా ఆరోగ్య వేదిక',
    mr: 'स्वास्थ्यसेतू · सार्वजनिक आरोग्य मंच',
  };

  const heroHeading: LocalizedText = {
    en: 'Healthcare for Rural Citizens',
    kn: 'ಗ್ರಾಮೀಣ ನಾಗರಿಕರಿಗೆ ಸುಲಭ ಆರೋಗ್ಯ ಸೇವೆ',
    hi: 'ग्रामीण नागरिकों के लिए सुलभ स्वास्थ्य सेवा',
    ta: 'கிராமப்புற குடிமக்களுக்கான சுகாதார சேவைகள்',
    te: 'గ్రామీణ పౌరుల కోసం ఆరోగ్య సేవలు',
    mr: 'ग्रामीण नागरिकांसाठी आरोग्य सेवा',
  };

  const heroSub: LocalizedText = {
    en: 'Register, locate nearby PHCs, manage appointments, and receive health notifications — fully functional offline.',
    kn: 'ನೋಂದಣಿ ಮಾಡಿ, ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿಗಳನ್ನು ಹುಡುಕಿ, ಭೇಟಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ — ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
    hi: 'पंजीकरण करें, निकटतम पीएचसी खोजें, अपॉइंटमेंट प्रबंधित करें — बिना इंटरनेट के भी पूरी तरह से ऑफलाइन कार्यरत।',
    ta: 'பதிவு செய்யவும், அருகிலுள்ள பிஎச்சிகளைக் கண்டறியவும், சந்திப்புகளை நிர்வகிக்கவும் — ஆஃப்லைனிலும் தடையின்றி இயங்கும்.',
    te: 'నమోదు చేసుకోండి, సమీప పీహెచ్‌సీలను కనుగొనండి, అపాయింట్‌మెంట్‌లను నిర్వహించండి — ఆఫ్‌లైన్‌లోనూ నిరంతరాయంగా పనిచేస్తుంది.',
    mr: 'नोंदणी करा, जवळचे PHC शोधा, भेटींचे नियोजन करा व आरोग्य सूचना मिळवा — ऑफलाईन असतानाही अखंड चालणारे व्यासपीठ.',
  };

  const offlineInfo: LocalizedText = {
    en: 'All records work offline and automatically sync when network returns',
    kn: 'ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ ಮತ್ತು ನೆಟ್‌ವರ್ಕ್ ಬಂದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಿಂಕ್ ಆಗುತ್ತವೆ',
    hi: 'सभी रिकॉर्ड ऑफलाइन काम करते हैं और नेटवर्क आने पर स्वचालित रूप से सिंक होते हैं',
    ta: 'அனைத்து பதிவுகளும் ஆஃப்லைனில் செயல்படும் மற்றும் நெட்வொர்க் திரும்பும்போது தானாகவே ஒத்திசைக்கப்படும்',
    te: 'అన్ని రికార్డులు ఆఫ్‌లైన్‌లో పనిచేస్తాయి మరియు నెట్‌వర్క్ వచ్చినప్పుడు ఆటోమేటిక్‌గా సింక్ అవుతాయి',
    mr: 'इंटरनेट नसतानाही सर्व डेटा स्थानिक IndexedDB मध्ये सुरक्षित साठवला जातो',
  };

  const availableServicesHeading: LocalizedText = {
    en: 'Available Services',
    kn: 'ಲಭ್ಯವಿರುವ ಸೇವೆಗಳು',
    hi: 'उपलब्ध सेवाएं',
    ta: 'கிடைக்கும் சேவைகள்',
    te: 'అందుబాటులో ఉన్న సేవలు',
    mr: 'उपलब्ध सेवा',
  };

  const comingSoonText: LocalizedText = {
    en: 'Coming soon',
    kn: 'ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗಲಿದೆ',
    hi: 'शीघ्र उपलब्ध होगा',
    ta: 'விரைவில் வருகிறது',
    te: 'త్వరలో అందుబాటులోకి రానుంది',
    mr: 'लवकरच उपलब्ध होईल',
  };

  const complianceFooterText: LocalizedText = {
    en: 'Secured under IT Act 2000 §43A & ABDM standards. Your data is safe.',
    kn: 'ಐಟಿ ಕಾಯ್ದೆ 2000 ಮತ್ತು ABDM ಮಾನದಂಡಗಳ ಅಡಿಯಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿದೆ. ನಿಮ್ಮ ಮಾಹಿತಿ ಸುರಕ್ಷಿತವಾಗಿದೆ.',
    hi: 'आईटी अधिनियम 2000 और ABDM मानकों के तहत सुरक्षित। आपकी जानकारी सुरक्षित है।',
    ta: 'ஐடி சட்டம் 2000 மற்றும் ABDM தரநிலைகளின் கீழ் பாதுகாக்கப்பட்டது. உங்கள் தகவல் பாதுகாப்பானது.',
    te: 'ఐటీ చట్టం 2000 మరియు ABDM ప్రమాణాల ప్రకారం సురక్షితం. మీ డేటా సురక్షితం.',
    mr: 'माहिती तंत्रज्ञान कायदा २००० व ABDM मानकांनुसार सुरक्षित. आपली माहिती सुरक्षित आहे.',
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
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white tracking-wide leading-tight">
                {getText(portalTitle, language)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {getText(portalSubtitle, language)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Native Offline Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${
              effectiveOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
            }`}
          >
            {effectiveOnline ? (
              <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {effectiveOnline ? 'Online Sync' : 'Offline Ready'}
            </span>
          </div>

          {/* 5-Language Dropdown Selector */}
          <LanguageSelector dropdownAlign="right" />

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white px-4 sm:px-8 py-8 sm:py-10">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ABDM Compliant · ABHA Health ID</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            {getText(heroHeading, language)}
          </h1>
          <p className="text-sm text-emerald-100 leading-relaxed max-w-lg mx-auto">
            {getText(heroSub, language)}
          </p>

          {/* Offline Capability Micro-Badge */}
          <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-emerald-200 font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>{getText(offlineInfo, language)}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-4">

        <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {getText(availableServicesHeading, language)}
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
                  onClick={() => {
                    if (feature.id === 'registration') {
                      setIsAbhaModalOpen(true);
                    } else if (feature.id === 'phc') {
                      setIsPhcMapModalOpen(true);
                    } else if (feature.id === 'ehr_download') {
                      setIsEhrModalOpen(true);
                    } else {
                      setActiveFeature(activeFeature === feature.id ? null : feature.id);
                    }
                  }}
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
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {getText(feature.title, language)}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                      {getText(feature.desc, language)}
                    </p>
                  </div>

                  {/* Action arrow */}
                  <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                </button>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className={`px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 ${c.bg}`}>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      {getText(feature.desc, language)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (feature.id === 'registration') {
                            setIsAbhaModalOpen(true);
                          } else if (feature.id === 'phc') {
                            setIsPhcMapModalOpen(true);
                          } else if (feature.id === 'ehr_download') {
                            setIsEhrModalOpen(true);
                          } else {
                            showToast(getText(comingSoonText, language));
                          }
                        }}
                        className={`px-4 py-2 rounded-xl ${c.btn} text-white text-xs font-black transition-all cursor-pointer shadow-xs`}
                      >
                        {getText(feature.action, language)}
                      </button>
                      {feature.id !== 'registration' && feature.id !== 'phc' && feature.id !== 'ehr_download' && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {getText(comingSoonText, language)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── FOOTER COMPLIANCE ── */}
        <div className="pt-6 text-center border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{getText(complianceFooterText, language)}</span>
          </p>
        </div>

      </main>

      {/* ── ABHA REGISTRATION MODAL ── */}
      {isAbhaModalOpen && (
        <CitizenAbhaRegistrationModal onClose={() => setIsAbhaModalOpen(false)} />
      )}

      {/* ── REAL-TIME PHC MAP MODAL ── */}
      {isPhcMapModalOpen && (
        <NearbyPhcMapModal onClose={() => setIsPhcMapModalOpen(false)} />
      )}

      {/* ── CITIZEN PATIENT HEALTH PORTAL (ABHA OTP) MODAL ── */}
      {isEhrModalOpen && (
        <PatientDownloadModal onClose={() => setIsEhrModalOpen(false)} />
      )}

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
