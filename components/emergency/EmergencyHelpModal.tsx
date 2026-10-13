'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';
import {
  AlertTriangle,
  X,
  Phone,
  PhoneCall,
  MapPin,
  Send,
  Volume2,
  VolumeX,
  Flashlight,
  Building2,
  Clock,
  Shield,
  ChevronRight,
  ChevronDown,
  Navigation,
  Heart,
  Baby,
  Sun,
  Flame,
  CheckCircle2,
  Smartphone,
  Info,
  UserCheck,
  Edit2,
  Check,
  Sparkles,
} from 'lucide-react';
import { INITIAL_FACILITIES } from '@/lib/mockData';
import { Facility } from '@/lib/types';

interface EmergencyHelpModalProps {
  onClose: () => void;
}

// ── Haversine Distance (km) ───────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CAPABILITY_RANK: Record<string, number> = {
  'Medical College': 5,
  'District Hospital': 4,
  'Rural Hospital': 3,
  PHC: 2,
  'Sub-Centre': 1,
};

function findNearestFacility(lat: number, lng: number): { facility: Facility; distanceKm: number } {
  const candidates = INITIAL_FACILITIES.filter((f) => CAPABILITY_RANK[f.type] >= 2);
  let best: { facility: Facility; distanceKm: number; score: number } | null = null;
  for (const f of candidates) {
    const d = haversineKm(lat, lng, f.lat, f.lng);
    const score = 1 / (d + 0.1) + CAPABILITY_RANK[f.type] * 0.05;
    if (!best || score > best.score) {
      best = { facility: f, distanceKm: d, score };
    }
  }
  if (!best) {
    const sorted = INITIAL_FACILITIES.slice().sort(
      (a, b) => haversineKm(lat, lng, a.lat, a.lng) - haversineKm(lat, lng, b.lat, b.lng)
    );
    return { facility: sorted[0], distanceKm: haversineKm(lat, lng, sorted[0].lat, sorted[0].lng) };
  }
  return { facility: best.facility, distanceKm: best.distanceKm };
}

// Default Rural Service Area Location (Velhe / Karjat Taluka)
const DEFAULT_LAT = 18.2956;
const DEFAULT_LNG = 73.6358;

interface FirstAidProtocol {
  id: string;
  icon: any;
  color: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  steps: Record<Language, string[]>;
  donts: Record<Language, string[]>;
}

