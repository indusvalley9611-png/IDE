'use client';

import React from 'react';
import { Role } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';
import {
  Users,
  Stethoscope,
  Building2,
  HeartPulse,
  Moon,
  Sun,
  Phone,
  ArrowLeft,
  AlertTriangle,
  User,
  ChevronRight,
  ShieldCheck,
  Leaf,
} from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface SignInPortalPageProps {
  onSelectRole: (role: Role | 'patient') => void;
  onSelectRuralCitizen?: () => void;
  onOpenEmergency: () => void;
  onNavigateToPitch?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function SignInPortalPage({
  onSelectRole,
  onSelectRuralCitizen,
  onOpenEmergency,
  onNavigateToPitch,
  isDarkMode,
  onToggleDarkMode,
}: SignInPortalPageProps) {
  const { language } = useLanguage();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  const t = {
    overview: getLoc({
      en: 'Overview',
      kn: 'ಅವಲೋಕನ',
      hi: 'अवलोकन',
      ta: 'கண்ணோட்டம்',
      te: 'అవలోకనం',
      mr: 'माहिती पृष्ठ',
    }),
    backToOverview: getLoc({
      en: 'Back to Overview',
      kn: 'ಅವಲೋಕನಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      hi: 'अवलोकन पर वापस जाएं',
      ta: 'கண்ணோட்டத்திற்கு திரும்பு',
      te: 'అవలోకనానికి తిరిగి వెళ్ళు',
      mr: 'माहिती पृष्ठावर परत जा',
    }),
    appTitle: getLoc({
      en: 'SwasthyaSetu',
      kn: 'ಸ್ವಾಸ್ಥ್ಯಸೇತು',
      hi: 'स्वास्थ्यसेतु',
      ta: 'சுவஸ்த்யாசேது',
      te: 'స్వాస్థ్యసేతు',
      mr: 'स्वास्थ्यसेतू',
    }),
    portalGateway: getLoc({
      en: 'Government Health Portal Gateway',
      kn: 'ಸರ್ಕಾರಿ ಆರೋಗ್ಯ ಪೋರ್ಟಲ್ ಪ್ರವೇಶ',
      hi: 'सरकारी स्वास्थ्य पोर्टल प्रवेशद्वार',
      ta: 'அரசு சுகாதார தளம் நுழைவாயில்',
      te: 'ప్రభుత్వ ఆరోగ్య పోర్టల్ గేట్‌వే',
      mr: 'शासकीय आरोग्य पोर्टल प्रवेश',
    }),
    selectWorkspace: getLoc({
      en: 'Select Healthcare Workspace',
      kn: 'ಆರೋಗ್ಯ ಕಾರ್ಯಕ್ಷೇತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      hi: 'स्वास्थ्य कार्यक्षेत्र चुनें',
      ta: 'சுகாதார பணிநிலையைத் தேர்ந்தெடுக்கவும்',
      te: 'ఆరోగ్య కార్యస్థలాన్ని ఎంచుకోండి',
      mr: 'आरोग्य कार्यक्षेत्र निवडा',
    }),
    selectWorkspaceSub: getLoc({
      en: 'Choose your authorized operational level to verify and sign in.',
      kn: 'ಪರಿಶೀಲಿಸಿ ಲಾಗ್ ಇನ್ ಮಾಡಲು ನಿಮ್ಮ ಅಧಿಕೃತ ಕಾರ್ಯಕ್ಷೇತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      hi: 'सत्यापन और साइन इन करने के लिए अपना अधिकृत कार्यक्षेत्र चुनें।',
      ta: 'சரிபார்த்து உள்நுழைய உங்கள் அங்கீகரிக்கப்பட்ட நிலையைத் தேர்வுசெய்யவும்.',
      te: 'ధృవీకరించి సైన్ ఇన్ చేయడానికి మీ అధీకృత స్థాయిని ఎంచుకోండి.',
      mr: 'आपल्या अधिकृत कार्यक्षेत्रावर क्लिक करून पडताळणी पूर्ण करा.',
    }),
    
    // ASHA
    ashaBadge: getLoc({
      en: 'SUB-CENTRE & FIELD',
      kn: 'ಉಪಕೇಂದ್ರ ಮತ್ತು ಕ್ಷೇತ್ರ',
      hi: 'उप-केंद्र और फील्ड',
      ta: 'துணை மையம் & களம்',
      te: 'ఉప కేంద్రం & క్షేత్రం',
      mr: 'उपकेंद्र व फील्ड',
    }),
    ashaTitle: getLoc({
      en: 'ASHA & Community Health',
      kn: 'ಆಶಾ ಮತ್ತು ಸಮುದಾಯ ಆರೋಗ್ಯ',
      hi: 'आशा और सामुदायिक स्वास्थ्य',
      ta: 'ஆஷா & சமூக சுகாதாரம்',
      te: 'ఆశా & సమాజ ఆరోగ్యం',
      mr: 'आशा सेविका व समुदाय आरोग्य',
    }),
    ashaDesc: getLoc({
      en: 'Village population health surveys, NCD screening, and offline referrals.',
      kn: 'ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಸಮೀಕ್ಷೆ, ಎನ್‌ಸಿಡಿ ತಪಾಸಣೆ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಶಿಫಾರಸುಗಳು.',
      hi: 'ग्रामीण स्वास्थ्य सर्वेक्षण, एनसीडी जांच और ऑफलाइन रेफरल।',
      ta: 'கிராமப்புற சுகாதார கணக்கெடுப்பு, தொற்றா நோய் பரிசோதனை மற்றும் ஆஃப்லைன் பரிந்துரைகள்.',
      te: 'గ్రామ ఆరోగ్య సర్వే, ఎన్‌సీడీ స్క్రీనింగ్ మరియు ఆఫ్‌లైన్ రిఫరల్స్.',
      mr: 'गाव आरोग्य सर्वेक्षण, NCD तपासणी व ऑफलाईन संदर्भ सेवा.',
    }),
    ashaAction: getLoc({
      en: 'Sign in to ASHA Portal',
      kn: 'ಆಶಾ ಪೋರ್ಟಲ್‌ಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
      hi: 'आशा पोर्टल में साइन इन करें',
      ta: 'ஆஷா தளத்தில் உள்நுழைக',
      te: 'ఆశా పోర్టల్‌లోకి సైన్ ఇన్ చేయండి',
      mr: 'आशा पोर्टलमध्ये प्रवेश करा',
    }),

    // PHC
    phcBadge: getLoc({
      en: 'PRIMARY HEALTH CENTRE',
      kn: 'ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ',
      hi: 'प्राथमिक स्वास्थ्य केंद्र',
      ta: 'ஆரம்ப சுகாதார நிலையம்',
      te: 'ప్రాథమిక ఆరోగ్య కేంద్రం',
      mr: 'प्राथमिक आरोग्य केंद्र',
    }),
    phcTitle: getLoc({
      en: 'Primary Health Centre (PHC Team)',
      kn: 'ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC ತಂಡ)',
      hi: 'प्राथमिक स्वास्थ्य केंद्र (PHC टीम)',
      ta: 'ஆரம்ப சுகாதார நிலையம் (PHC குழு)',
      te: 'ప్రాథమిక ఆరోగ్య కేంద్రం (PHC బృందం)',
      mr: 'प्राथमिक आरोग्य केंद्र (PHC Team)',
    }),
    phcDesc: getLoc({
      en: 'Medical Officers, Community Health Officers, Nurses, and Pharmacists.',
      kn: 'ವೈದ್ಯಾಧಿಕಾರಿಗಳು, ಸಮುದಾಯ ಆರೋಗ್ಯಾಧಿಕಾರಿಗಳು, ದಾದಿಯರು ಮತ್ತು ಔಷಧಿಕಾರರು.',
      hi: 'चिकित्सा अधिकारी, सामुदायिक स्वास्थ्य अधिकारी, नर्स और फार्मासिस्ट।',
      ta: 'மருத்துவ அலுவலர்கள், சமூக சுகாதார அலுவலர்கள், செவிலியர்கள் மற்றும் மருந்தாளுநர்கள்.',
      te: 'వైద్యాధికారులు, సమాజ వైద్యాధికారులు, నర్సులు మరియు ఫార్మసిస్టులు.',
      mr: 'वैद्यकीय अधिकारी, आरोग्य अधिकारी, परिचारिका व औषधनिर्माते.',
    }),
    phcAction: getLoc({
      en: 'Sign in to PHC Workspace',
      kn: 'PHC ಕಾರ್ಯಕ್ಷೇತ್ರಕ್ಕೆ ಲಾಗಿನ್ ಮಾಡಿ',
      hi: 'PHC कार्यक्षेत्र में साइन इन करें',
      ta: 'PHC தளத்தில் உள்நுழைக',
      te: 'PHC కార్యస్థలంలో సైన్ ఇన్ చేయండి',
      mr: 'PHC कार्यक्षेत्रात प्रवेश करा',
    }),

    // DHO
    dhoBadge: getLoc({
      en: 'DISTRICT CONTROL',
      kn: 'ಜಿಲ್ಲಾ ನಿಯಂತ್ರಣ',
      hi: 'जिला नियंत्रण',
      ta: 'மாவட்ட கட்டுப்பாடு',
      te: 'జిల్లా నియంత్రణ',
      mr: 'जिल्हा नियंत्रण कक्ष',
    }),
    dhoTitle: getLoc({
      en: 'District Health Officer (DHO Command)',
      kn: 'ಜಿಲ್ಲಾ ಆರೋಗ್ಯಾಧಿಕಾರಿ (DHO ಕಮಾಂಡ್)',
      hi: 'जिला स्वास्थ्य अधिकारी (DHO कमांड)',
      ta: 'மாவட்ட சுகாதார அலுவலர் (DHO கட்டளை)',
      te: 'జిల్లా వైద్యాధికారి (DHO కమాండ్)',
      mr: 'जिल्हा आरोग्य अधिकारी (DHO Command)',
    }),
    dhoDesc: getLoc({
      en: 'District health administration, drug supply redistribution, and GIS tracking.',
      kn: 'ಜಿಲ್ಲಾ ಆರೋಗ್ಯ ಆಡಳಿತ, ಔಷಧಿ ಪೂರೈಕೆ ಮರುಹಂಚಿಕೆ ಮತ್ತು ಜಿಐಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್.',
      hi: 'जिला स्वास्थ्य प्रशासन, औषधि आपूर्ति पुनर्वितरण और जीआईएस ट्रैकिंग।',
      ta: 'மாவட்ட சுகாதார நிர்வாகம், மருந்து விநியோகம் மற்றும் ஜிஐஎஸ் கண்காணிப்பு.',
      te: 'జిల్లా ఆరోగ్య పరిపాలన, ఔషధ సరఫరా పునఃపంపిణీ మరియు జీఐఎస్ ట్రాకింగ్.',
      mr: 'जिल्हा आरोग्य नियंत्रण, औषध साठा पुनर्वितरण व जीआयएस ट्रॅकिंग.',
    }),
    dhoAction: getLoc({
      en: 'Sign in to DHO Command',
      kn: 'DHO ಕಮಾಂಡ್‌ಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
      hi: 'DHO कमांड में साइन इन करें',
      ta: 'DHO கட்டளையில் உள்நுழைக',
      te: 'DHO కమాండ్‌లోకి సైన్ ఇన్ చేయండి',
      mr: 'DHO नियंत्रण कक्षात प्रवेश करा',
    }),

    // Rural Citizen
    citizenBadge: getLoc({
      en: 'RURAL CITIZEN',
      kn: 'ಗ್ರಾಮೀಣ ನಾಗರಿಕ',
      hi: 'ग्रामीण नागरिक',
      ta: 'கிராமப்புற குடிமக்கள்',
      te: 'గ్రామీణ పౌరుడు',
      mr: 'ग्रामीण नागरिक',
    }),
    citizenTitle: getLoc({
      en: 'Rural Citizen (Public Health Portal)',
      kn: 'ಗ್ರಾಮೀಣ ನಾಗರಿಕ (ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಪೋರ್ಟಲ್)',
      hi: 'ग्रामीण नागरिक (सार्वजनिक स्वास्थ्य पोर्टल)',
      ta: 'கிராமப்புற குடிமக்கள் (பொது சுகாதார தளம்)',
      te: 'గ్రామీణ పౌరుడు (ప్రజా ఆరోగ్య పోర్టల్)',
      mr: 'ग्रामीण नागरिक (सार्वजनिक आरोग्य पोर्टल)',
    }),
    citizenDesc: getLoc({
      en: 'Self-registration, find nearby PHCs, appointments & health alerts (offline ready).',
      kn: 'ಸ್ವಯಂ-ನೋಂದಣಿ, ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿ ಹುಡುಕಿ, ಭೇಟಿಗಳು ಮತ್ತು ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆಗಳು (ಆಫ್‌ಲೈನ್ ಸಿದ್ಧ).',
      hi: 'स्व-पंजीकरण, निकटतम पीएचसी खोजें, अपॉइंटमेंट और स्वास्थ्य अलर्ट (ऑफलाइन तैयार)।',
      ta: 'சுய பதிவு, அருகிலுள்ள பிஎச்சி கண்டறிதல், சந்திப்புகள் மற்றும் எச்சரிக்கைகள் (ஆஃப்லைன் தயார்).',
      te: 'స్వయం నమోదు, సమీప పీహెచ్‌సీ కనుగొనడం, అపాయింట్‌మెంట్‌లు & హెచ్చరికలు (ఆఫ్‌లైన్ సిద్ధం).',
      mr: 'स्व-नोंदणी, जवळचे PHC शोधणे, भेटींचे नियोजन व आरोग्य सूचना (ऑफलाईन सज्ज).',
    }),
    citizenAction: getLoc({
      en: 'Open Rural Citizen Portal',
      kn: 'ಗ್ರಾಮೀಣ ನಾಗರಿಕ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ',
      hi: 'ग्रामीण नागरिक पोर्टल खोलें',
      ta: 'கிராமப்புற குடிமக்கள் தளத்தைத் திறக்கவும்',
      te: 'గ్రామీణ పౌరుల పోర్టల్‌ను తెరవండి',
      mr: 'नागरिक पोर्टलमध्ये प्रवेश करा',
    }),

    // Patient EHR Download
    patientPortalTitle: getLoc({
      en: 'Citizen Patient Health Portal (ABHA OTP)',
      kn: 'ನಾಗರಿಕ ರೋಗಿಯ ಆರೋಗ್ಯ ಪೋರ್ಟಲ್ (ಆಭಾ OTP)',
      hi: 'नागरिक मरीज स्वास्थ्य पोर्टल (आभा OTP)',
      ta: 'குடிமக்கள் நோயாளி சுகாதார தளம் (ஆபா OTP)',
      te: 'పౌరుల రోగి ఆరోగ్య పోర్టల్ (ఆభా OTP)',
      mr: 'नागरिक रुग्ण आरोग्य पोर्टल (आभा OTP)',
    }),
    patientPortalDesc: getLoc({
      en: 'Download personal EHR records and referral tokens.',
      kn: 'ವೈಯಕ್ತಿಕ EHR ದಾಖಲೆಗಳು ಮತ್ತು ರೆಫರಲ್ ಟೋಕನ್‌ಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
      hi: 'व्यक्तिगत ईएचआर रिकॉर्ड और रेफरल टोकन डाउनलोड करें।',
      ta: 'தனிப்பட்ட EHR பதிவுகள் மற்றும் பரிந்துரை டோக்கன்களை பதிவிறக்கவும்.',
      te: 'వ్యక్తిగత EHR రికార్డులు మరియు రిఫరల్ టోకెన్‌లను డౌన్‌లోಡ್ చేసుకోండి.',
      mr: 'वैयक्तिक आरोग्य नोंदी व संदर्भ टोकन डाउनलोड करा.',
    }),

    // Emergency SOS
    emergencyTitle: getLoc({
      en: '108 Emergency Medical SOS',
      kn: '108 ತುರ್ತು ವೈದ್ಯಕೀಯ SOS',
      hi: '108 आपातकालीन चिकित्सा SOS',
      ta: '108 அவசர மருத்துவ SOS',
      te: '108 అత్యవసర వైద్య SOS',
      mr: '१०८ तातडीची वैद्यकीय मदत',
    }),
    emergencyDesc: getLoc({
      en: 'Instant emergency assistance for patients & families.',
      kn: 'ರೋಗಿಗಳು ಮತ್ತು ಕುಟುಂಬಗಳಿಗೆ ತ್ವರಿತ ತುರ್ತು ಸಹಾಯ.',
      hi: 'मरीजों और परिवारों के लिए तत्काल आपातकालीन सहायता।',
      ta: 'நோயாளிகள் மற்றும் குடும்பங்களுக்கு உடனடி அவசர உதவி.',
      te: 'రోగులు మరియు కుటుంబాలకు తక్షణ అత్యవసర సహాయం.',
      mr: 'रुग्ण व कुटुंबियांसाठी तात्काळ आपत्कालीन मार्गदर्शन.',
    }),
    getHelp: getLoc({
      en: 'GET HELP',
      kn: 'ಸಹಾಯ ಪಡೆಯಿರಿ',
      hi: 'मदद प्राप्त करें',
      ta: 'உதவி பெறுங்கள்',
      te: 'సహాయం పొందండి',
      mr: 'मदत मिळवा',
    }),

    // Compliance
    complianceFooter: getLoc({
      en: 'Authorized personnel only. Governed under IT Act 2000 §43A & ABDM standards.',
      kn: 'ಅಧಿಕೃತ ಸಿಬ್ಬಂದಿ ಮಾತ್ರ. ಐಟಿ ಕಾಯ್ದೆ 2000 ಮತ್ತು ABDM ಮಾನದಂಡಗಳ ಅಡಿಯಲ್ಲಿ ನಿಯಂತ್ರಿಸಲಾಗಿದೆ.',
      hi: 'केवल अधिकृत कर्मचारी। आईटी अधिनियम 2000 और ABDM मानकों के तहत शासित।',
      ta: 'அங்கீகரிக்கப்பட்ட பணியாளர்கள் மட்டுமே. ஐடி சட்டம் 2000 மற்றும் ABDM தரநிலைகளின் கீழ் நிர்வகிக்கப்படுகிறது.',
      te: 'అధీకృత సిబ్బంది మాత్రమే. ఐటీ చట్టం 2000 మరియు ABDM ప్రమాణాల ప్రకారం నియంత్రించబడుతుంది.',
      mr: 'केवळ अधिकृत आरोग्य कर्मचारी. माहिती तंत्रज्ञान कायदा २००० व ABDM मानकांनुसार नियंत्रित.',
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* ── 1. HEADER ── */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-40 shadow-xs">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          {onNavigateToPitch && (
            <button
              onClick={onNavigateToPitch}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title={t.backToOverview}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.overview}</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-xs">
              <HeartPulse className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {t.appTitle}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-none mt-1">
                {t.portalGateway}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Theme & 5-Language Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* 5-Language Dropdown */}
          <LanguageSelector dropdownAlign="right" />
        </div>
      </header>

      {/* ── 2. MAIN SIGN IN AREA ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center space-y-6">
        
        {/* Section Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t.selectWorkspace}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.selectWorkspaceSub}
          </p>
        </div>

        {/* ── 4 ROLE WORKSPACE CARDS GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: ASHA / Sub-Centre (Orange) */}
          <button
            onClick={() => onSelectRole('asha')}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-orange-200 dark:border-orange-950/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between gap-4 cursor-pointer group scale-100 hover:scale-[1.01]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">
                  {t.ashaBadge}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {t.ashaTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.ashaDesc}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
              <span>{t.ashaAction}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: PHC Team (Blue) */}
          <button
            onClick={() => onSelectRole('phc_doctor')}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-950/80 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between gap-4 cursor-pointer group scale-100 hover:scale-[1.01]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  {t.phcBadge}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {t.phcTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.phcDesc}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>{t.phcAction}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: DHO Command Center (Indigo) */}
          <button
            onClick={() => onSelectRole('district_officer')}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-950/80 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between gap-4 cursor-pointer group scale-100 hover:scale-[1.01]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                  {t.dhoBadge}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {t.dhoTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.dhoDesc}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>{t.dhoAction}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Rural Citizen (Emerald) */}
          <button
            onClick={onSelectRuralCitizen}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-950/80 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between gap-4 cursor-pointer group scale-100 hover:scale-[1.01]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <Leaf className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {t.citizenBadge}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {t.citizenTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.citizenDesc}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>{t.citizenAction}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>

        {/* ── CITIZEN & EMERGENCY BOTTOM ROW ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          {/* Citizen ABHA OTP Access */}
          <button
            onClick={() => onSelectRole('patient')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all text-left flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {t.patientPortalTitle}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.patientPortalDesc}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* 108 Emergency SOS Help */}
          <div className="p-4 rounded-2xl border-2 border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-rose-900 dark:text-rose-200 truncate">
                  {t.emergencyTitle}
                </h4>
                <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 truncate">
                  {t.emergencyDesc}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenEmergency}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shrink-0 flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t.getHelp}</span>
            </button>
          </div>

        </div>

        {/* ── FOOTER COMPLIANCE ── */}
        <div className="pt-4 text-center border-t border-slate-200 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t.complianceFooter}</span>
          </p>
        </div>

      </main>
    </div>
  );
}
