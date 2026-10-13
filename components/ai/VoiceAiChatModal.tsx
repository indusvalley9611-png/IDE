'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';
import {
  X,
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Sparkles,
  Phone,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Volume2,
  Calendar,
  HeartPulse,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';

interface VoiceAiChatModalProps {
  onClose: () => void;
  initialTopic?: string;
}

export type TriageSeverity = 'RED' | 'YELLOW' | 'GREEN';

interface TriageCard {
  severity: TriageSeverity;
  title: string;
  facility: string;
  timeframe: string;
  summary: string;
  precautions: string[];
  warningSigns: string[];
  helpline?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  triage?: TriageCard;
  quickReplies?: string[];
}

export function VoiceAiChatModal({ onClose, initialTopic }: VoiceAiChatModalProps) {
  const { language, setLanguage } = useLanguage();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  // Web Speech recognition mapping
  const speechLangMap: Record<Language, string> = {
    en: 'en-IN',
    kn: 'kn-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    mr: 'mr-IN',
  };

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Initial Welcome Message according to selected language
  const getWelcomeText = (lang: Language): string => {
    switch (lang) {
      case 'kn':
        return 'ನಮಸ್ಕಾರ! ನಾನು ಸ್ವಾಸ್ಥ್ಯಸೇತು AI ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಮೈಕ್ರೋಫೋನ್ ಮೂಲಕ ಧ್ವನಿಯಲ್ಲಿ (Voice) ಹೇಳಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ. ನಾನು ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿ (PHC), ತುರ್ತು ಆರೈಕೆ ಮತ್ತು ಚಿಕಿತ್ಸೆಯ ಬಗ್ಗೆ ತಕ್ಷಣ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ.';
      case 'hi':
        return 'नमस्ते! मैं स्वास्थ्यसेतु AI स्वास्थ्य सहायक हूँ। अपने लक्षण माइक दबाकर अपनी आवाज (Voice) में बताएं या लिखें। मैं आपको निकटतम पीएचसी (PHC), आपातकालीन देखभाल और सही उपचार की जानकारी दूंगा।';
      case 'ta':
        return 'வணக்கம்! நான் சுவஸ்த்யாசேது AI சுகாதார உதவியாளர். உங்கள் அறிகுறிகளை மைக் மூலம் குரலில் (Voice) சொல்லுங்கள் அல்லது தட்டச்சு செய்யுங்கள். ஆரம்ப சுகாதார நிலையம் (PHC) மற்றும் தேவையான மருத்துவ வழிகாட்டலை உடனே வழங்குகிறேன்.';
      case 'te':
        return 'నమస్కారం! నేను స్వాస్థ్యసేతు AI ఆరోగ్య సహాయకుడిని. మీ లక్షణాలను మైక్ ద్వారా మీ స్వరం (Voice) లో చెప్పండి లేదా టైప్ చేయండి. సమీప పీహెచ్‌సీ (PHC) మరియు తక్షణ వైద్య మార్గదర్శకత్వం అందిస్తాను.';
      case 'mr':
        return 'नमस्कार! मी स्वास्थ्यसेतू AI आरोग्य सहाय्यक आहे. आपली लक्षणे माइक दाबून आवाजात (Voice) सांगा किंवा टाईप करा. मी जवळचे प्राथमिक आरोग्य केंद्र (PHC) आणि उपचारांचे तात्काळ मार्गदर्शन करेन.';
      default:
        return 'Namaste! I am the SwasthyaSetu AI Health Assistant. Speak your health concerns using the microphone in your voice or type below. I provide instant clinical triage guidance, facility routing, and doctor visit recommendations.';
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: getWelcomeText(language),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        language === 'kn' ? 'ಜ್ವರ ಮತ್ತು ತಲೆನೋವು' : language === 'hi' ? 'बुखार और सिरदर्द' : language === 'ta' ? 'காய்ச்சல் மற்றும் தலைவலி' : language === 'te' ? 'జ్వరం మరియు తలనొప్పి' : 'Fever & Headache',
        language === 'kn' ? 'ಎದೆ ನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ' : language === 'hi' ? 'सीने में दर्द और सांस फूलना' : language === 'ta' ? 'மார்பு வலி' : language === 'te' ? 'ఛాతీ నొప్పి' : 'Chest pain & breathlessness',
        language === 'kn' ? 'ಗರ್ಭಾವಸ್ಥೆಯ ತಪಾಸಣೆ' : language === 'hi' ? 'गर्भावस्था देखभाल' : language === 'ta' ? 'கர்ப்ப பராமரிப்பு' : language === 'te' ? 'గర్భధారణ సంరక్షణ' : 'Pregnancy checkup',
        language === 'kn' ? 'ನಾಯಿ ಅಥವಾ ಹಾವು ಕಡಿತ' : language === 'hi' ? 'कुत्ते या सांप का काटना' : language === 'ta' ? 'நாய் / பாம்பு கடி' : language === 'te' ? 'పాము లేదా కుక్క కాటు' : 'Dog or Snake bite',
      ],
    },
  ]);

  // Update welcome message if user changes language inside modal
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-1') {
        return [
          {
            ...prev[0],
            text: getWelcomeText(language),
            quickReplies: [
              language === 'kn' ? 'ಜ್ವರ ಮತ್ತು ತಲೆನೋವು' : language === 'hi' ? 'बुखार और सिरदर्द' : language === 'ta' ? 'காய்ச்சல் மற்றும் தலைவலி' : language === 'te' ? 'జ్వరం ಮತ್ತು తలనొప్పి' : 'Fever & Headache',
              language === 'kn' ? 'ಎದೆ ನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ' : language === 'hi' ? 'सीने में दर्द और सांस फूलना' : language === 'ta' ? 'மார்பு வலி' : language === 'te' ? 'ఛాతీ నొప్పి' : 'Chest pain & breathlessness',
              language === 'kn' ? 'ಗರ್ಭಾವಸ್ಥೆಯ ತಪಾಸಣೆ' : language === 'hi' ? 'गर्भावस्था देखभाल' : language === 'ta' ? 'கர்ப்ப பராமரிப்பு' : language === 'te' ? 'గర్భధారణ సంరక్షణ' : 'Pregnancy checkup',
              language === 'kn' ? 'ನಾಯಿ ಅಥವಾ ಹಾವು ಕಡಿತ' : language === 'hi' ? 'कुत्ते या सांप का काटना' : language === 'ta' ? 'நாய் / பாம்பு கடி' : language === 'te' ? 'పాము లేదా కుక్క కాటు' : 'Dog or Snake bite',
            ],
          },
        ];
      }
      return prev;
    });
  }, [language]);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping, isListening]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = speechLangMap[language];

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechTranscript('');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setSpeechTranscript(currentTranscript);
          setInput(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [language]);

  // Toggle Voice Recording
  const handleToggleListening = () => {
    if (!speechSupported) {
      alert(
        getLoc({
          en: 'Speech recognition is not supported in this browser. Please type your message.',
          kn: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ.',
          hi: 'इस ब्राउज़र में वॉयस रिकग्निशन समर्थित नहीं है। कृपया टाइप करें।',
          ta: 'குரல் உள்ளீடு இந்த உலாவியில் ஆதரிக்கப்படவில்லை. தட்டச்சு செய்யவும்.',
          te: 'ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు మద్దతు లేదు. దయచేసి టైప్ చేయండి.',
          mr: 'या ब्राउझरमध्ये व्हॉइस ओळख समर्थित नाही. कृपया टाइप करा.',
        })
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsListening(false);
      if (input.trim()) {
        handleSendMessage(input.trim(), true);
      }
    } else {
      try {
        setInput('');
        setSpeechTranscript('');
        if (recognitionRef.current) {
          recognitionRef.current.lang = speechLangMap[language];
          recognitionRef.current.start();
        }
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  // Evaluate clinical triage in all 5 languages
  const evaluateClinicalResponse = (query: string, lang: Language): { text: string; triage?: TriageCard; quickReplies?: string[] } => {
    const q = query.toLowerCase();

    // 1. CHEST PAIN / CARDIAC EMERGENCY
    if (
      q.includes('chest') ||
      q.includes('heart') ||
      q.includes('breath') ||
      q.includes('ಎದೆ') ||
      q.includes('ಉಸಿರಾಟ') ||
      q.includes('हार्ट') ||
      q.includes('सीने') ||
      q.includes('सांस') ||
      q.includes('மார்பு') ||
      q.includes('மூச்சு') ||
      q.includes('ఛాతీ') ||
      q.includes('శ్వాస') ||
      q.includes('छाती')
    ) {
      const triageCards: Record<Language, TriageCard> = {
        kn: {
          severity: 'RED',
          title: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ: ಹೃದಯ / ಉಸಿರಾಟದ ತೀವ್ರ ತಪಾಸಣೆ ಅಗತ್ಯ',
          facility: 'ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆ / ಸಮುದಾಯ ಆರೋಗ್ಯ ಕೇಂದ್ರ (ICU ಸೌಲಭ್ಯ)',
          timeframe: 'ತಕ್ಷಣ (ಗೋಲ್ಡನ್ ಅವರ್: 0 ರಿಂದ 30 ನಿಮಿಷಗಳು)',
          summary: 'ಎದೆ ನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಹೃದಯ ಅಥವಾ ಶ್ವಾಸಕೋಶದ ಗಂಭೀರ ಸಮಸ್ಯೆಯನ್ನು ಸೂಚಿಸಬಹುದು. ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ನೆರವು ಪಡೆಯಿರಿ.',
          precautions: [
            '108 ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ತಕ್ಷಣ ಕರೆ ಮಾಡಿ. ನೀವೇ ವಾಹನ ಚಲಾಯಿಸಬೇಡಿ.',
            'ಆರಾಮವಾಗಿ ಬೆನ್ನಿಗೆ ಆಸರೆ ನೀಡಿ ಕುಳಿತುಕೊಳ್ಳಿ. ಗಾಳಿಯಾಡುವಂತೆ ಮಾಡಿ.',
            'ಹಿಂದೆ ವೈದ್ಯರು ಸೂಚಿಸಿದ್ದರೆ ಮಾತ್ರ ಆಸ್ಪಿರಿನ್ ಅಥವಾ ಸೋರ್ಬಿಟ್ರೇಟ್ ಸೇವಿಸಿ.',
          ],
          warningSigns: ['ಎಡ ತೋಳು ಅಥವಾ ದವಡೆಗೆ ಹರಡುವ ನೋವು', 'ಅತಿಯಾದ ಬೆವರು ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ', 'ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು'],
          helpline: '108 (ಉಚಿತ ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆ)',
        },
        hi: {
          severity: 'RED',
          title: 'आपातकालीन चेतावनी: हृदय / सांस की गंभीर जांच आवश्यक',
          facility: 'जिला अस्पताल / गहन चिकित्सा केंद्र (ICU युक्त अस्पताल)',
          timeframe: 'तत्काल (गोल्डन ऑवर: 0 से 30 मिनट)',
          summary: 'सीने में दर्द या भारीपन और सांस फूलना दिल के दौरे का संकेत हो सकता है। तुरंत अस्पताल पहुंचें।',
          precautions: [
            'तुरंत 108 एम्बुलेंस को कॉल करें। स्वयं गाड़ी न चलाएं।',
            'पीठ को सहारा देकर आराम से बैठें। भीड़ न लगाएं।',
            'यदि डॉक्टर ने पहले सलाह दी हो तो ही एस्पिरिन लें।',
          ],
          warningSigns: ['बाएं हाथ या जबड़े में फैलता दर्द', 'अत्यधिक पसीना आना और चक्कर', 'बेहोशी'],
          helpline: '108 (राष्ट्रीय आपातकालीन एम्बुलेंस)',
        },
        ta: {
          severity: 'RED',
          title: 'அவசர எச்சரிக்கை: மார்பு / இதய தீவிர பரிசோதனை தேவை',
          facility: 'மாவட்ட மருத்துவமனை / தீவிர சிகிச்சை பிரிவு (ICU)',
          timeframe: 'உடனடியாக (0 முதல் 30 நிமிடங்கள்)',
          summary: 'மார்பு வலி மற்றும் மூச்சுத் திணறல் தீவிர இதய பாதிப்பைக் குறிக்கலாம். தாமதிக்காமல் உடனடியாக சிகிச்சை பெறவும்.',
          precautions: ['உடனே 108 ஆம்புலன்ஸை அழைக்கவும்.', 'அமைதியாக அமர்ந்து ஓய்வெடுக்கவும்.', 'தானாக வாகனம் ஓட்ட வேண்டாம்.'],
          warningSigns: ['இடது கை அல்லது தாடைக்கு பரவும் வலி', 'அதிக வியர்வை மற்றும் மயக்கம்'],
          helpline: '108 (இலவச அவசர ஆம்புலன்ஸ்)',
        },
        te: {
          severity: 'RED',
          title: 'అత్యవసర హెచ్చరిక: గుండె / శ్వాసకోశ తీవ్ర పరిశీలన అవసరం',
          facility: 'జిల్లా ఆసుపత్రి / ఐసీయూ (ICU) విభాగం',
          timeframe: 'వెంటనే (గోల్డెన్ అవర్: 0 నుండి 30 నిమిషాలు)',
          summary: 'ఛాతీ నొప్పి మరియు శ్వాస తీసుకోవడంలో ఇబ్బంది గుండె సమస్యను సూచించవచ్చు. తక్షణమే ఆసుపత్రికి వెళ్లండి.',
          precautions: ['వెంటనే 108 అంబులెన్స్‌కు కాల్ చేయండి.', 'నిటారుగా లేదా సౌకర్యవంతంగా కూర్చోండి.', 'స్వయంగా డ్రైవింగ్ చేయవద్దు.'],
          warningSigns: ['ఎడమ చేయి లేదా దవడకు వ్యాపించే నొప్పి', 'విపరీతమైన చెమట మరియు మైకం'],
          helpline: '108 (ఉచిత అత్యవసర అంబులెన్స్)',
        },
        mr: {
          severity: 'RED',
          title: 'तातडीचा इशारा: संभाव्य हृदयविकार / अतितातडीची तपासणी',
          facility: 'जिल्हा रुग्णालय / आयसीयू सुविधा केंद्र',
          timeframe: 'तातडीने (० ते ३० मिनिटे)',
          summary: 'छातीत दुखणे व धाप लागणे हृदयविकाराचे लक्षण असू शकते. तात्काळ मदत घ्या.',
          precautions: ['१०८ रुग्णवाहिकेला त्वरित फोन करा.', 'शांतपणे टेकून बसा.', 'स्वतः वाहन चालवू नका.'],
          warningSigns: ['डाव्या हाताकडे पसरणाऱ्या वेदना', 'थंड घाम व चक्कर'],
          helpline: '१०८ (तातडीची रुग्णवाहिका)',
        },
        en: {
          severity: 'RED',
          title: 'CRITICAL EMERGENCY: Suspected Cardiac / Respiratory Event',
          facility: 'District Hospital / Tertiary Hospital with ICU & Cath Lab',
          timeframe: 'Immediate (Golden Hour: 0 to 30 mins)',
          summary: 'Chest tightness, radiating discomfort, and breathlessness strongly indicate an acute cardiac emergency requiring immediate stabilization.',
          precautions: [
            'Call 108 Emergency Ambulance immediately. Do not attempt to drive yourself.',
            'Sit in a supported upright posture with relaxed breathing.',
            'Take Disprin/Aspirin 300mg only if previously prescribed by a physician.',
          ],
          warningSigns: ['Pain radiating to left arm, back, or jaw', 'Profuse cold sweating & dizziness', 'Loss of consciousness'],
          helpline: '108 (National Emergency Ambulance)',
        },
      };

      return {
        text: getLoc({
          kn: 'ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಇದು ಗಂಭೀರ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯ ಲಕ್ಷಣವಾಗಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಕೆಳಗಿನ ಕಾರ್ಡ್ ಗಮನಿಸಿ 108 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ.',
          hi: 'आपके लक्षणों की जांच पूरी हुई। यह एक गंभीर आपातकालीन स्थिति हो सकती है। कृपया नीचे दिए गए निर्देश देखें और तुरंत 108 पर संपर्क करें।',
          ta: 'உங்கள் அறிகுறிகள் தீவிர அவசர நிலையைக் காட்டுகின்றன. தாமதிக்காமல் கீழே உள்ள அட்டைப்படி 108 ஆம்புலன்ஸை அழைக்கவும்.',
          te: 'మీ లక్షణాల విశ్లేషణ పూర్తయింది. ఇది అత్యవసర పరిస్థితిని సూచిస్తుంది. వెంటనే 108 అంబులెన్స్‌కు కాల్ చేయండి.',
          mr: 'आपल्या लक्षणांचे तातडीचे विश्लेषण पूर्ण झाले आहे. कृपया तात्काळ खालील सूचना पाळून १०८ वर संपर्क करा.',
          en: 'Clinical triage completed. Your symptoms indicate an urgent medical situation. Please review the high-priority triage card below and dispatch emergency support.',
        }),
        triage: triageCards[lang] || triageCards.en,
      };
    }

    // 2. FEVER / DENGUE / MALARIA
    if (
      q.includes('fever') ||
      q.includes('chills') ||
      q.includes('headache') ||
      q.includes('body pain') ||
      q.includes('ಜ್ವರ') ||
      q.includes('ತಲೆನೋವು') ||
      q.includes('ಬುಖಾರ') ||
      q.includes('सिरदर्द') ||
      q.includes('காய்ச்சல்') ||
      q.includes('தலைவலி') ||
      q.includes('జ్వరం') ||
      q.includes('తలనొప్పి') ||
      q.includes('ताप')
    ) {
      const triageCards: Record<Language, TriageCard> = {
        kn: {
          severity: 'YELLOW',
          title: 'ಜ್ವರ ಮತ್ತು ಸೋಂಕು ತಪಾಸಣೆ (ಡೆಂಗ್ಯೂ / ಮಲೇರಿಯಾ / ವೈರಲ್)',
          facility: 'ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC) ಅಥವಾ ಸಮುದಾಯ ಕೇಂದ್ರ',
          timeframe: '24 ಗಂಟೆಗಳ ಒಳಗೆ ಭೇಟಿ ನೀಡಿ (ಅಗತ್ಯವಿದ್ದರೆ ತಕ್ಷಣ)',
          summary: 'ಜ್ವರ ಮತ್ತು ಮೈಕೈ ನೋವು ವೈರಲ್ ಜ್ವರ ಅಥವಾ ಸೊಳ್ಳೆ ಕಡಿತದ ಸೋಂಕು ಆಗಿರಬಹುದು. ರಕ್ತ ಪರೀಕ್ಷೆ (CBC/MP) ಮಾಡಿಸಿಕೊಳ್ಳುವುದು ಸೂಕ್ತ.',
          precautions: [
            'ಸಾಕಷ್ಟು ನೀರು, ಗಂಜಿ, ಎಳನೀರು ಅಥವಾ ORS ದ್ರವಗಳನ್ನು ಕುಡಿಯಿರಿ.',
            'ಜ್ವರ ನಿಯಂತ್ರಣಕ್ಕೆ ಪ್ಯಾರಸಿಟಮಾಲ್ (500mg) ಮಾತ್ರ ವೈದ್ಯರ ಸಲಹೆಯಂತೆ ಸೇವಿಸಿ.',
            'ಆಸ್ಪಿರಿನ್ ಅಥವಾ ಬ್ರೂಫೆನ್ ಮಾತ್ರ ಔಷಧಿಗಳನ್ನು ಸ್ವಂತವಾಗಿ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.',
          ],
          warningSigns: ['ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು', 'ರಕ್ತಸ್ರಾವದ ಚುಕ್ಕೆಗಳು', 'ನಿರಂತರ ವಾಂತಿ ಮತ್ತು ವಿಪರೀತ ಸುಸ್ತು'],
        },
        hi: {
          severity: 'YELLOW',
          title: 'बुखार एवं संक्रमण जांच (डेंगू / मलेरिया / वायरल)',
          facility: 'निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC)',
          timeframe: '24 घंटे के भीतर डॉक्टर को दिखाएं',
          summary: 'बुखार और शरीर दर्द वायरल या मच्छर जनित संक्रमण हो सकता है। रक्त जांच (सीबीसी/मलेरिया) आवश्यक है।',
          precautions: [
            'खूब पानी, ओआरएस और तरल पदार्थ पिएं। आराम करें।',
            'केवल पैरासिटामोल लें, बिना डॉक्टर पूछे अन्य दवाएं न लें।',
            'मच्छरदानी का प्रयोग करें।',
          ],
          warningSigns: ['मसूड़ों से खून आना', 'लगातार उल्टी होना', 'अत्यधिक कमजोरी'],
        },
        ta: {
          severity: 'YELLOW',
          title: 'காய்ச்சல் மற்றும் தொற்று பரிசோதனை (டெங்கு / மலேரியா)',
          facility: 'அருகிலுள்ள ஆரம்ப சுகாதார நிலையம் (PHC)',
          timeframe: '24 மணி நேரத்திற்குள் மருத்துவரை அணுகவும்',
          summary: 'காய்ச்சல் மற்றும் உடல் வலிக்கு ஆரம்ப சுகாதார நிலையத்தில் ரத்த பரிசோதனை செய்து கொள்வது நல்லது.',
          precautions: ['நிறைய நீர், இளநீர் மற்றும் ஓஆர்எஸ் குடிக்கவும்.', 'மருத்துவர் ஆலோசனைப்படி பாராசிட்டமால் உட்கொள்ளவும்.'],
          warningSigns: ['தீவிர வயிற்று வலி', 'தொடர் வாந்தி', 'ரத்தப்போக்கு புள்ளிகள்'],
        },
        te: {
          severity: 'YELLOW',
          title: 'జ్వరం మరియు ఇన్ఫెక్షన్ తనిఖీ (డెంగ్యూ / మలేరియా)',
          facility: 'సమీప ప్రాథమిక ఆరోగ్య కేంద్రం (PHC)',
          timeframe: '24 గంటల్లోగా డాక్టర్‌ను సంప్రదించండి',
          summary: 'జ్వరం మరియు ఒంటి నొప్పులకు రక్త పరీక్ష చేయించుకోవడం అవసరం. పీహెಚ್‌సీలో ఉచిత పరీక్షలు అందుబాటులో ఉన్నాయి.',
          precautions: ['మంచి నీరు, కొబ్బరి నీళ్లు మరియు ఓఆర్‌ఎస్ అధికంగా తాగండి.', 'డాక్టర్ సలహాతో పారాసిటమాల్ మాత్రమే వాడండి.'],
          warningSigns: ['తీవ్రమైన కడుపు నొప్పి', 'నిరంతర వాంతులు', 'తీవ్ర నీరసం'],
        },
        mr: {
          severity: 'YELLOW',
          title: 'ताप व संसर्ग तपासणी (डेंग्यू / हिवताप)',
          facility: 'जवळचे प्राथमिक आरोग्य केंद्र (PHC)',
          timeframe: '२४ तासांत भेट द्या',
          summary: 'तापासाठी प्राथमिक आरोग्य केंद्रात रक्त तपासणी करून योग्य औषधोपचार घ्यावेत.',
          precautions: ['ORS व भरपूर पाणी प्या.', 'फक्त पॅरासिटामॉल गोळी घ्या.'],
          warningSigns: ['अतिशय पोटदुखी', 'उलट्या व रक्तस्त्राव'],
        },
        en: {
          severity: 'YELLOW',
          title: 'Acute Febrile Illness (Suspected Viral / Dengue / Malaria)',
          facility: 'Nearby Primary Health Centre (PHC) for Blood Lab Tests',
          timeframe: 'Within 24 Hours (Next Morning OPD)',
          summary: 'High fever accompanied by generalized aches suggests an infectious etiology requiring complete blood count (CBC) and rapid diagnostic test for vector-borne disease.',
          precautions: [
            'Maintain strict oral hydration with ORS, coconut water, and clean fluids.',
            'Take Paracetamol 500mg every 6-8 hours for fever; strictly avoid NSAIDs like Brufen or Aspirin.',
            'Rest adequately under mosquito netting.',
          ],
          warningSigns: ['Spontaneous bleeding from gums or nose', 'Persistent severe vomiting', 'Extreme lethargy or drowsiness'],
        },
      };

      return {
        text: getLoc({
          kn: 'ನಿಮ್ಮ ಜ್ವರದ ಲಕ್ಷಣಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿಗೆ ಭೇಟಿ ನೀಡಿ ರಕ್ತ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿಕೊಳ್ಳುವುದು ಉತ್ತಮ. ಮಾರ್ಗದರ್ಶನ ಕೆಳಗಿದೆ:',
          hi: 'आपके बुखार के लक्षणों का विश्लेषण किया गया है। निकटतम पीएचसी पर जाकर रक्त जांच कराएं। विवरण नीचे देखें:',
          ta: 'உங்கள் காய்ச்சல் அறிகுறிகள் பரிசீலிக்கப்பட்டன. ஆரம்ப சுகாதார நிலையத்தில் பரிசோதனை பெற பரிந்துரைக்கப்படுகிறது:',
          te: 'మీ జ్వరం లక్షణాలు పరిశీలించబడ్డాయి. సమీప పీహెచ్‌సీలో రక్త పరీక్ష చేయించుకోండి. వివరాలు క్రింద ఉన్నాయి:',
          mr: 'आपल्या तापाचे विश्लेषण झाले आहे. जवळच्या प्राथमिक आरोग्य केंद्रात भेट द्या. तपशील खालीलप्रमाणे:',
          en: 'Fever evaluation complete. You are advised to visit the nearest Primary Health Centre for diagnostic blood work.',
        }),
        triage: triageCards[lang] || triageCards.en,
        quickReplies: [
          lang === 'kn' ? 'ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿ ಎಲ್ಲಿದೆ?' : lang === 'hi' ? 'निकटतम पीएचसी कहां है?' : 'Find Nearest PHC on Map',
          lang === 'kn' ? 'ಮಕ್ಕಳ ಜ್ವರದ ಡೋಸ್ ಎಷ್ಟು?' : lang === 'hi' ? 'ओआरएस कैसे बनाएं?' : 'How to take ORS fluids',
        ],
      };
    }

    // 3. DOG BITE OR SNAKE BITE (EMERGENCY RED)
    if (
      q.includes('dog') ||
      q.includes('bite') ||
      q.includes('snake') ||
      q.includes('rabies') ||
      q.includes('ನಾಯಿ') ||
      q.includes('ಹಾವು') ||
      q.includes('ಕಡಿತ') ||
      q.includes('कुत्ता') ||
      q.includes('सांप') ||
      q.includes('काटना') ||
      q.includes('நாய்') ||
      q.includes('பாம்பு') ||
      q.includes('పాము') ||
      q.includes('కుక్క') ||
      q.includes('चावा')
    ) {
      const triageCards: Record<Language, TriageCard> = {
        kn: {
          severity: 'RED',
          title: 'ತುರ್ತು ಚುಚ್ಚುಮದ್ದು: ಪ್ರಾಣಿ / ಹಾವು ಕಡಿತ (ARV / ASV ಚಿಕಿತ್ಸೆ)',
          facility: 'ತಾಲ್ಲೂಕು ಆಸ್ಪತ್ರೆ / ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆ / ಆಂಟಿ-ರೇಬೀಸ್ ಲಭ್ಯವಿರುವ PHC',
          timeframe: 'ತಕ್ಷಣ (0 ರಿಂದ 6 ಗಂಟೆಗಳ ಒಳಗೆ)',
          summary: 'ಪ್ರಾಣಿ ಅಥವಾ ಹಾವು ಕಡಿತಕ್ಕೆ ತುರ್ತು ಆಂಟಿ-ರೇಬೀಸ್ (ARV) ಅಥವಾ ಆಂಟಿ-ಸ್ನೇಕ್ ವೆನಮ್ (ASV) ಚುಚ್ಚುಮದ್ದು ಅಗತ್ಯವಿದೆ.',
          precautions: [
            'ನಾಯಿ ಕಡಿತಕ್ಕೆ: ಗಾಯವನ್ನು ಹರಿಯುವ ನೀರಿನಲ್ಲಿ ಸಾಬೂನಿನಿಂದ 15 ನಿಮಿಷಗಳ ಕಾಲ ಚೆನ್ನಾಗಿ ತೊಳೆಯಿರಿ.',
            'ಹಾವು ಕಡಿತಕ್ಕೆ: ವ್ಯಕ್ತಿಯನ್ನು ಚಲಿಸದಂತೆ ಶಾಂತವಾಗಿ ಮಲಗಿಸಿ. ಗಾಯವನ್ನು ಕತ್ತರಿಸಬೇಡಿ ಅಥವಾ ಕಟ್ಟಬೇಡಿ.',
            'ತಕ್ಷಣ ಹತ್ತಿರದ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗೆ ಕರೆದುಕೊಂಡು ಹೋಗಿ.',
          ],
          warningSigns: ['ಕಡಿತದ ಜಾಗದಲ್ಲಿ ತೀವ್ರ ಊತ', 'ಉಸಿರಾಟದ ತೊಂದರೆ ಮತ್ತು ದೃಷ್ಟಿ ಮಂದವಾಗುವುದು'],
          helpline: '108 ತುರ್ತು ವಾಹನ',
        },
        hi: {
          severity: 'RED',
          title: 'आपातकालीन: पशु / सांप का काटना (एंटी-रेबीज एवं एंटी-वेनम)',
          facility: 'सामुदायिक स्वास्थ्य केंद्र / जिला अस्पताल (एंटी-वेनम सुविधा)',
          timeframe: 'तत्काल (0 से 6 घंटे के भीतर)',
          summary: 'कुत्ते या सांप के काटने पर तुरंत एंटी-रेबीज (ARV) या एंटी-स्नेक वेनम (ASV) टीका आवश्यक है।',
          precautions: [
            'कुत्ते के काटने पर: बहते पानी और साबुन से घाव को 15 मिनट तक अच्छी तरह धोएं।',
            'सांप के काटने पर: मरीज को शांत रखें, घाव को चीरा न लगाएं और कसकर न बांधें।',
            'तुरंत नजदीकी सरकारी अस्पताल पहुंचें।',
          ],
          warningSigns: ['घाव पर सूजन', 'सांस लेने में तकलीफ', 'बेहोशी'],
          helpline: '108 आपातकालीन सेवा',
        },
        ta: {
          severity: 'RED',
          title: 'அவசரம்: விலங்கு / பாம்பு கடி (தடுப்பூசி சிகிச்சை)',
          facility: 'அரசு தாலுகா / மாவட்ட மருத்துவமனை',
          timeframe: 'உடனடியாக (0 முதல் 6 மணி நேரம்)',
          summary: 'நாய் அல்லது பாம்பு கடிக்கு உடனடியாக அரசு மருத்துவமனையில் தடுப்பூசி செலுத்த வேண்டும்.',
          precautions: ['நாய் கடித்தால் சோப்பு மற்றும் ஓடும் நீரில் 15 நிமிடங்கள் கழுவவும்.', 'பாம்பு கடித்தவரை அசையாமல் படுக்க வைக்கவும்.'],
          warningSigns: ['கடுமையான வீக்கம்', 'சுவாசக் கோளாறு'],
          helpline: '108',
        },
        te: {
          severity: 'RED',
          title: 'అత్యవసరం: జంతువు లేదా పాము కాటు (వ్యాక్సిన్ చికిత్స)',
          facility: 'ప్రభుత్వ ఏరియా ఆసుపత్రి / జిల్లా ఆసుపత్రి',
          timeframe: 'వెంటనే (0 నుండి 6 గంటలు)',
          summary: 'కుక్క లేదా పాము కాటుకు తక్షణమే యాంటీ-రేబీస్ లేదా యాంటీ-స్నేక్ వెనమ్ ఇంజెక్షన్ అవసరం.',
          precautions: ['కుక్క కాటుకు: సబ్బు మరియు ప్రవహించే నీటితో 15 నిమిషాలు కడగాలి.', 'పాము కాటుకు: రోగిని కదలకుండా పడుకోబెట్టండి.'],
          warningSigns: ['గాయం చుట్టూ తీవ్ర వాపు', 'శ్వాస తీసుకోవడంలో కష్టం'],
          helpline: '108',
        },
        mr: {
          severity: 'RED',
          title: 'तातडीचे: श्वान / सर्पदंश (ARV व ASV लस)',
          facility: 'उपजिल्हा / जिल्हा रुग्णालय',
          timeframe: 'तातडीने (० ते ६ तास)',
          summary: 'श्वानदंश किंवा सर्पदंशावर त्वरित सरकारी रुग्णालयात लस घेणे अनिवार्य आहे.',
          precautions: ['वाहत्या पाण्याखाली साबणाने १५ मिनिटे जखम धुवा.', 'रुग्णाला तात्काळ हलवा.'],
          warningSigns: ['तीव्र सूज व गुंगी'],
          helpline: '१०८',
        },
        en: {
          severity: 'RED',
          title: 'EMERGENCY: Animal Bite / Snakebite Envenomation',
          facility: 'Taluka / District Hospital with Anti-Rabies (ARV) and Anti-Snake Venom (ASV)',
          timeframe: 'Immediate (Within 0 to 6 Hours)',
          summary: 'Animal exposures carry risk of fatal Rabies, and snakebites require urgent antivenom neutralization. Hospital prophylaxis is mandatory.',
          precautions: [
            'For animal bite: Flush and wash wound vigorously under running tap water with soap for 15 full minutes.',
            'For snakebite: Keep patient still and immobilized; do not cut, suck, or apply tight tourniquet.',
            'Transport to nearest government emergency care facility immediately.',
          ],
          warningSigns: ['Rapid swelling spreading past joint', 'Ptosis (drooping eyelids) or difficulty swallowing', 'Bleeding from fang puncture'],
          helpline: '108 Emergency Transport',
        },
      };

      return {
        text: getLoc({
          kn: 'ಪ್ರಾಣಿ ಅಥವಾ ಹಾವು ಕಡಿತಕ್ಕೆ ತಕ್ಷಣ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಚುಚ್ಚುಮದ್ದು ಪಡೆಯುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ. ತುರ್ತು ಮಾರ್ಗದರ್ಶನ ಕೆಳಗಿದೆ:',
          hi: 'पशु या सांप के काटने पर तुरंत अस्पताल जाकर इंजेक्शन लगवाना अनिवार्य है। कृपया नीचे दिए गए कदम उठाएं:',
          ta: 'பாம்பு அல்லது நாய் கடிக்கு உடனடியாக அரசு மருத்துவமனைக்குச் செல்ல வேண்டும். அவசர வழிகாட்டல் கீழே:',
          te: 'పాము లేదా కుక్క కాటుకు వెంటనే ప్రభుత్వ ఆసుపత్రిలో ఇంజెక్షన్ తీసుకోవాలి. మార్గదర్శకాలు క్రింద ఉన్నాయి:',
          mr: 'सर्पदंश किंवा श्वानदंशावर त्वरित रुग्णालयात जाणे गरजेचे आहे. खालील सूचना पाळा:',
          en: 'Bite trauma requires immediate hospital post-exposure prophylaxis. Refer to the critical instructions below:',
        }),
        triage: triageCards[lang] || triageCards.en,
      };
    }

    // 4. PREGNANCY & MATERNAL HEALTH
    if (
      q.includes('pregnancy') ||
      q.includes('pregnant') ||
      q.includes('baby') ||
      q.includes('bleeding') ||
      q.includes('labor') ||
      q.includes('ಗರ್ಭ') ||
      q.includes('ಹೆರಿಗೆ') ||
      q.includes('ಮಗು') ||
      q.includes('ರಕ್ತಸ್ರಾವ') ||
      q.includes('गर्भावस्था') ||
      q.includes('प्रसव') ||
      q.includes('बच्चा') ||
      q.includes('रक्तस्राव') ||
      q.includes('கர்ப்பம்') ||
      q.includes('பிரசவம்') ||
      q.includes('குழந்தை') ||
      q.includes('గర్భ') ||
      q.includes('డెలివరీ') ||
      q.includes('రక్తస్రావం') ||
      q.includes('बाळंतपण')
    ) {
      const triageCards: Record<Language, TriageCard> = {
        kn: {
          severity: 'YELLOW',
          title: 'ತಾಯಿ ಮತ್ತು ಮಗುವಿನ ಆರೋಗ್ಯ ತಪಾಸಣೆ (ANC / ಗರ್ಭಾವಸ್ಥೆ)',
          facility: 'ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC) ಅಥವಾ ಸಮುದಾಯ ಆಸ್ಪತ್ರೆ',
          timeframe: 'ಸಾಮಾನ್ಯ ತಪಾಸಣೆ: 24-48 ಗಂಟೆಗಳು | ರಕ್ತಸ್ರಾವವಿದ್ದರೆ ತಕ್ಷಣ',
          summary: 'ಗರ್ಭಿಣಿಯರ ನಿಯಮಿತ ತಪಾಸಣೆ, ರಕ್ತದೊತ್ತಡ, ತೂಕ ಮತ್ತು ಕಬ್ಬಿಣದ ಮಾತ್ರೆಗಳ (IFA) ವಿತರಣೆ PHC ನಲ್ಲಿ ಉಚಿತವಾಗಿ ಲಭ್ಯವಿದೆ.',
          precautions: [
            'ನಿಮ್ಮ ಆಶಾ (ASHA) ಕಾರ್ಯಕರ್ತೆಯ ಜೊತೆ ಮಾತನಾಡಿ ತಾಯಿ ಕಾರ್ಡ್ (MCP Card) ನವೀಕರಿಸಿ.',
            'ರಕ್ತಸ್ರಾವ ಅಥವಾ ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು ಇದ್ದರೆ ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ.',
            'ಪೌಷ್ಟಿಕ ಆಹಾರ ಮತ್ತು ಕಬ್ಬಿಣಾಂಶವಿರುವ ಆಹಾರ ಸೇವಿಸಿ.',
          ],
          warningSigns: ['ಯೋನಿ ರಕ್ತಸ್ರಾವ ಅಥವಾ ನೀರಿನ ವಿಸರ್ಜನೆ', 'ವಿಪರೀತ ತಲೆನೋವು ಮತ್ತು ಮುಖದಲ್ಲಿ ಊತ', 'ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗುವುದು'],
        },
        hi: {
          severity: 'YELLOW',
          title: 'मातृ एवं शिशु स्वास्थ्य देखभाल (ANC जांच)',
          facility: 'प्राथमिक स्वास्थ्य केंद्र (PHC) / सामुदायिक स्वास्थ्य केंद्र',
          timeframe: 'नियमित जांच: 24-48 घंटे | रक्तस्राव होने पर तत्काल',
          summary: 'गर्भावस्था की नियमित जांच, बीपी, सोनोग्राफी और पोषण सप्लीमेंट पीएचसी पर निःशुल्क उपलब्ध हैं।',
          precautions: [
            'अपनी आशा कार्यकर्ता से संपर्क करें और एमसीपी कार्ड अपडेट रखें।',
            'रक्तस्राव या तेज दर्द होने पर तुरंत 108 पर कॉल करें।',
            'आयरन और फोलिक एसिड की गोलियां नियमित लें।',
          ],
          warningSigns: ['रक्तस्राव या पानी छूटना', 'चेहरे और पैरों पर अचानक सूजन', 'शिशु की हलचल कम होना'],
        },
        ta: {
          severity: 'YELLOW',
          title: 'தாய் சேய் நலம் மற்றும் கர்ப்பகால பரிசோதனை (ANC)',
          facility: 'ஆரம்ப சுகாதார நிலையம் (PHC)',
          timeframe: '24-48 மணி நேரத்திற்குள் பரிசோதிக்கவும்',
          summary: 'கர்ப்பிணி தாய்மார்களுக்கான பரிசோதனை மற்றும் சத்து மாத்திரைகள் ஆரம்ப சுகாதார நிலையத்தில் இலவசம்.',
          precautions: ['ஆஷா / கிராம செவிலியரை தொடர்பு கொள்ளவும்.', 'ரத்தப்போக்கு இருந்தால் உடனே மருத்துவமனை செல்லவும்.'],
          warningSigns: ['ரத்தப்போக்கு', 'முகத்தில் வீக்கம்', 'குழந்தையின் அசைவு குறைதல்'],
        },
        te: {
          severity: 'YELLOW',
          title: 'తల్లీ బిడ్డల సంరక్షణ (గర్భధారణ తనిఖీ - ANC)',
          facility: 'ప్రాథమిక ఆరోగ్య కేంద్రం (PHC)',
          timeframe: '24-48 గంటల్లోగా పీహెಚ್‌సీని సందర్శించండి',
          summary: 'గర్భిణీ స్త్రీలకు ఉచిత వైద్య పరీక్షలు, ఐరన్ మాత్రలు మరియు టీకాలు పీహెచ్‌సీలో అందుబాటులో ఉన్నాయి.',
          precautions: ['ఆశా కార్యకర్తను సంప్రదించండి.', 'రక్తస్రావం ఉంటే వెంటనే 108 కి కాల్ చేయండి.'],
          warningSigns: ['రక్తస్రావం', 'తీవ్ర తలనొప్పి', 'కడుపులో శిశువు కదలికలు తగ్గడం'],
        },
        mr: {
          severity: 'YELLOW',
          title: 'माता व बाल संगोपन तपासणी (ANC)',
          facility: 'प्राथमिक आरोग्य केंद्र (PHC)',
          timeframe: '२४-४८ तासांत भेट द्या',
          summary: 'गरोदरपणातील सर्व तपासण्या व मोफत औषधे प्राथमिक आरोग्य केंद्रात मिळतात.',
          precautions: ['आशा सेविकेशी संपर्क साधा.', 'रक्तस्त्राव झाल्यास त्वरित १०८ वर फोन करा.'],
          warningSigns: ['रक्तस्त्राव', 'पायांवर अचानक सूज'],
        },
        en: {
          severity: 'YELLOW',
          title: 'Antenatal Care & Maternal Health Assessment',
          facility: 'Primary Health Centre (PHC) / Community Health Centre (CHC)',
          timeframe: 'Routine: Within 24-48 Hours | If bleeding/pain: Immediate',
          summary: 'Comprehensive maternal health monitoring, BP screening, hemoglobin testing, and iron-folic acid supplementation are provided under ABDM protocols.',
          precautions: [
            'Coordinate with your local ASHA worker to ensure MCP Card immunization schedules are updated.',
            'If vaginal bleeding, severe abdominal cramps, or gush of fluid occurs, call 108 ambulance immediately.',
            'Take prescribed calcium and iron supplements daily after meals.',
          ],
          warningSigns: ['Vaginal bleeding or fluid leakage', 'Severe continuous headache with visual disturbances', 'Decreased fetal movements'],
        },
      };

      return {
        text: getLoc({
          kn: 'ಗರ್ಭಾವಸ್ಥೆಯ ಮತ್ತು ತಾಯಿಯ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ ಕೆಳಗಿದೆ. ನಿಯಮಿತ ತಪಾಸಣೆಗೆ ನಿಮ್ಮ ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿಗೆ ಭೇಟಿ ನೀಡಿ:',
          hi: 'गर्भावस्था और मातृ स्वास्थ्य संबंधी मार्गदर्शन नीचे दिया गया है। नियमित जांच हेतु निकटतम पीएचसी जाएं:',
          ta: 'கர்ப்பகால பராமரிப்பு மற்றும் தாய் சேய் நல வழிகாட்டல் கீழே தரப்பட்டுள்ளது:',
          te: 'గర్భధారణ మరియు మాతా శిశు సంరక్షణ మార్గదర్శకాలు క్రింద ఉన్నాయి:',
          mr: 'गरोदरपणातील काळजी व प्राथमिक आरोग्य केंद्राचे मार्गदर्शन खालीलप्रमाणे:',
          en: 'Maternal health advisory formulated. Please consult your local PHC medical officer or ANM for clinical evaluation:',
        }),
        triage: triageCards[lang] || triageCards.en,
      };
    }

    // 5. GENERAL HEALTH / COUGH / STOMACH / OTHER QUESTIONS
    const generalReplies: Record<Language, string> = {
      kn: `ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಧನ್ಯವಾದಗಳು. ರೋಗಲಕ್ಷಣಗಳ ಉಪಶಮನಕ್ಕಾಗಿ ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ನಿಮ್ಮ ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರದಲ್ಲಿ (PHC) ವೈದ್ಯರ ಸಮಾಲೋಚನೆ ಉಚಿತವಾಗಿರುತ್ತದೆ. ನೀವು ರಕ್ತದೊತ್ತಡ, ಮಧುಮೇಹ, ಅಥವಾ ಸಾಮಾನ್ಯ ಔಷಧಗಳನ್ನು ಪಿಎಚ್‌ಸಿಯಿಂದ ನೇರವಾಗಿ ಪಡೆಯಬಹುದು. ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಿದ್ದರೆ 108 ಕ್ಕೆ ಕರೆ ಮಾಡಿ.`,
      hi: `आपकी समस्या समझी गई। आराम करें और भरपूर पानी पिएं। अपने नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर से परामर्श लें, जहाँ जांच और दवाएं पूरी तरह से निःशुल्क हैं। यदि लक्षण 24 घंटे में ठीक न हों या बढ़ें, तो तुरंत अस्पताल जाएं। किसी भी आपातकाल में 108 डायल करें।`,
      ta: `உங்கள் கேள்வியை கவனித்தேன். ஓய்வெடுக்கவும், போதுமான நீர் பருகவும். அருகிலுள்ள ஆரம்ப சுகாதார நிலையத்தில் (PHC) மருத்துவர் ஆலோசனை மற்றும் மருந்துகள் முற்றிலும் இலவசம். தீவிர அறிகுறிகள் தென்பட்டால் உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும்.`,
      te: `మీ సమస్య పరిశీలించబడింది. తగినంత విశ్రాంతి తీసుకోండి మరియు నీరు త్రాగండి. సమీప ప్రాథమిక ఆరోగ్య కేంద్రంలో (PHC) డాక్టర్ సంప్రదింపులు మరియు మందులు ఉచితంగా లభిస్తాయి. అత్యవసరమైతే 108 కు కాల్ చేయండి.`,
      mr: `आपली समस्या नोंदवली आहे. भरपूर विश्रांती घ्या आणि पाणी प्या. जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) डॉक्टरांचा विनामूल्य सल्ला व औषधे उपलब्ध आहेत. आपत्कालीन स्थितीत १०८ वर संपर्क करा.`,
      en: `Thank you for sharing your concern. For mild symptoms, adequate hydration, rest, and home monitoring are recommended. Visit your nearest Primary Health Centre (PHC) for a free general physician consultation and generic medication dispensation. Dial 108 if any emergency warning signs develop.`,
    };

    return {
      text: generalReplies[lang] || generalReplies.en,
      quickReplies: [
        lang === 'kn' ? 'ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿ ಹುಡುಕಿ' : lang === 'hi' ? 'निकटतम पीएचसी खोजें' : 'Locate Nearby PHC',
        lang === 'kn' ? 'ತುರ್ತು 108 ಕರೆ' : lang === 'hi' ? '108 आपातकालीन सहायता' : 'Emergency 108 SOS',
        lang === 'kn' ? 'ಔಷಧಿ ಮಾಹಿತಿ' : lang === 'hi' ? 'दवाओं की जानकारी' : 'Medicine Information',
      ],
    };
  };

  // Handle Send Message
  const handleSendMessage = (textToSend?: string, isVoiceInput: boolean = false) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: isVoiceInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSpeechTranscript('');
    setIsAiTyping(true);

    // AI Response processing with short realistic natural clinical delay
    setTimeout(() => {
      const evaluation = evaluateClinicalResponse(text, language);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: evaluation.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triage: evaluation.triage,
        quickReplies: evaluation.quickReplies,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsAiTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[90vh] max-h-[750px] overflow-hidden">
        
        {/* ── HEADER WITH DYNAMIC LANGUAGE SWITCHER ── */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner shrink-0 relative">
              <Bot className="w-5 h-5" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black truncate">
                  {getLoc({
                    en: 'SwasthyaSetu AI Health Assistant',
                    kn: 'ಸ್ವಾಸ್ಥ್ಯಸೇತು AI ಆರೋಗ್ಯ ಸಹಾಯಕ',
                    hi: 'स्वास्थ्यसेतु AI स्वास्थ्य सहायक',
                    ta: 'சுவஸ்த்யாசேது AI உதவியாளர்',
                    te: 'స్వాస్థ్యసేతు AI ఆరోగ్య సహాయకుడు',
                    mr: 'स्वास्थ्यसेतू AI आरोग्य सहाय्यक',
                  })}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-200 font-medium">
                <Mic className="w-3 h-3 text-emerald-300" />
                <span>
                  {getLoc({
                    en: 'Voice Enabled · Speak in your language',
                    kn: 'ಧ್ವನಿ ಸಕ್ರಿಯವಾಗಿದೆ · ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ',
                    hi: 'वॉयस सक्षम · अपनी भाषा में बोलें',
                    ta: 'குரல் உள்ளீடு · உங்கள் மொழியில் பேசுங்கள்',
                    te: 'వాయిస్ అందుబాటులో ఉంది · మీ భాషలో మాట్లాడండి',
                    mr: 'व्हॉइस सक्षम · आपल्या भाषेत बोला',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Language Toggle inside modal */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-white/20 text-white border border-white/30 focus:outline-hidden cursor-pointer"
            >
              <option value="en" className="text-slate-900">English</option>
              <option value="kn" className="text-slate-900">ಕನ್ನಡ (Kannada)</option>
              <option value="hi" className="text-slate-900">हिन्दी (Hindi)</option>
              <option value="ta" className="text-slate-900">தமிழ் (Tamil)</option>
              <option value="te" className="text-slate-900">తెలుగు (Telugu)</option>
              <option value="mr" className="text-slate-900">मराठी (Marathi)</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── CHAT MESSAGES BODY ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 dark:bg-slate-950/50">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
                  }`}
                >
                  {msg.isVoice && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-200 font-bold mb-1">
                      <Mic className="w-3 h-3" />
                      <span>{getLoc({ en: 'Spoken via Voice', kn: 'ಧ್ವನಿಯ ಮೂಲಕ ಹೇಳಲಾಗಿದೆ', hi: 'आवाज द्वारा दर्ज', ta: 'குரல் மூலம் சொல்லப்பட்டது', te: 'స్వరంతో చెప్పబడింది', mr: 'आवाजात सांगितले' })}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  <div
                    className={`text-[9px] mt-1.5 font-mono ${
                      msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {/* Clinical Triage Rich Card */}
                {msg.triage && (
                  <div
                    className={`rounded-2xl border-2 p-4 space-y-3 shadow-md animate-in fade-in duration-300 ${
                      msg.triage.severity === 'RED'
                        ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-500'
                        : msg.triage.severity === 'YELLOW'
                        ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500'
                        : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${
                            msg.triage.severity === 'RED'
                              ? 'bg-rose-600 animate-pulse'
                              : msg.triage.severity === 'YELLOW'
                              ? 'bg-amber-600'
                              : 'bg-emerald-600'
                          }`}
                        >
                          {msg.triage.severity === 'RED'
                            ? getLoc({ en: 'Emergency (108 SOS)', kn: 'ತುರ್ತು (108 SOS)', hi: 'आपातकालीन (108 SOS)', ta: 'அவசரம் (108 SOS)', te: 'అత్యవసరం (108 SOS)', mr: 'तातडीचे (१०८ SOS)' })
                            : msg.triage.severity === 'YELLOW'
                            ? getLoc({ en: 'Visit PHC in 24h', kn: '24 ಗಂಟೆಯಲ್ಲಿ PHC ಭೇಟಿ', hi: '24 घंटे में PHC जाएं', ta: '24 மணி நேரத்தில் PHC', te: '24 గంటల్లో PHC సందర్శన', mr: '२४ तासांत PHC भेट' })
                            : getLoc({ en: 'Home Care / Sub-Centre', kn: 'ಮನೆ ಆರೈಕೆ / ಉಪಕೇಂದ್ರ', hi: 'गृह देखभाल / उप-केंद्र', ta: 'வீட்டுப் பராமரிப்பு', te: 'గృహ సంరక్షణ / ఉపకేంద్రం', mr: 'घरगुती काळजी' })}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{msg.triage.timeframe}</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {msg.triage.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {msg.triage.summary}
                    </p>

                    <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-black">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{msg.triage.facility}</span>
                      </div>
                      
                      <div className="pt-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {getLoc({ en: 'Key Actions:', kn: 'ಮುಖ್ಯ ಕ್ರಮಗಳು:', hi: 'मुख्य कदम:', ta: 'முக்கிய நடவடிக்கைகள்:', te: 'ముఖ్య చర్యలు:', mr: 'महत्त्वाच्या सूचना:' })}
                        </span>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600 dark:text-slate-300">
                          {msg.triage.precautions.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {msg.triage.helpline && (
                      <a
                        href="tel:108"
                        className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Phone className="w-4 h-4 animate-bounce" />
                        <span>{getLoc({ en: 'Call 108 Emergency Ambulance', kn: '108 ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ', hi: '108 आपातकालीन एम्बुलेंस को कॉल करें', ta: '108 ஆம்புலன்ஸை அழைக்கவும்', te: '108 ఎమర్జెన్సీ అంబులెన్స్‌కు కాల్ చేయండి', mr: '१०८ रुग्णवाहिकेला कॉल करा' })}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Quick Reply Chips */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(reply)}
                        className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking Animation */}
          {isAiTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic px-3 py-1">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>
                {getLoc({
                  en: 'AI is analyzing your symptoms and clinical protocol...',
                  kn: 'AI ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...',
                  hi: 'AI आपके लक्षणों का विश्लेषण कर रहा है...',
                  ta: 'AI உங்கள் அறிகுறிகளை பரிசீலிக்கிறது...',
                  te: 'AI మీ లక్షణాలను విశ్లేషిస్తోంది...',
                  mr: 'AI आपल्या लक्षणांचे विश्लेषण करत आहे...',
                })}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── LIVE VOICE RECORDING OVERLAY (WHEN PATIENT SPEAKS) ── */}
        {isListening && (
          <div className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center animate-pulse">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <span>
                    {getLoc({
                      en: 'Listening in English... Speak now',
                      kn: 'ಕನ್ನಡದಲ್ಲಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಮಾತನಾಡಿ',
                      hi: 'सुन रहा हूँ... बोलिए',
                      ta: 'கேட்கிறது... தமிழில் பேசுங்கள்',
                      te: 'వింటున్నాను... మాట్లాడండి',
                      mr: 'मराठीत ऐकत आहे... बोला',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-mono truncate max-w-xs sm:max-w-md">
                  {speechTranscript || getLoc({ en: '"Describe your symptoms..."', kn: '"ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಹೇಳಿ..."', hi: '"अपने लक्षण बताएं..."', ta: '"உங்கள் அறிகுறிகளை சொல்லுங்கள்..."', te: '"మీ సమస్యను వివరించండి..."', mr: '"आपली लक्षणे सांगा..."' })}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleListening}
              className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 font-black text-xs hover:bg-emerald-50 cursor-pointer shadow-md"
            >
              {getLoc({ en: 'Stop & Send', kn: 'ನಿಲ್ಲಿಸಿ ಕಳುಹಿಸಿ', hi: 'रोकें और भेजें', ta: 'நிறுத்தி அனுப்பு', te: 'ఆపి పంపండి', mr: 'थांबवा व पाठवा' })}
            </button>
          </div>
        )}

        {/* ── INPUT BOX & MICROPHONE BUTTON ── */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* BIG ACCESSIBLE MICROPHONE BUTTON */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-4 ring-rose-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
              title={
                isListening
                  ? 'Stop Voice Recording'
                  : getLoc({
                      en: 'Tap to Speak in Voice',
                      kn: 'ಧ್ವನಿಯಲ್ಲಿ ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
                      hi: 'आवाज में बोलने के लिए दबाएं',
                      ta: 'குரலில் பேச தொடவும்',
                      te: 'స్వరంతో మాట్లాడటానికి నొక్కండి',
                      mr: 'आवाजात बोलण्यासाठी दाबा',
                    })
              }
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? getLoc({
                      en: 'Listening to your voice...',
                      kn: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
                      hi: 'आपकी आवाज सुनी जा रही है...',
                      ta: 'உங்கள் குரலைக் கேட்கிறது...',
                      te: 'మీ స్వరం వినబడుతోంది...',
                      mr: 'आपला आवाज ऐकला जात आहे...',
                    })
                  : getLoc({
                      en: 'Type symptoms or tap mic to speak in voice...',
                      kn: 'ರೋಗಲಕ್ಷಣಗಳನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ...',
                      hi: 'लक्षण लिखें या बोलने के लिए माइक दबाएं...',
                      ta: 'அறிகுறிகளை தட்டச்சு செய்யவும் அல்லது மைக் அழுத்தவும்...',
                      te: 'లక్షణాలను టైప్ చేయండి లేదా మాట్లాడటానికి మైక్ నొక్కండి...',
                      mr: 'लक्षणे लिहा किंवा बोलण्यासाठी माइक दाबा...',
                    })
              }
              className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-95"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-medium px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>
                {getLoc({
                  en: 'National Health Mission & ABDM Triage Compliant',
                  kn: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಮಿಷನ್ ಮತ್ತು ABDM ಅನುಸರಣೆ',
                  hi: 'राष्ट्रीय स्वास्थ्य मिशन प्रोटोकॉल अनुरूप',
                  ta: 'தேசிய சுகாதார இயக்கம் வழிகாட்டல்',
                  te: 'జాతీయ ఆరోగ్య మిషన్ మార్గదర్శకాలు',
                  mr: 'राष्ट्रीय आरोग्य अभियान प्रमाणित',
                })}
              </span>
            </span>
            <span>
              {getLoc({
                en: 'Patient speaks in voice · AI responds in text',
                kn: 'ರೋಗಿ ಧ್ವನಿಯಲ್ಲಿ ಮಾತನಾಡುತ್ತಾರೆ · AI ಪಠ್ಯದಲ್ಲಿ ಉತ್ತರಿಸುತ್ತದೆ',
                hi: 'मरीज आवाज में बोलते हैं · AI टेक्स्ट में उत्तर देता है',
                ta: 'நோயாளி குரலில் பேசுகிறார் · AI பதிலளிக்கிறது',
                te: 'రోగి వాయిస్‌లో మాట్లాడతారు · AI వచనంలో ప్రతిస్పందిస్తుంది',
                mr: 'रुग्ण आवाजात बोलतात · AI उत्तरे देते',
              })}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