const FIRST_AID_PROTOCOLS: FirstAidProtocol[] = [
  {
    id: 'snakebite',
    icon: AlertTriangle,
    color: 'rose',
    title: {
      en: 'Snakebite Emergency (सर्पदंश / ಹಾವು ಕಡಿತ)',
      mr: 'सर्पदंश तातडीचे प्रथमोपचार (Snakebite)',
      hi: 'सांप के काटने पर तुरंत उपचार (Snakebite)',
      kn: 'ಹಾವು ಕಡಿತ ತುರ್ತು ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ (Snakebite)',
      ta: 'பாம்பு கடி அவசர முதலுதவி (Snakebite)',
      te: 'పాము కాటు అత్యవసర ప్రథమ చికిత్స (Snakebite)',
    },
    subtitle: {
      en: 'Keep victim calm and limb completely still below heart level.',
      mr: 'रुग्णाला शांत ठेवा, चावलेला अवयव न हलवता हृदयाच्या खाली ठेवा.',
      hi: 'मरीज को शांत रखें, डंक लगे अंग को बिना हिलाए दिल के स्तर से नीचे रखें।',
      kn: 'ರೋಗಿಯನ್ನು ಶಾಂತವಾಗಿರಿಸಿ, ಕಚ್ಚಿದ ಅಂಗವನ್ನು ಚಲಿಸದೆ ಹೃದಯದ ಮಟ್ಟಕ್ಕಿಂತ ಕೆಳಗೆ ಇರಿಸಿ.',
      ta: 'பாதிக்கப்பட்டவரை அமைதிப்படுத்தி, கடித்த பகுதியை இதய நிலைக்குக் கீழே வைக்கவும்.',
      te: 'బాధితుడిని ప్రశాంతంగా ఉంచండి, కాటు వేసిన భాగాన్ని కదల్చకుండా ఉంచండి.',
    },
    steps: {
      en: [
        'Immobilize the bitten limb with a splint or sling (do not move it).',
        'Remove tight rings, bangles, or anklets before swelling begins.',
        'Keep the victim lying down and quiet to slow venom spread.',
        'Rush immediately to the nearest PHC / Hospital with Anti-Snake Venom (ASV).',
      ],
      mr: [
        'चावलेला हात किंवा पाय लाकडी पट्टीने बांधून स्थिर ठेवा (हालचाल करू नका).',
        'सूज येण्यापूर्वी घट्ट अंगठ्या, बांगड्या किंवा पैंजण लगेच काढून घ्या.',
        'विष शरीरात पसरू नये म्हणून रुग्णाला झोपवून विश्रांती द्या.',
        'अँटी-स्नेक व्हेनम (ASV) उपलब्ध असलेल्या जवळच्या रुग्णालयात तातडीने न्या.',
      ],
      hi: [
        'डंक लगे अंग को किसी लकड़ी या कपड़े से स्थिर कर दें (हिलाएं नहीं)।',
        'सूजन आने से पहले अंगूठी, चूड़ियां या कड़े तुरंत उतार लें।',
        'जहर फैलने की गति धीमी करने के लिए मरीज को शांत लिटाकर रखें।',
        'एंटी-स्नेक वेनम (ASV) उपलब्ध होने वाले नजदीकी पीएचसी/अस्पताल तुरंत ले जाएं।',
      ],
      kn: [
        'ಕಚ್ಚಿದ ಅಂಗವನ್ನು ಚಲಿಸದಂತೆ ಬ್ಯಾಂಡೇಜ್ ಅಥವಾ ಕಡ್ಡಿಯಿಂದ ಸ್ಥಿರವಾಗಿಡಿ.',
        'ಊತ ಬರುವ ಮುನ್ನ ಉಂಗುರಗಳು, ಬಳೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆಯಿರಿ.',
        'ವಿಷ ಹರಡುವುದನ್ನು ತಡೆಯಲು ರೋಗಿಯನ್ನು ಮಲಗಿಸಿ ಶಾಂತವಾಗಿರಿಸಿ.',
        'ASV ಚುಚ್ಚುಮದ್ದು ಲಭ್ಯವಿರುವ ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿಗೆ ತಕ್ಷಣ ಕರೆದೊಯ್ಯಿರಿ.',
      ],
      ta: [
        'கடித்த மூட்டை அசைக்காமல் குச்சி அல்லது துணியால் கட்டி வைக்கவும்.',
        'வீக்கம் தொடங்குவதற்கு முன் மோதிரங்கள், வளையல்களை கழற்றவும்.',
        'நஞ்சு பரவுவதை குறைக்க பாதிக்கப்பட்டவரை படுக்க வைக்கவும்.',
        'பாம்பு நஞ்சு எதிர்ப்பு மருந்து (ASV) உள்ள மருத்துவமனைக்கு உடனே செல்லவும்.',
      ],
      te: [
        'కాటు వేసిన భాగాన్ని కదల్చకుండా పట్టీతో స్థిరంగా ఉంచండి.',
        'వాపు రాకముందే ఉంగరాలు, గాజులను తీసివేయండి.',
        'విషం వేగంగా వ్యాపించకుండా బాధితుడిని పడుకోబెట్టండి.',
        'ASV మందులు అందుబాటులో ఉన్న ఆసుపత్రికి వెంటనే తరలించండి.',
      ],
    },
    donts: {
      en: [
        'DO NOT tie tight rope/tourniquet (causes gangrene and limb loss).',
        'DO NOT cut the wound, suck venom, or apply cow dung/herbs.',
        'DO NOT give alcohol, tea, or aspirin.',
      ],
      mr: [
        'घट्ट दोरी किंवा फास बांधू नका (रक्तपुरवठा बंद होऊन अवयव कापावा लागतो).',
        'जखमेवर ब्लेडने कापू नका, विष चोखू नका किंवा शेण/पाने लावू नका.',
        'रुग्णाला चहा, मद्य किंवा कोणतीही गोळी देऊ नका.',
      ],
      hi: [
        'कसकर रस्सी या पट्टी न बांधें (अंग गलने का खतरा होता है)।',
        'घाव पर चीरा न लगाएं, जहर न चूसें और गोबर/जड़ी-बूटी न लगाएं।',
        'मरीज को चाय, शराब या एस्पिरिन न दें।',
      ],
      kn: [
        'ಬಿಗಿಯಾದ ಹಗ್ಗ ಕಟ್ಟಬೇಡಿ (ರಕ್ತ ಸಂಚಾರ ನಿಂತು ಅಂಗ ಕತ್ತರಿಸುವ ಅಪಾಯವಿದೆ).',
        'ಗಾಯವನ್ನು ಕತ್ತರಿಸಬೇಡಿ, ವಿಷವನ್ನು ಹೀರುವ ಪ್ರಯತ್ನ ಮಾಡಬೇಡಿ.',
        'ರೋಗಿಗೆ ಚಹಾ, ಮದ್ಯ ಅಥವಾ ಮಾತ್ರೆಗಳನ್ನು ನೀಡಬೇಡಿ.',
      ],
      ta: [
        'கயிற்றால் இறுக்கமாக கட்ட வேண்டாம் (இரத்த ஓட்டம் நின்றுவிடும்).',
        'காயத்தை வெட்டவோ அல்லது நஞ்சை உறிஞ்சவோ வேண்டாம்.',
        'மது அல்லது தேநீர் கொடுக்க வேண்டாம்.',
      ],
      te: [
        'గట్టిగా తాడు కట్టవద్దు (రక్త ప్రసరణ ఆగిపోతుంది).',
        'గాయాన్ని కోయవద్దు మరియు విషాన్ని పీల్చవద్దు.',
        'టీ లేదా మద్యం ఇవ్వవద్దు.',
      ],
    },
  },
  {
    id: 'cpr',
    icon: Heart,
    color: 'red',
    title: {
      en: 'Heart Attack & Hands-Only CPR (हृदयविकार / ಹೃದಯಾಘಾತ)',
      mr: 'हृदयविकाराचा झटका व CPR प्रथमोपचार',
      hi: 'दिल का दौरा और सीपीआर (CPR)',
      kn: 'ಹೃದಯಾಘಾತ ಮತ್ತು ಸಿಪಿಆರ್ (CPR)',
      ta: 'மாரடைப்பு & சிபிஆர் (CPR) முதலுதவி',
      te: 'గుండెపోటు మరియు సిపిఆర్ (CPR)',
    },
    subtitle: {
      en: 'If patient is unresponsive and not breathing normally, begin chest compressions.',
      mr: 'रुग्ण बेशुद्ध असल्यास व श्वास घेत नसल्यास छातीवर तात्काळ दाब (CPR) द्या.',
      hi: 'यदि मरीज बेहोश है और सांस नहीं ले रहा, तो तुरंत सीने पर दबाव (CPR) शुरू करें।',
      kn: 'ರೋಗಿ ಪ್ರಜ್ಞಾಹೀನರಾಗಿದ್ದರೆ ಮತ್ತು ಉಸಿರಾಡದಿದ್ದರೆ, ತಕ್ಷಣ ಎದೆಯ ಮೇಲೆ ಒತ್ತಡ ಹಾಕಿ.',
      ta: 'நோயாளி மூச்சு விடவில்லை என்றால் உடனடியாக மார்பில் அழுத்தம் (CPR) கொடுக்கவும்.',
      te: 'బాధితుడు స్పృహ కోల్పోతే వెంటనే ఛాతీపై ఒత్తిడి (CPR) ప్రారంభించండి.',
    },
    steps: {
      en: [
        'Place heel of hand in center of patient chest; interlock fingers of other hand.',
        'Push hard and fast: 100 to 120 compressions per minute (2 inches deep).',
        'Do not stop compressions until ambulance or trained medic arrives.',
        'If conscious with crushing chest pain, have patient chew 1 Aspirin 300mg.',
      ],
      mr: [
        'रुग्णाच्या छातीच्या मध्यभागी तळहात ठेवा; दुसऱ्या हाताची बोटे गुंफा.',
        'जोरात आणि जलद गतीने दाबा: दर मिनिटाला १०० ते १२० वेळा (२ इंच खोली).',
        'रुग्णवाहिका किंवा डॉक्टर येईपर्यंत छाती दाबणे थांबवू नका.',
        'रुग्ण शुद्धीत असल्यास व छातीत तीव्र कळ असल्यास ३००mg अ‍ॅस्पिरिन गोळी चावून खायला द्या.',
      ],
      hi: [
        'हथेली को मरीज के सीने के बीच में रखें; दूसरे हाथ की उंगलियां फंसाएं।',
        'तेज और लगातार दबाएं: प्रति मिनट 100 से 120 बार (लगभग 2 इंच गहरा)।',
        'एंबुलेंस आने तक छाती दबाना बंद न करें।',
        'यदि मरीज होश में है और सीने में दर्द है, तो 300mg एस्पिरिन चबाने को दें।',
      ],
      kn: [
        'ಎದೆಯ ಮಧ್ಯಭಾಗದಲ್ಲಿ ಅಂಗೈ ಇರಿಸಿ; ಇನ್ನೊಂದು ಕೈಯ ಬೆರಳುಗಳನ್ನು ಸಿಕ್ಕಿಸಿ.',
        'ವೇಗವಾಗಿ ಮತ್ತು ಬಲವಾಗಿ ಒತ್ತಿ: ನಿಮಿಷಕ್ಕೆ 100 ರಿಂದ 120 ಬಾರಿ.',
        'ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುವವರೆಗೆ ಸಿಪಿಆರ್ ನಿಲ್ಲಿಸಬೇಡಿ.',
        'ಎದೆ ನೋವಿದ್ದರೆ 300mg ಆಸ್ಪಿರಿನ್ ಮಾತ್ರೆ ಅಗಿಯಲು ನೀಡಿ.',
      ],
      ta: [
        'மார்பின் நடுவில் உள்ளங்கையை வைக்கவும்; மற்றொரு கையை விரல்களால் பூட்டவும்.',
        'வேகமாக அழுத்தவும்: நிமிடத்திற்கு 100-120 அழுத்தங்கள்.',
        'ஆம்புலன்ஸ் வரும் வரை அழுத்தத்தை நிறுத்த வேண்டாம்.',
        'மயக்கமில்லாமல் மார்பு வலி இருந்தால் 300mg ஆஸ்பிரின் மாத்திரை கொடுக்கவும்.',
      ],
      te: [
        'ఛాతీ మధ్యలో అరచేయిని ఉంచండి; వేరొక చేతితో కలపండి.',
        'వేగంగా నొక్కండి: నిమిషానికి 100-120 సార్లు.',
        'వైద్య సహాయం వచ్చే వరకు ఆగవద్దు.',
        'ఛాతీ నొప్పి ఉంటే 300mg ఆస్పిరిన్ మాత్ర నమలడానికి ఇవ్వండి.',
      ],
    },
    donts: {
      en: [
        'DO NOT leave the person alone.',
        'DO NOT give water or fluids to an unconscious person (causes choking).',
      ],
      mr: [
        'रुग्णाला एकटे सोडू नका.',
        'बेशुद्ध व्यक्तीला पाणी किंवा इतर काहीही पाजू नका (श्वासनलिकेत अडकू शकते).',
      ],
      hi: [
        'मरीज को अकेला न छोड़ें।',
        'बेहोश व्यक्ति को पानी या कोई तरल पदार्थ न पिलाएं।',
      ],
      kn: [
        'ರೋಗಿಯನ್ನು ಒಂಟಿಯಾಗಿ ಬಿಡಬೇಡಿ.',
        'ಪ್ರಜ್ಞಾಹೀನ ವ್ಯಕ್ತಿಗೆ ನೀರು ಅಥವಾ ದ್ರವ ನೀಡಬೇಡಿ.',
      ],
      ta: [
        'மயக்கமடைந்தவருக்கு தண்ணீர் கொடுக்க வேண்டாம்.',
        'நோயாளியை தனியாக விட்டுவிடாதீர்கள்.',
      ],
      te: [
        'స్పృహలేని వ్యక్తికి నీరు ఇవ్వవద్దు.',
        'వ్యక్తిని ఒంటరిగా వదలకండి.',
      ],
    },
  },
  {
    id: 'bleeding',
    icon: Flame,
    color: 'amber',
    title: {
      en: 'Severe Bleeding & Trauma (रक्तस्त्राव / ತೀವ್ರ ರಕ್ತಸ್ರಾವ)',
      mr: 'तीव्र रक्तस्त्राव नियंत्रण (Severe Bleeding)',
      hi: 'गंभीर रक्तस्राव नियंत्रण (Severe Bleeding)',
      kn: 'ತೀವ್ರ ರಕ್ತಸ್ರಾವ ತಡೆಗಟ್ಟುವಿಕೆ (Severe Bleeding)',
      ta: 'கடுமையான இரத்தப்போக்கு கட்டுப்பாடு',
      te: 'తీవ్రమైన రక్తస్రావం నియంత్రణ',
    },
    subtitle: {
      en: 'Firm direct pressure is the single most effective way to stop external bleeding.',
      mr: 'रक्तस्त्राव थांबवण्यासाठी जखमेवर थेट स्वच्छ कापडाने दाब देणे हा सर्वात प्रभावी उपाय आहे.',
      hi: 'खून रोकने के लिए साफ कपड़े से घाव पर सीधा और मजबूत दबाव बनाएं।',
      kn: 'ರಕ್ತಸ್ರಾವ ತಡೆಯಲು ಸ್ವಚ್ಛ ಬಟ್ಟೆಯಿಂದ ಗಾಯದ ಮೇಲೆ ನೇರ ಒತ್ತಡ ಹಾಕಿ.',
      ta: 'இரத்தப்போக்கை நிறுத்த சுத்தமான துணியால் காயத்தின் மீது அழுத்தம் கொடுக்கவும்.',
      te: 'రక్తస్రావాన్ని ఆపడానికి గాయంపై శుభ్రమైన గుడ్డతో గట్టిగా నొక్కండి.',
    },
    steps: {
      en: [
        'Apply firm, continuous direct pressure on the wound with a clean cloth/towel.',
        'Maintain pressure for at least 10 to 15 minutes without lifting the cloth to check.',
        'Elevate the bleeding limb above heart level if possible.',
        'If blood soaks through, add another cloth on top — do not remove the first cloth.',
      ],
      mr: [
        'स्वच्छ कापडाने जखमेवर सलग १० ते १५ मिनिटे जोरात दाबून ठेवा.',
        'कापड उचलून जखम पुन्हा पुन्हा पाहू नका, दाब सलग ठेवा.',
        'हात किंवा पायाला जखम असल्यास तो हृदयाच्या पातळीपेक्षा वर उचला.',
        'कापड भिजल्यास त्यावर दुसरे कापड ठेवा — पहिले कापड काढू नका.',
      ],
      hi: [
        'साफ कपड़े या तौलिए से घाव पर लगातार 10-15 मिनट तक सीधा दबाव बनाए रखें।',
        'बार-बार कपड़ा हटाकर घाव न देखें, दबाव निरंतर रखें।',
        'यदि संभव हो तो घायल हाथ या पैर को दिल के स्तर से ऊपर उठाएं।',
        'यदि कपड़ा खून से भीग जाए, तो उसके ऊपर दूसरा कपड़ा रखें — पहला न हटाएं।',
      ],
      kn: [
        'ಗಾಯದ ಮೇಲೆ ಸ್ವಚ್ಛ ಬಟ್ಟೆಯಿಂದ 10-15 ನಿಮಿಷಗಳ ಕಾಲ ನೇರ ಒತ್ತಡ ಹಾಕಿ.',
        'ಬಟ್ಟೆಯನ್ನು ತೆಗೆದು ಗಾಯವನ್ನು ಪದೇ ಪದೇ ನೋಡಬೇಡಿ.',
        'ಸಾಧ್ಯವಾದರೆ ಗಾಯಗೊಂಡ ಅಂಗವನ್ನು ಎತ್ತರದಲ್ಲಿ ಇರಿಸಿ.',
        'ಬಟ್ಟೆ ನೆನೆದರೆ ಅದರ ಮೇಲೆ ಇನ್ನೊಂದು ಬಟ್ಟೆ ಇರಿಸಿ — ಮೊದಲಿನದ್ದನ್ನು ತೆಗೆಯಬೇಡಿ.',
      ],
      ta: [
        'சுத்தமான துணியால் காயத்தின் மீது 10-15 நிமிடங்கள் தொடர்ந்து அழுத்தம் கொடுக்கவும்.',
        'துணியை தூக்கி காயத்தை பார்க்க வேண்டாம்.',
        'சாத்தியமானால் காயமடைந்த கையை அல்லது காலை மேலே தூக்கி வைக்கவும்.',
        'துணி நனைந்தால் அதன் மேல் மற்றொரு துணியை வைக்கவும்.',
      ],
      te: [
        'గాయంపై 10-15 నిమిషాల పాటు శుభ్రమైన గుడ్డతో నిరంతరం ఒత్తిడి ఉంచండి.',
        'గుడ్డను తీసి గాయాన్ని మాటిమాటికీ చూడవద్దు.',
        'గాయపడిన భాగాన్ని వీలైతే పైకి ఎత్తండి.',
        'గుడ్డ తడిసిపోతే దానిపై మరొక గుడ్డను ఉంచండి.',
      ],
    },
    donts: {
      en: [
        'DO NOT remove large embedded objects (knife, glass, stick) — bandage around them.',
        'DO NOT apply mud, turmeric, or unsterilized powders.',
      ],
      mr: [
        'जखमेत रुतलेली वस्तू (काच, चाकू, काठी) स्वतः काढू नका — आजूबाजूला पट्टी बांधा.',
        'जखमेवर माती, हळद किंवा अस्वच्छ पावडर टाकू नका.',
      ],
      hi: [
        'घाव में फंसी बड़ी चीज (चाकू, कांच, लकड़ी) खुद न निकालें — उसके चारों ओर पट्टी बांधें।',
        'घाव पर मिट्टी, राख या हल्दी न लगाएं।',
      ],
      kn: [
        'ಗಾಯದಲ್ಲಿ ಸಿಲುಕಿರುವ ವಸ್ತುಗಳನ್ನು (ಚಾಕು, ಗಾಜು) ತೆಗೆಯಬೇಡಿ.',
        'ಗಾಯದ ಮೇಲೆ ಮಣ್ಣು ಅಥವಾ ಅರಿಶಿನ ಪುಡಿ ಹಾಕಬೇಡಿ.',
      ],
      ta: [
        'காயத்தில் சிக்கியுள்ள பொருட்களை அகற்ற வேண்டாம்.',
        'மண் அல்லது தூள் போட வேண்டாம்.',
      ],
      te: [
        'గాయంలో గుచ్చుకున్న వస్తువులను తీయవద్దు.',
        'గాయంపై మట్టి లేదా పసుపు వేయవద్దు.',
      ],
    },
  },
  {
    id: 'choking',
    icon: Sun,
    color: 'amber',
    title: {
      en: 'Choking / Blocked Airway (श्वास रोखणे / ಗಂಟಲಿನಲ್ಲಿ ಸಿಲುಕುವಿಕೆ)',
      mr: 'घशात घास अडकल्यास / श्वास रोखल्यास प्रथमोपचार',
      hi: 'गले में कुछ अटकने या सांस रुकने पर उपचार',
      kn: 'ಗಂಟಲಿನಲ್ಲಿ ಆಹಾರ ಸಿಲುಕಿದಾಗ ತುರ್ತು ಕ್ರಮ',
      ta: 'தொண்டையில் உணவு அடைத்தால் முதலுதவி',
      te: 'గొంతులో ఏదైనా అడ్డుపడినప్పుడు ప్రథమ చికిత్స',
    },
    subtitle: {
      en: 'If person cannot speak or cough, perform 5 back blows & 5 abdominal thrusts.',
      mr: 'व्यक्ती बोलू शकत नसल्यास किंवा खोकू शकत नसल्यास पाठीवर ५ थापा व पोटावर ५ झटके द्या.',
      hi: 'यदि व्यक्ति बोल या खांस न पाए, तो पीठ पर 5 थपकी और पेट पर 5 झटके दें।',
      kn: 'ವ್ಯಕ್ತಿಗೆ ಮಾತನಾಡಲು ಅಥವಾ ಕೆಮ್ಮಲು ಸಾಧ್ಯವಾಗದಿದ್ದರೆ, ಬೆನ್ನಿಗೆ 5 ತಟ್ಟು ಮತ್ತು ಹೊಟ್ಟೆಗೆ 5 ಒತ್ತಡ ಹಾಕಿ.',
      ta: 'பேசவோ இருமவோ முடியாவிட்டால் முதுகில் 5 தட்டுகள் மற்றும் வயிற்றில் 5 அழுத்தங்கள் கொடுக்கவும்.',
      te: 'మాట్లాడలేకపోతే వెనుక 5 సార్లు తట్టండి మరియు పొట్టపై 5 సార్లు నొక్కండి.',
    },
    steps: {
      en: [
        'Lean the person forward and give 5 firm blows between shoulder blades with heel of hand.',
        'If still choking, stand behind them, wrap arms around waist.',
        'Make a fist just above navel; grasp fist with other hand and give 5 quick upward thrusts.',
        'Repeat alternating 5 back blows and 5 abdominal thrusts.',
      ],
      mr: [
        'व्यक्तीला पुढे झुकवा आणि पाठीच्या मणक्याच्या दोन्ही बाजूला तळहाताने ५ जोरात थापा द्या.',
        'श्वास मोकळा न झाल्यास, पाठीमागून उभे राहून पोटाला दोन्ही हातांनी विळखा घाला.',
        'नाभीच्या थोड्या वर मूठ ठेवा आणि आत व वरच्या दिशेने ५ झटके द्या.',
        'श्वास मोकळा होईपर्यंत ही क्रिया आलटून-पालटून करा.',
      ],
      hi: [
        'व्यक्ति को आगे झुकाएं और पीठ पर दोनों कंधों के बीच हथेली से 5 तेज थपकी दें।',
        'यदि सांस न आए, तो पीछे खड़े होकर दोनों हाथों से पेट को घेरें।',
        'नाभि के थोड़ा ऊपर मुट्ठी रखें और अंदर व ऊपर की ओर 5 झटके दें।',
        'जब तक वस्तु बाहर न निकले, बारी-बारी से यही दोहराएं।',
      ],
      kn: [
        'ವ್ಯಕ್ತಿಯನ್ನು ಮುಂದಕ್ಕೆ ಬಗ್ಗಿಸಿ ಮತ್ತು ಬೆನ್ನಿನ ಮಧ್ಯದಲ್ಲಿ 5 ಬಾರಿ ಗಟ್ಟಿಯಾಗಿ ತಟ್ಟಿ.',
        'ಉಸಿರಾಟ ಸರಿಯಾಗದಿದ್ದರೆ, ಹಿಂದಿನಿಂದ ನಿಂತು ಹೊಟ್ಟೆಯನ್ನು ತಬ್ಬಿಕೊಳ್ಳಿ.',
        'ಹೊಕ್ಕುಳಿನ ಮೇಲ್ಭಾಗದಲ್ಲಿ ಮುಷ್ಟಿ ಇರಿಸಿ ಮತ್ತು ಮೇಲ್ಮುಖವಾಗಿ 5 ಬಾರಿ ಒತ್ತಿ.',
        'ಅಡೆತಡೆ ನಿವಾರಣೆಯಾಗುವವರೆಗೆ ಇದನ್ನು ಪುನರಾವರ್ತಿಸಿ.',
      ],
      ta: [
        'முதுகில் 5 முறை பலமாக தட்டவும்.',
        'பின்புறம் நின்று வயிற்றை இரு கைகளாலும் பிடிக்கவும்.',
        'தொப்புளுக்கு மேல் முஷ்டியை வைத்து மேல்நோக்கி 5 முறை அழுத்தவும்.',
        'தடை நீங்கும் வரை மீண்டும் செய்யவும்.',
      ],
      te: [
        'వ్యక్తిని ముందుకు వంచి వీపుపై 5 సార్లు గట్టిగా తట్టండి.',
        'వెనుక నిలబడి పొట్టను రెండు చేతులతో పట్టుకోండి.',
        'బొడ్డు పైన పిడికిలిని ఉంచి పైకి 5 సార్లు నెట్టండి.',
        'శ్వాస సరిపోయే వరకు దీన్ని పునరావృతం చేయండి.',
      ],
    },
    donts: {
      en: [
        'DO NOT perform abdominal thrusts on pregnant women or infants (use chest thrusts).',
        'DO NOT poke fingers blindly in the throat.',
      ],
      mr: [
        'गरोदर महिला किंवा लहान बाळांच्या पोटावर झटके देऊ नका (छातीवर दाब द्या).',
        'घशात आंधळेपणाने बोटे घालून शोधण्याचा प्रयत्न करू नका.',
      ],
      hi: [
        'गर्भवती महिलाओं या छोटे बच्चों के पेट पर झटके न दें (सीने पर दबाव दें)।',
        'गले में उंगली डालकर अंधाधुंध निकालने की कोशिश न करें।',
      ],
      kn: [
        'ಗರ್ಭಿಣಿಯರು ಅಥವಾ ಶಿಶುಗಳ ಹೊಟ್ಟೆಗೆ ಒತ್ತಡ ಹಾಕಬೇಡಿ.',
        'ಗಂಟಲಿನಲ್ಲಿ ಬೆರಳು ಹಾಕಿ ತೆಗೆಯಲು ಪ್ರಯತ್ನಿಸಬೇಡಿ.',
      ],
      ta: [
        'கர்ப்பிணிகள் அல்லது குழந்தைகளுக்கு வயிற்றில் அழுத்த வேண்டாம்.',
        'தொண்டையில் விரலை விட்டு எடுக்க முயற்சிக்காதீர்கள்.',
      ],
      te: [
        'గర్భిణీలు లేదా పసిపిల్లల పొట్టపై నొక్కవద్దు.',
        'గొంతులో వేళ్లు పెట్టవద్దు.',
      ],
    },
  },
  {
    id: 'labor',
    icon: Baby,
    color: 'purple',
    title: {
      en: 'Emergency Childbirth / Labor (प्रसूती / ತುರ್ತು ಹೆರಿಗೆ)',
      mr: 'तातडीची प्रसूती (Emergency Labor & Childbirth)',
      hi: 'आपातकालीन प्रसव (Emergency Childbirth)',
      kn: 'ತುರ್ತು ಹೆರಿಗೆ ನಿರ್ವಹಣೆ (Emergency Childbirth)',
      ta: 'அவசர பிரசவ உதவி (Emergency Delivery)',
      te: 'అత్యవసర ప్రసవ సహాయం (Emergency Childbirth)',
    },
    subtitle: {
      en: 'Call 108/102 and keep mother warm and supported in clean environment.',
      mr: '१०८ व १०२ ला कॉल करा आणि मातेला स्वच्छ वातावरणात उबदार व शांत ठेवा.',
      hi: '108 और 102 पर कॉल करें, माता को साफ जगह पर शांत और सुरक्षित रखें।',
      kn: '108 ಮತ್ತು 102 ಗೆ ಕರೆ ಮಾಡಿ, ತಾಯಿಯನ್ನು ಸ್ವಚ್ಛ ಜಾಗದಲ್ಲಿ ಬೆಚ್ಚಗಿರಿಸಿ.',
      ta: '108/102 க்கு அழைக்கவும், தாயை சுத்தமான இடத்தில் கதகதப்பாக வைக்கவும்.',
      te: '108/102 కు కాల్ చేయండి, తల్లిని శుభ్రమైన ప్రదేశంలో ఉంచండి.',
    },
    steps: {
      en: [
        'Dial 102 / 108 immediately and alert the village ASHA worker.',
        'Support mother in half-sitting position with knees bent and clean sheets underneath.',
        'As baby crowns, support the head gently — NEVER pull the baby or umbilical cord.',
        'Immediately dry baby with a clean warm cloth and place skin-to-skin on mother chest.',
      ],
      mr: [
        '१०२ किंवा १०८ वर तातडीने कॉल करा आणि गावातील आशा सेविकेला बोलवा.',
        'मातेला स्वच्छ चादरीवर गुडघे वर करून आरामदायक स्थितीत झोपवा.',
        'बाळाचे डोके बाहेर येताना हाताने आधार द्या — बाळाला किंवा नाळेला अजिबात ओढू नका.',
        'बाळ जन्मल्यावर कोरड्या स्वच्छ कापडाने पुसा आणि मातेच्या छातीवर उबदार ठेवा.',
      ],
      hi: [
        '102 या 108 पर तुरंत कॉल करें और गांव की आशा कार्यकर्ता को तुरंत बुलाएं।',
        'माता को साफ चादर पर घुटने मोड़कर आरामदायक स्थिति में लिटाएं।',
        'बच्चे का सिर बाहर आते समय हाथ से सहारा दें — बच्चे या नाल को बिल्कुल न खींचें।',
        'जन्म के तुरंत बाद बच्चे को साफ सूखे कपड़े से पोंछें और मां के सीने पर रखें।',
      ],
      kn: [
        '102 ಅಥವಾ 108 ಗೆ ತಕ್ಷಣ ಕರೆ ಮಾಡಿ ಮತ್ತು ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
        'ತಾಯಿಯನ್ನು ಸ್ವಚ್ಛವಾದ ಬಟ್ಟೆಯ ಮೇಲೆ ಆರಾಮದಾಯಕವಾಗಿ ಮಲಗಿಸಿ.',
        'ಮಗುವಿನ ತಲೆ ಹೊರಬರುವಾಗ ಕೈಯಿಂದ ಆಧಾರ ನೀಡಿ — ಮಗು ಅಥವಾ ಹೊಕ್ಕುಳಬಳ್ಳಿಯನ್ನು ಎಳೆಯಬೇಡಿ.',
        'ಮಗುವನ್ನು ಒಣ ಬಟ್ಟೆಯಿಂದ ಒರೆಸಿ ತಾಯಿಯ ಎದೆಯ ಮೇಲೆ ಬೆಚ್ಚಗಿರಿಸಿ.',
      ],
      ta: [
        '102 அல்லது 108 க்கு உடனே அழைக்கவும் மற்றும் ஆஷா பணியாளரை தொடர்பு கொள்ளவும்.',
        'தாயை சுத்தமான துணியில் படுக்க வைக்கவும்.',
        'குழந்தையின் தலை வரும்போது மெதுவாக தாங்கவும் — குழந்தையை இழுக்க வேண்டாம்.',
        'குழந்தையை உலர்ந்த துணியால் துடைத்து தாயின் மார்பில் வைக்கவும்.',
      ],
      te: [
        '102 లేదా 108 కు వెంటనే కాల్ చేయండి మరియు ఆశా కార్యకర్తకు తెలియజేయండి.',
        'తల్లిని శుభ్రమైన ప్రదేశంలో పడుకోబెట్టండి.',
        'బిడ్డ తల వచ్చేటప్పుడు సున్నితంగా పట్టుకోండి — బిడ్డను లాగవద్దు.',
        'పుట్టిన వెంటనే బిడ్డను పొడి గుడ్డతో తుడిచి తల్లి ఛాతీపై ఉంచండి.',
      ],
    },
    donts: {
      en: [
        'DO NOT pull on the baby or umbilical cord.',
        'DO NOT cut the umbilical cord without sterile medical instruments — wait for ANM/Ambulance.',
      ],
      mr: [
        'बाळाला किंवा नाळेला ताकदीने ओढू नका.',
        'नाळ स्वतः कापू नका — प्रशिक्षित डॉक्टर/आशा ताई येईपर्यंत थांबा.',
      ],
      hi: [
        'बच्चे या गर्भनाल को जोर से न खींचें।',
        'नाल को खुद न काटें — एएनएम या डॉक्टर के आने का इंतजार करें।',
      ],
      kn: [
        'ಮಗು ಅಥವಾ ಹೊಕ್ಕುಳಬಳ್ಳಿಯನ್ನು ಎಳೆಯಬೇಡಿ.',
        'ಹೊಕ್ಕುಳಬಳ್ಳಿಯನ್ನು ಕತ್ತರಿಸಬೇಡಿ — ದಾದಿ/ವೈದ್ಯರು ಬರುವವರೆಗೆ ಕಾಯಿರಿ.',
      ],
      ta: [
        'தொப்புள் கொடியை வெட்ட வேண்டாம் — மருத்துவர் வரும் வரை காத்திருக்கவும்.',
        'குழந்தையை இழுக்க வேண்டாம்.',
      ],
      te: [
        'బిడ్డను లేదా బొడ్డు తాడును లాగవద్దు.',
        'వైద్య సహాయం వచ్చే వరకు బొడ్డు తాడును కోయవద్దు.',
      ],
    },
  },
];

export function EmergencyHelpModal({ onClose }: EmergencyHelpModalProps) {
  const { language } = useLanguage();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  // State
  const [lat, setLat] = useState<number>(DEFAULT_LAT);
  const [lng, setLng] = useState<number>(DEFAULT_LNG);
  const [locationLabel, setLocationLabel] = useState<string>('Locating device GPS…');
  const [gpsReady, setGpsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'sos' | 'firstaid' | 'helplines'>('sos');
  const [expandedProtocol, setExpandedProtocol] = useState<string>('snakebite');
  const [nearestInfo, setNearestInfo] = useState<{ facility: Facility; distanceKm: number }>(() =>
    findNearestFacility(DEFAULT_LAT, DEFAULT_LNG)
  );

  // ASHA & Emergency Contact state with localStorage persistence
  const [ashaPhone, setAshaPhone] = useState<string>('9822012345');
  const [isEditingAsha, setIsEditingAsha] = useState(false);
  const [tempAshaPhone, setTempAshaPhone] = useState('9822012345');
  const [customContactPhone, setCustomContactPhone] = useState<string>('');

  // Audio Siren & Night Strobe State
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [isStrobeOn, setIsStrobeOn] = useState(false);
  const [strobeColor, setStrobeColor] = useState<'red' | 'white'>('red');

  // Web Audio Siren references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenOscRef = useRef<OscillatorNode | null>(null);
  const sirenGainRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1. Instant Location Capture on Mount (No clicking needed)
  useEffect(() => {
    // Load saved ASHA / custom contact from localStorage
    try {
      const savedAsha = localStorage.getItem('swasthya_asha_phone');
      if (savedAsha) {
        setAshaPhone(savedAsha);
        setTempAshaPhone(savedAsha);
      }
      const savedContact = localStorage.getItem('swasthya_family_phone');
      if (savedContact) setCustomContactPhone(savedContact);
    } catch (_) {}

    // Get live GPS position immediately
    if (typeof window !== 'undefined' && navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = pos.coords.latitude;
          const uLng = pos.coords.longitude;
          setLat(uLat);
          setLng(uLng);
          setGpsReady(true);
          setLocationLabel(`GPS Captured (${uLat.toFixed(4)}, ${uLng.toFixed(4)})`);
          setNearestInfo(findNearestFacility(uLat, uLng));
        },
        () => {
          // Fallback location immediately
          setGpsReady(true);
          setLocationLabel('Rural Service Area Centre (Default Coordinates)');
          setNearestInfo(findNearestFacility(DEFAULT_LAT, DEFAULT_LNG));
        },
        { timeout: 4000, maximumAge: 60000, enableHighAccuracy: true }
      );
    } else {
      setGpsReady(true);
      setLocationLabel('Device GPS not available');
    }
  }, []);

  // 2. Audio Rescue Siren Toggle (Continuous tone oscillation)
  const toggleSiren = useCallback(() => {
    if (isSirenOn) {
      // Turn OFF
      clearInterval(sirenIntervalRef.current);
      if (sirenOscRef.current) {
        try {
          sirenOscRef.current.stop();
          sirenOscRef.current.disconnect();
        } catch (_) {}
        sirenOscRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (_) {}
        audioCtxRef.current = null;
      }
      setIsSirenOn(false);
      showToast('Rescue siren stopped');
    } else {
      // Turn ON
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          showToast('Audio siren not supported in this browser');
          return;
        }
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        sirenOscRef.current = osc;
        sirenGainRef.current = gain;

        // Alternate siren frequency between 600Hz and 950Hz
        let high = false;
        sirenIntervalRef.current = setInterval(() => {
          if (sirenOscRef.current && audioCtxRef.current) {
            high = !high;
            sirenOscRef.current.frequency.setTargetAtTime(
              high ? 950 : 600,
              audioCtxRef.current.currentTime,
              0.08
            );
          }
        }, 350);

        setIsSirenOn(true);
        showToast('🔊 Rescue audio siren active! Villagers and searchers can hear your signal.');
      } catch (err) {
        console.warn('Siren audio error:', err);
      }
    }
  }, [isSirenOn]);

  // Clean up siren on unmount
  useEffect(() => {
    return () => {
      clearInterval(sirenIntervalRef.current);
      if (sirenOscRef.current) {
        try {
          sirenOscRef.current.stop();
        } catch (_) {}
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (_) {}
      }
    };
  }, []);

  // 3. Strobe Flasher Effect
  useEffect(() => {
    let interval: any;
    if (isStrobeOn) {
      interval = setInterval(() => {
        setStrobeColor((prev) => (prev === 'red' ? 'white' : 'red'));
      }, 180);
    }
    return () => clearInterval(interval);
  }, [isStrobeOn]);

  // 4. Offline SMS SOS Beacon Generator (Works with 0% Mobile Data)
  const handleSendSmsBeacon = (phoneNumber?: string) => {
    const target = phoneNumber || '108';
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const smsText = `EMERGENCY MEDICAL SOS! Patient needs ambulance urgently.\nGPS Location: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}\nGoogle Maps: ${mapsUrl}\nNearest PHC: ${nearestInfo.facility.name} (${nearestInfo.distanceKm}km)\nSent via SwasthyaSetu Rural Emergency Beacon.`;

    const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const delimiter = isIos ? '&' : '?';
    const smsUrl = `sms:${target}${delimiter}body=${encodeURIComponent(smsText)}`;

    // Trigger native SMS composer
    window.location.href = smsUrl;
    showToast(`Opening offline SMS composer for ${target} with pre-filled GPS coordinates!`);
  };

  // Save ASHA number
  const handleSaveAshaPhone = () => {
    const trimmed = tempAshaPhone.trim();
    if (trimmed) {
      setAshaPhone(trimmed);
      try {
        localStorage.setItem('swasthya_asha_phone', trimmed);
      } catch (_) {}
      setIsEditingAsha(false);
      showToast('Village ASHA Worker contact saved!');
    }
  };

  return (
    <>
      {/* ── FULLSCREEN EMERGENCY RESCUE STROBE (NIGHT BEACON) ── */}
      {isStrobeOn && (
        <div
          onClick={() => setIsStrobeOn(false)}
          className={`fixed inset-0 z-[300] flex flex-col items-center justify-between p-6 cursor-pointer select-none transition-colors duration-75 ${
            strobeColor === 'red' ? 'bg-red-600 text-white' : 'bg-white text-red-600'
          }`}
        >
          <div className="text-center pt-8">
            <span className="text-3xl sm:text-5xl font-black uppercase tracking-wider animate-pulse">
              🚨 RESCUE STROBE ACTIVE 🚨
            </span>
            <p className="text-base sm:text-xl font-bold mt-2">
              Hold this screen high so ambulances & searchers can spot your location in the dark!
            </p>
          </div>

          <div className="w-24 h-24 rounded-full border-4 border-current flex items-center justify-center animate-ping">
            <Flashlight className="w-12 h-12" />
          </div>

          <div className="text-center pb-8">
            <button
              onClick={() => setIsStrobeOn(false)}
              className="px-8 py-4 rounded-2xl bg-black text-white font-black text-lg shadow-2xl hover:scale-105 transition-transform"
            >
              TAP ANYWHERE TO TURN OFF STROBE
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN EMERGENCY MODAL (1ST PAGE DIRECT ACTION) ── */}
      <div className="fixed inset-0 z-[200] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-red-500/40 flex flex-col h-[94vh] max-h-[820px] overflow-hidden">
          
          {/* ── TOP ALERT BANNER ── */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight uppercase leading-tight truncate">
                    108 Emergency Medical SOS
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping shrink-0" />
                </div>
                <p className="text-[11px] text-red-100 font-medium truncate">
                  {getLoc({
                    en: 'Instant Offline SMS Beacon · 108 Direct Call · Village ASHA',
                    mr: 'ऑफलाईन SMS बीकन · १०८ थेट कॉल · आशा सेविका',
                    hi: 'ऑफलाइन SMS बीकन · 108 डायरेक्ट कॉल · आशा कार्यकर्ता',
                    kn: 'ಆಫ್‌ಲೈನ್ SMS ಬೀಕನ್ · 108 ನೇರ ಕರೆ · ಆಶಾ ಕಾರ್ಯಕರ್ತೆ',
                    ta: 'ஆஃப்லைன் SMS பீக்கான் · 108 அவசர அழைப்பு',
                    te: 'ఆఫ్‌లైన్ SMS బీకన్ · 108 ప్రత్యక్ష కాల్',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Rescue Strobe Toggle */}
              <button
                onClick={() => setIsStrobeOn(!isStrobeOn)}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isStrobeOn
                    ? 'bg-yellow-400 text-slate-900 animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title="Night Rescue Flashlight Strobe"
              >
                <Flashlight className="w-4 h-4" />
                <span className="hidden sm:inline">Strobe</span>
              </button>

              {/* Rescue Siren Toggle */}
              <button
                onClick={toggleSiren}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isSirenOn
                    ? 'bg-yellow-300 text-slate-950 animate-bounce'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title="Loud Audio Rescue Siren"
              >
                {isSirenOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">Siren</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── GPS BEACON BAR ── */}
          <div className="px-4 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Navigation className="w-3.5 h-3.5 text-red-600 animate-spin shrink-0" />
              <span className="font-mono text-[11px] truncate">
                Lat: <strong className="text-slate-900 dark:text-white">{lat.toFixed(4)}</strong>, Lng:{' '}
                <strong className="text-slate-900 dark:text-white">{lng.toFixed(4)}</strong>
              </span>
              <span className="text-slate-400 hidden sm:inline">({locationLabel})</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <Building2 className="w-3 h-3" />
              <span>
                {nearestInfo.facility.name} ({nearestInfo.distanceKm} km)
              </span>
            </div>
          </div>

          {/* ── 3 MAIN TABS ── */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-white dark:bg-slate-900 shrink-0">
            <button
              onClick={() => setActiveTab('sos')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
                activeTab === 'sos'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>1-Tap SOS Beacon (Offline SMS)</span>
            </button>

            <button
              onClick={() => setActiveTab('helplines')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
                activeTab === 'helplines'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Village ASHA & Helplines</span>
            </button>

            <button
              onClick={() => setActiveTab('firstaid')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
                activeTab === 'firstaid'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Offline First-Aid Guides</span>
            </button>
          </div>

          {/* ── SCROLLABLE BODY ── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/70 dark:bg-slate-950/50">

            {/* TAB 1: INSTANT SOS (FEATURE 2) ───────────────────────────────── */}
            {activeTab === 'sos' && (
              <div className="space-y-4">
                
                {/* 1. PRIMARY EMERGENCY ACTION: 1-TAP OFFLINE SMS SOS BEACON */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Works with 0% Mobile Data (No Internet Needed)</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-red-100">GPS Auto-Attached</span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black leading-snug">
                      1-Tap Emergency SMS Beacon to 108
                    </h3>
                    <p className="text-xs text-red-100 mt-1 leading-relaxed">
                      Sends an urgent SMS pre-filled with your live GPS location coordinates and Google Maps link directly to the 108 Emergency Ambulance dispatch control room.
                    </p>
                  </div>

                  {/* Big SMS Action Button */}
                  <button
                    onClick={() => handleSendSmsBeacon('108')}
                    className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-red-50 active:scale-98 text-red-700 font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-lg cursor-pointer"
                  >
                    <Send className="w-5 h-5 text-red-600" />
                    <span>DISPATCH OFFLINE SMS BEACON (108)</span>
                  </button>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-red-100">
                    <span>Target: 108 Emergency Control</span>
                    <a
                      href={`https://maps.google.com/?q=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold hover:text-white"
                    >
                      Preview Google Maps Pin ↗
                    </a>
                  </div>
                </div>

                {/* 2. DIRECT VOICE CALL ACTIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Direct Call 108 */}
                  <a
                    href="tel:108"
                    className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border-2 border-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-800 dark:text-red-200 flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Phone className="w-5 h-5 animate-bounce" />
                      </div>
                      <div>
                        <div className="text-xs uppercase font-black text-red-600 dark:text-red-400">
                          Free 24/7 Ambulance
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-white">
                          Dial 108 Direct
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
                  </a>

                  {/* Call Local Village ASHA Worker */}
                  <a
                    href={`tel:${ashaPhone}`}
                    className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs uppercase font-black text-emerald-600 dark:text-emerald-400">
                          Village First Responder
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-white">
                          Call ASHA Worker
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* 3. SEND SMS TO FAMILY / VILLAGE EMERGENCY CONTACT */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Send Offline GPS SMS to Family Member / Sarpanch</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      placeholder="Enter Family / Village Mobile Number (e.g. 9822...)"
                      value={customContactPhone}
                      onChange={(e) => {
                        setCustomContactPhone(e.target.value);
                        try {
                          localStorage.setItem('swasthya_family_phone', e.target.value);
                        } catch (_) {}
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleSendSmsBeacon(customContactPhone || ashaPhone)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send SMS</span>
                    </button>
                  </div>
                </div>

                {/* 4. NEAREST PHC EMERGENCY SPECS */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        Nearest Hospital: {nearestInfo.facility.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {nearestInfo.distanceKm} km away · Anti-Snake Venom (ASV) & Emergency Resuscitation
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${nearestInfo.facility.lat},${nearestInfo.facility.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold shrink-0 hover:opacity-90"
                  >
                    Directions ↗
                  </a>
                </div>

              </div>
            )}

            {/* TAB 2: VILLAGE ASHA & HELPLINES (FEATURE 3) ───────────────────── */}
            {activeTab === 'helplines' && (
              <div className="space-y-3">
                <div className="mb-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Emergency Helplines & Village First Responders
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Direct one-tap dialing for government toll-free emergency lines and your assigned village ASHA worker.
                  </p>
                </div>

                {/* Village ASHA Worker Card (Customizable) */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Assigned Village ASHA Worker (आशा सेविका)
                      </span>
                    </div>
                    <button
                      onClick={() => setIsEditingAsha(!isEditingAsha)}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isEditingAsha ? 'Cancel' : 'Change Number'}</span>
                    </button>
                  </div>

                  {isEditingAsha ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="tel"
                        value={tempAshaPhone}
                        onChange={(e) => setTempAshaPhone(e.target.value)}
                        placeholder="Enter local ASHA mobile number"
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-emerald-300 text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={handleSaveAshaPhone}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          ANM / ASHA Worker (+91 {ashaPhone})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          2 minutes away in village · First aid kit, ORS, IFA, delivery transport
                        </div>
                      </div>
                      <a
                        href={`tel:${ashaPhone}`}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call ASHA</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* 108 Emergency Ambulance */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-black text-sm">
                      108
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        108 National Emergency Medical Ambulance
                      </div>
                      <div className="text-[11px] text-slate-500">
                        24/7 Free ICU/ALS emergency ambulance dispatch
                      </div>
                    </div>
                  </div>
                  <a
                    href="tel:108"
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Dial 108</span>
                  </a>
                </div>

                {/* 102 Maternal & Infant Ambulance */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-black text-sm">
                      102
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        102 Janani Shishu Vahan (Pregnant Mothers & Infants)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Free delivery transport to nearest PHC/Civil Hospital
                      </div>
                    </div>
                  </div>
                  <a
                    href="tel:102"
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Dial 102</span>
                  </a>
                </div>

                {/* 104 Tele-Health Guidance */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-black text-sm">
                      104
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        104 Government Tele-Health Advice Helpline
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Doctor consultations, poison guidance, mental health
                      </div>
                    </div>
                  </div>
                  <a
                    href="tel:104"
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Dial 104</span>
                  </a>
                </div>

                {/* 112 National Disaster & Police */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-black text-sm">
                      112
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        112 Emergency Disaster & Police SOS
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Search and rescue, flood, accident, fire, disaster relief
                      </div>
                    </div>
                  </div>
                  <a
                    href="tel:112"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Dial 112</span>
                  </a>
                </div>

              </div>
            )}

            {/* TAB 3: OFFLINE VISUAL FIRST-AID PROTOCOLS (FEATURE 4) ───────── */}
            {activeTab === 'firstaid' && (
              <div className="space-y-3">
                <div className="mb-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Emergency First-Aid Protocols (100% Offline)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Crucial life-saving actions to perform while the ambulance is on the way. Available without internet.
                  </p>
                </div>

                {FIRST_AID_PROTOCOLS.map((protocol) => {
                  const isExpanded = expandedProtocol === protocol.id;
                  const Icon = protocol.icon;

                  return (
                    <div
                      key={protocol.id}
                      className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                    >
                      <button
                        onClick={() =>
                          setExpandedProtocol(isExpanded ? '' : protocol.id)
                        }
                        className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            protocol.id === 'snakebite'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : protocol.id === 'cpr'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                              {getText(protocol.title, language)}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {getText(protocol.subtitle, language)}
                            </p>
                          </div>
                        </div>

                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs bg-slate-50/50 dark:bg-slate-900/50">
                          {/* DOS */}
                          <div className="space-y-1.5">
                            <div className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Step-by-Step Immediate Actions (काय करावे):</span>
                            </div>
                            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                              {getText(protocol.steps, language).map((st: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="font-black text-emerald-600 shrink-0">{idx + 1}.</span>
                                  <span>{st}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* DONTS */}
                          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-1">
                            <div className="font-bold text-red-800 dark:text-red-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Critical Warning Signs & DON'Ts (काय करू नये):</span>
                            </div>
                            <ul className="space-y-0.5 text-red-700 dark:text-red-300 text-[11px]">
                              {getText(protocol.donts, language).map((dont: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-red-500 font-bold shrink-0">✕</span>
                                  <span>{dont}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ── FOOTER ── */}
          <div className="px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-red-600" />
              <span>National Health Mission 108 Emergency Protocol</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Toast */}
          {toastMsg && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[250] animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-2xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
                <span>{toastMsg}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function getText(obj: any, lang: Language): any {
  if (!obj) return '';
  return obj[lang] || obj.en;
}
