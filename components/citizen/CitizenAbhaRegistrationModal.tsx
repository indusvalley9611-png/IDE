'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode';
import { useLanguage } from '@/context/LanguageContext';
import { useSync } from '@/context/SyncContext';
import { generateRandomAbhaId } from '@/lib/idbStorage';
import { Patient } from '@/lib/types';
import { Language } from '@/lib/translations';
import {
  X,
  ShieldCheck,
  Printer,
  CheckCircle2,
  User,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface CitizenAbhaRegistrationModalProps {
  onClose: () => void;
}

export function CitizenAbhaRegistrationModal({ onClose }: CitizenAbhaRegistrationModalProps) {
  const { language } = useLanguage();
  const { addPatient, patients } = useSync();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  const t = {
    modalTitle: getLoc({
      en: 'Create ABHA Health ID',
      kn: 'ಆಭಾ ಆರೋಗ್ಯ ಐಡಿ ರಚಿಸಿ',
      hi: 'आभा स्वास्थ्य आईडी बनाएं',
      ta: 'ஆபா சுகாதார ஐடியை உருவாக்கு',
      te: 'ఆభా ఆరోగ్య ఐడీని సృష్టించండి',
      mr: 'आभा आरोग्य ओळख तयार करा',
    }),
    cardTitle: getLoc({
      en: 'Official ABDM Health Card',
      kn: 'ಅಧಿಕೃತ ಎಬಿಡಿಎಂ ಆರೋಗ್ಯ ಕಾರ್ಡ್',
      hi: 'आधिकारिक एबीडीएम स्वास्थ्य कार्ड',
      ta: 'அதிகாரப்பூர்வ ஏபிடிஎம் சுகாதார அட்டை',
      te: 'అధికారిక ఏబీడీఎం ఆరోగ్య కార్డు',
      mr: 'अधिकृत एबीडीएम आरोग्य कार्ड',
    }),
    subTitle: getLoc({
      en: 'Ayushman Bharat Digital Mission · National Health Authority',
      kn: 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಡಿಜಿಟಲ್ ಮಿಷನ್ · ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಪ್ರಾಧಿಕಾರ',
      hi: 'आयुष्मान भारत डिजिटल मिशन · राष्ट्रीय स्वास्थ्य प्राधिकरण',
      ta: 'ஆயுஷ்மான் பாரத் டிஜிட்டல் மிஷன் · தேசிய சுகாதார ஆணையம்',
      te: 'ఆయుష్మాన్ భారత్ డిజిటల్ మిషన్ · జాతీయ ఆరోగ్య అథారిటీ',
      mr: 'आयुष्मान भारत डिजिटल मिशन · राष्ट्रीय आरोग्य प्राधिकरण',
    }),
    bannerNotice: getLoc({
      en: 'Enter your basic information below to instantly create your 14-digit official government ABHA ID. Works offline and syncs automatically with the health gateway.',
      kn: 'ನಿಮ್ಮ 14-ಅಂಕಿಯ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆಭಾ ಐಡಿಯನ್ನು ತಕ್ಷಣ ರಚಿಸಲು ಮೂಲ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ. ಇದು ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
      hi: 'अपनी 14-अंकीय आधिकारिक सरकारी आभा आईडी तुरंत बनाने के लिए नीचे विवरण दर्ज करें। यह ऑफलाइन भी काम करता है।',
      ta: 'உங்கள் 14 இலக்க அதிகாரப்பூர்வ அரசு ஆபா ஐடியை உடனடியாக உருவாக்க கீழே உள்ள தகவலை உள்ளிடவும். ஆஃப்லைனிலும் செயல்படும்.',
      te: 'మీ 14-అంకెల అధికారిక ప్రభుత్వ ఆభా ఐడీని వెంటనే సృష్టించడానికి వివరాలు నమోదు చేయండి. ఆఫ్‌లైన్‌లోనూ పనిచేస్తుంది.',
      mr: 'तुमची १४-अंकी अधिकृत शासकीय आभा ओळख त्वरित तयार करण्यासाठी खालील माहिती भरा.',
    }),
    fullNameLabel: getLoc({
      en: 'Full Name *',
      kn: 'ಪೂರ್ಣ ಹೆಸರು *',
      hi: 'पूरा नाम *',
      ta: 'முழு பெயர் *',
      te: 'పూర్తి పేరు *',
      mr: 'पूर्ण नाव *',
    }),
    fullNamePlaceholder: getLoc({
      en: 'Enter your full name',
      kn: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      hi: 'अपना पूरा नाम दर्ज करें',
      ta: 'உங்கள் முழு பெயரை உள்ளிடவும்',
      te: 'మీ పూర్తి పేరును నమోదు చేయండి',
      mr: 'आपले पूर्ण नाव प्रविष्ट करा',
    }),
    ageLabel: getLoc({
      en: 'Age *',
      kn: 'ವಯಸ್ಸು *',
      hi: 'उम्र *',
      ta: 'வயது *',
      te: 'వయస్సు *',
      mr: 'वय *',
    }),
    genderLabel: getLoc({
      en: 'Gender *',
      kn: 'ಲಿಂಗ *',
      hi: 'लिंग *',
      ta: 'பாலினம் *',
      te: 'లింగం *',
      mr: 'लिंग *',
    }),
    male: getLoc({
      en: 'Male',
      kn: 'ಪುರುಷ',
      hi: 'पुरुष',
      ta: 'ஆண்',
      te: 'పురుషుడు',
      mr: 'पुरुष',
    }),
    female: getLoc({
      en: 'Female',
      kn: 'ಮಹಿಳೆ',
      hi: 'महिला',
      ta: 'பெண்',
      te: 'స్త్రీ',
      mr: 'स्त्री',
    }),
    other: getLoc({
      en: 'Other',
      kn: 'ಇತರೆ',
      hi: 'अन्य',
      ta: 'மற்றவை',
      te: 'ఇతర',
      mr: 'इतर',
    }),
    mobileLabel: getLoc({
      en: 'Mobile Number *',
      kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *',
      hi: 'मोबाइल नंबर *',
      ta: 'கைபேசி எண் *',
      te: 'మొబైల్ సంఖ్య *',
      mr: 'मोबाईल क्रमांक *',
    }),
    mobilePlaceholder: getLoc({
      en: '10-digit mobile number',
      kn: '10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      hi: '10-अंकीय मोबाइल नंबर',
      ta: '10 இலக்க கைபேசி எண்',
      te: '10 అంకెల మొబైల్ సంఖ్య',
      mr: '१०-अंकी मोबाईल क्रमांक',
    }),
    aadhaarLabel: getLoc({
      en: 'Aadhaar Number (Last 4 digits)',
      kn: 'ಆಧಾರ್ ಸಂಖ್ಯೆ (ಕೊನೆಯ 4 ಅಂಕಿಗಳು)',
      hi: 'आधार संख्या (अंतिम 4 अंक)',
      ta: 'ஆதார் எண் (கடைசி 4 இலக்கங்கள்)',
      te: 'ఆధార్ సంఖ్య (చివరి 4 అంకెలు)',
      mr: 'आधार क्रमांक (शेवटचे ४ अंक)',
    }),
    aadhaarNotice: getLoc({
      en: 'Simulated instant e-KYC verification',
      kn: 'ತ್ವರಿತ ಇ-ಕೆವೈಸಿ ಪರಿಶೀಲನೆ',
      hi: 'त्वरित ई-केवाईसी सत्यापन',
      ta: 'உடனடி இ-கேஒய்சி சரிபார்ப்பு',
      te: 'తక్షణ ఇ-కేవైసీ ధృవీకరణ',
      mr: 'त्वरित ई-केवायसी पडताळणी',
    }),
    villageLabel: getLoc({
      en: 'Village / Ward',
      kn: 'ಗ್ರಾಮ / ವಾರ್ಡ್',
      hi: 'गाँव / वार्ड',
      ta: 'கிராமம் / வார்டு',
      te: 'గ్రామం / వార్డు',
      mr: 'गाव / वॉर्ड',
    }),
    districtLabel: getLoc({
      en: 'District',
      kn: 'ಜಿಲ್ಲೆ',
      hi: 'जिला',
      ta: 'மாவட்டம்',
      te: 'జిల్లా',
      mr: 'जिल्हा',
    }),
    submitBtn: getLoc({
      en: 'Generate Official ABHA Health ID',
      kn: 'ಅಧಿಕೃತ ಆಭಾ ಆರೋಗ್ಯ ಐಡಿ ರಚಿಸಿ',
      hi: 'आधिकारिक आभा स्वास्थ्य आईडी बनाएं',
      ta: 'அதிகாரப்பூர்வ ஆபா சுகாதார ஐடியை உருவாக்கு',
      te: 'అధికారిక ఆభా ఆరోగ్య ఐడీని సృష్టించండి',
      mr: 'अधिकृत आभा आरोग्य ओळख तयार करा',
    }),
    submittingBtn: getLoc({
      en: 'Generating ABHA ID...',
      kn: 'ಆಭಾ ಐಡಿ ರಚಿಸಲಾಗುತ್ತಿದೆ...',
      hi: 'आभा आईडी बनाई जा रही है...',
      ta: 'ஆபா ஐடி உருவாக்கப்படுகிறது...',
      te: 'ఆభా ఐడీ సృష్టించబడుతోంది...',
      mr: 'आभा ओळख तयार होत आहे...',
    }),
    successTitle: getLoc({
      en: 'ABHA ID Created Successfully!',
      kn: 'ಆಭಾ ಐಡಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!',
      hi: 'आभा आईडी सफलतापूर्वक बनाई गई!',
      ta: 'ஆபா ஐடி வெற்றிகரமாக உருவாக்கப்பட்டது!',
      te: 'ఆభా ఐడీ విజయవంతంగా సృష్టించబడింది!',
      mr: 'आभा ओळख यशस्वीरीत्या तयार झाली!',
    }),
    successSubtitle: getLoc({
      en: 'Your digital health card is generated and linked to the ABDM registry.',
      kn: 'ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ರಚನೆಯಾಗಿದ್ದು, ಎಬಿಡಿಎಂ ನೋಂದಣಿಗೆ ಲಿಂಕ್ ಮಾಡಲಾಗಿದೆ.',
      hi: 'आपका डिजिटल स्वास्थ्य कार्ड बन गया है और एबीडीएम से जुड़ गया है।',
      ta: 'உங்கள் டிஜிட்டல் சுகாதார அட்டை உருவாக்கப்பட்டு இணைக்கப்பட்டுள்ளது.',
      te: 'మీ డిజిటల్ ఆరోగ్య కార్డు రూపొందించబడింది మరియు అనుసంధానించబడింది.',
      mr: 'आपले डिजिटल आरोग्य कार्ड तयार झाले असून एबीडीएम नोंदणीशी जोडले गेले आहे.',
    }),
    printBtn: getLoc({
      en: 'Print / Save Card',
      kn: 'ಕಾರ್ಡ್ ಮುದ್ರಿಸಿ / ಉಳಿಸಿ',
      hi: 'कार्ड प्रिंट / सेव करें',
      ta: 'அட்டையை அச்சிடு / சேமி',
      te: 'కార్డు ప్రింట్ / సేవ్ చేయండి',
      mr: 'कार्ड मुद्रित / जतन करा',
    }),
    newBtn: getLoc({
      en: 'Register Another',
      kn: 'ಮತ್ತೊಂದು ನೋಂದಣಿ',
      hi: 'अन्य पंजीकरण',
      ta: 'மற்றொரு பதிவு',
      te: 'మరొక నమోదు',
      mr: 'दुसरी नोंदणी',
    }),
    duplicateFoundNotice: getLoc({
      en: 'Patient is already registered with this mobile number. You cannot register again.',
      kn: 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ರೋಗಿಯು ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದ್ದಾರೆ. ಮತ್ತೊಮ್ಮೆ ನೋಂದಾಯಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
      hi: 'इस मोबाइल नंबर के साथ मरीज पहले से पंजीकृत है। आप दोबारा पंजीकरण नहीं कर सकते।',
      ta: 'இந்த கைபேசி எண்ணுடன் நோயாளி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளார். மீண்டும் பதிவு செய்ய முடியாது.',
      te: 'ఈ మొబైల్ సంఖ్యతో రోగి ఇప్పటికే నమోదు చేయబడ్డారు. మళ్లీ నమోదు చేయలేరు.',
      mr: 'या मोबाईल क्रमांकावर रुग्ण आधीच नोंदणीकृत आहे. पुन्हा नोंदणी करता येणार नाही.',
    }),
    viewExistingCardBtn: getLoc({
      en: 'View & Download Existing ABHA Card',
      kn: 'ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಆಭಾ ಕಾರ್ಡ್ ವೀಕ್ಷಿಸಿ ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      hi: 'मौजूदा आभा कार्ड देखें और डाउनलोड करें',
      ta: 'ஏற்கனவே உள்ள ஆபா அட்டையைக் காண்க மற்றும் பதிவிறக்குக',
      te: 'ఇప్పటికే ఉన్న ఆభా కార్డును చూడండి మరియు డౌన్‌లోడ్ చేయండి',
      mr: 'विद्यमान आभा कार्ड पहा आणि डाउनलोड करा',
    }),
    alreadyRegisteredBadge: getLoc({
      en: 'Verified Existing ABHA Registration',
      kn: 'ಪರಿಶೀಲಿಸಿದ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಆಭಾ ನೋಂದಣಿ',
      hi: 'सत्यापित मौजूदा आभा पंजीकरण',
      ta: 'சரிபார்க்கப்பட்ட ஏற்கனவே உள்ள ஆபா பதிவு',
      te: 'ధృవీకరించబడిన ఇప్పటికే ఉన్న ఆభా నమోదు',
      mr: 'पडताळलेली विद्यमान आभा नोंदणी',
    }),
    alreadyRegisteredSubtitle: getLoc({
      en: 'This citizen is already registered in the ABDM registry. Your existing official health card has been retrieved.',
      kn: 'ಈ ನಾಗರಿಕರು ಈಗಾಗಲೇ ಎಬಿಡಿಎಂ ನೋಂದಣಿಯಲ್ಲಿ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದ್ದಾರೆ. ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಅಧಿಕೃತ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಪಡೆಯಲಾಗಿದೆ.',
      hi: 'यह नागरिक पहले से एबीडीएम रजिस्ट्री में पंजीकृत हैं। आपका मौजूदा आधिकारिक स्वास्थ्य कार्ड प्राप्त कर लिया गया है।',
      ta: 'இந்த குடிமகன் ஏற்கனவே ஏபிடிஎம் பதிவேட்டில் பதிவு செய்யப்பட்டுள்ளார். உங்களின் அதிகாரப்பூர்வ அட்டை பெறப்பட்டது.',
      te: 'ఈ పౌరుడు ఇప్పటికే ఏబీడీఎం రిజిస్ట్రీలో నమోదు చేయబడ్డారు. మీ అధికారిక ఆరోగ్య కార్డు పొందబడింది.',
      mr: 'हे नागरिक आधीच एबीडीएम नोंदणीमध्ये नोंदणीकृत आहेत. आपले विद्यमान अधिकृत आरोग्य कार्ड मिळवले आहे.',
    }),
    errorName: getLoc({
      en: 'Please enter your full name',
      kn: 'ದಯವಿಟ್ಟು ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      hi: 'कृपया अपना पूरा नाम दर्ज करें',
      ta: 'தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும்',
      te: 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి',
      mr: 'कृपया आपले पूर्ण नाव प्रविष्ट करा',
    }),
    errorPhone: getLoc({
      en: 'Please enter a valid 10-digit mobile number',
      kn: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
      hi: 'कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें',
      ta: 'தயவுசெய்து சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்',
      te: 'దయచేసి సరైన 10 అంకెల మొబైల్ సంఖ్యను నమోదు చేయండి',
      mr: 'कृपया वैध १०-अंकी मोबाईल क्रमांक प्रविष्ट करा',
    }),
    cardPhoto: getLoc({
      en: 'Photo',
      kn: 'ಭಾವಚಿತ್ರ',
      hi: 'फोटो',
      ta: 'புகைப்படம்',
      te: 'ఫోటో',
      mr: 'फोटो',
    }),
    cardName: getLoc({
      en: 'Name',
      kn: 'ಹೆಸರು',
      hi: 'नाम',
      ta: 'பெயர்',
      te: 'పేరు',
      mr: 'नाव',
    }),
    cardGender: getLoc({
      en: 'Gender',
      kn: 'ಲಿಂಗ',
      hi: 'लिंग',
      ta: 'பாலினம்',
      te: 'లింగం',
      mr: 'लिंग',
    }),
    cardAge: getLoc({
      en: 'Age',
      kn: 'ವಯಸ್ಸು',
      hi: 'उम्र',
      ta: 'வயது',
      te: 'వయస్సు',
      mr: 'वय',
    }),
    cardAbhaNumber: getLoc({
      en: 'ABHA Number',
      kn: 'ಆಭಾ ಸಂಖ್ಯೆ',
      hi: 'आभा संख्या',
      ta: 'ஆபா எண்',
      te: 'ఆభా సంఖ్య',
      mr: 'आभा क्रमांक',
    }),
    cardAbhaAddress: getLoc({
      en: 'ABHA Address',
      kn: 'ಆಭಾ ವಿಳಾಸ',
      hi: 'आभा पता',
      ta: 'ஆபா முகவரி',
      te: 'ఆభా చిరునామా',
      mr: 'आभा पत्ता',
    }),
    cardScanVerify: getLoc({
      en: 'SCAN & VERIFY',
      kn: 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪರಿಶೀಲಿಸಿ',
      hi: 'स्कैन और सत्यापन',
      ta: 'ஸ்கேன் செய்து சரிபார்க்கவும்',
      te: 'స్కాన్ చేసి ధృవీకరించండి',
      mr: 'स्कॅन करा व पडताळा',
    }),
    cardComplianceFooter: getLoc({
      en: 'National Health Identity · 100% ABDM Compliant · FHIR R4',
      kn: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಗುರುತು · 100% ಎಬಿಡಿಎಂ ಅನುರೂಪ · FHIR R4',
      hi: 'राष्ट्रीय स्वास्थ्य पहचान · 100% एबीडीएम अनुरूप · FHIR R4',
      ta: 'தேசிய சுகாதார அடையாளம் · 100% ஏபிடிஎம் இணக்கமானது · FHIR R4',
      te: 'జాతీయ ఆరోగ్య గుర్తింపు · 100% ఏబీడీఎం ప్రమాణాలు · FHIR R4',
      mr: 'राष्ट्रीय आरोग्य ओळख · १००% एबीडीएम मानकांनुसार · FHIR R4',
    }),
  };

  // Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [village, setVillage] = useState('Indiranagar');
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [step, setStep] = useState<'FORM' | 'GENERATED'>('FORM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isExistingRecord, setIsExistingRecord] = useState(false);

  // Generated or Retrieved ABHA details
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Real-time duplicate check across registry
  const cleanPhone = phone.trim();
  const existingPatient = cleanPhone.length >= 10
    ? patients.find((p) => p.phone && p.phone.trim() === cleanPhone) ||
      (fullName.trim().length >= 3 && patients.find((p) => p.fullName.trim().toLowerCase() === fullName.trim().toLowerCase() && p.phone && p.phone.trim() === cleanPhone))
    : null;

  const handleLoadExistingCard = async (patientToLoad: Patient) => {
    setIsSubmitting(true);
    setCreatedPatient(patientToLoad);
    setIsExistingRecord(true);
    setErrorMsg('');
    try {
      const qrPayload = JSON.stringify({
        abha: patientToLoad.abhaId,
        address: patientToLoad.abhaAddress || `${patientToLoad.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@abdm`,
        name: patientToLoad.fullName,
        gender: patientToLoad.gender,
        district: patientToLoad.district,
        abdmVer: 'FHIR-R4-2026',
      });
      const url = await QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
    setStep('GENERATED');
  };

  const handleGenerateAbha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg(t.errorName);
      return;
    }
    if (!phone || phone.length < 10) {
      setErrorMsg(t.errorPhone);
      return;
    }

    // If already registered, load their existing official ABHA card without duplicating record
    if (existingPatient) {
      await handleLoadExistingCard(existingPatient);
      return;
    }

    setIsSubmitting(true);
    setIsExistingRecord(false);
    setErrorMsg('');

    // Generate unique 14-digit ABHA ID & address
    const abhaNumber = generateRandomAbhaId();
    const sanitizedName = fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const abhaAddress = `${sanitizedName || 'citizen'}${Math.floor(100 + Math.random() * 900)}@abdm`;

    const newPatient: Patient = {
      id: `pat-citizen-${Date.now()}`,
      abhaId: abhaNumber,
      abhaAddress,
      fullName: fullName.trim(),
      age: parseInt(age) || 28,
      gender,
      phone: phone.trim(),
      village: village.trim() || 'Indiranagar',
      taluka: 'Bengaluru East',
      district: district.trim() || 'Bengaluru Urban',
      bloodGroup: 'O+',
      isPregnant: false,
      isHighRiskPregnancy: false,
      emergencyContact: {
        name: fullName.trim(),
        relation: 'Self',
        phone: phone.trim(),
      },
      registrationFacilityId: 'fac-phc-indiranagar',
      registrationFacilityName: 'Indiranagar General Hospital & PHC',
      registrationLevel: 'field',
      registeredByUserId: 'rural-citizen-self',
      registeredByUserName: 'Rural Citizen Self-Registration',
      encounters: [],
    };

    // Save into shared persistent store & sync queue
    addPatient(newPatient);
    setCreatedPatient(newPatient);

    // Generate live QR code containing official ABHA payload
    try {
      const qrPayload = JSON.stringify({
        abha: abhaNumber,
        address: abhaAddress,
        name: newPatient.fullName,
        gender: newPatient.gender,
        district: newPatient.district,
        abdmVer: 'FHIR-R4-2026',
      });
      const url = await QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }

    setIsSubmitting(false);
    setStep('GENERATED');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 print-hide">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight text-white">
                {step === 'FORM' ? t.modalTitle : t.cardTitle}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {t.subTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {step === 'FORM' ? (
            <form onSubmit={handleGenerateAbha} className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                  {t.bannerNotice}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullNameLabel}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={t.fullNamePlaceholder}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Age & Gender Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.ageLabel}
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      required
                      placeholder="32"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.genderLabel}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Male">{t.male}</option>
                    <option value="Female">{t.female}</option>
                    <option value="Other">{t.other}</option>
                  </select>
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.mobileLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder={t.mobilePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Live duplicate detection warning */}
                {existingPatient && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-xs text-amber-900 dark:text-amber-200">
                        <p className="font-bold">{t.duplicateFoundNotice}</p>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300">
                          Registered Citizen: <strong>{existingPatient.fullName}</strong> · ABHA: <span className="font-mono font-bold">{existingPatient.abhaId}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadExistingCard(existingPatient)}
                      className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.viewExistingCardBtn}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Aadhaar Last 4 Digits */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.aadhaarLabel}
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="XXXX"
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {t.aadhaarNotice}
                </span>
              </div>

              {/* Village & District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.villageLabel}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Indiranagar"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.districtLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="Bengaluru Urban"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type={existingPatient ? 'button' : 'submit'}
                onClick={existingPatient ? () => handleLoadExistingCard(existingPatient) : undefined}
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-2 ${
                  existingPatient
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-emerald-600/30'
                }`}
              >
                {isSubmitting ? (
                  <span>{t.submittingBtn}</span>
                ) : existingPatient ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.viewExistingCardBtn}</span>
                  </>
                ) : (
                  <>
                    <span>{t.submitBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Generated ABHA Card Display */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                  isExistingRecord
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {isExistingRecord ? t.alreadyRegisteredBadge : t.successTitle}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isExistingRecord ? t.alreadyRegisteredSubtitle : t.successSubtitle}
                </p>
              </div>

              {/* The Visual ABHA Card */}
              <div className="w-full max-w-[380px] mx-auto bg-white rounded-2xl shadow-xl border-2 border-slate-300 overflow-hidden relative print-section">
                {/* Tricolor Header */}
                <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-green-600 border-b border-slate-200" />

                {/* ABDM Header Strip */}
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="text-[9px] font-black text-slate-800 uppercase tracking-wider">
                      AYUSHMAN BHARAT DIGITAL MISSION
                    </div>
                    <div className="text-[8px] text-slate-500 font-medium">
                      National Health Authority · Government of India
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-blue-900 tracking-tight">ABHA</span>
                    <div className="text-[7px] text-emerald-700 font-bold uppercase">Digital Health Card</div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3.5 flex items-start gap-3 bg-white">
                  {/* Photo Silhouette */}
                  <div className="w-16 h-20 bg-slate-100 rounded-lg border border-slate-300 flex flex-col items-center justify-center text-slate-600 shrink-0">
                    <span className="font-black text-xl text-slate-700">
                      {createdPatient?.fullName.charAt(0) || 'U'}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold mt-1 uppercase">
                      {t.cardPhoto}
                    </span>
                  </div>

                  {/* Citizen Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">
                        {t.cardName}
                      </div>
                      <div className="text-xs font-black text-slate-900 truncate">
                        {createdPatient?.fullName}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div>
                        <span className="text-slate-400 font-bold">{t.cardGender}: </span>
                        <span className="font-bold text-slate-800">
                          {createdPatient?.gender === 'Male'
                            ? t.male
                            : createdPatient?.gender === 'Female'
                            ? t.female
                            : t.other}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">{t.cardAge}: </span>
                        <span className="font-bold text-slate-800">{createdPatient?.age}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">
                        {t.cardAbhaNumber}
                      </div>
                      <div className="text-xs font-mono font-black text-blue-900 tracking-wide">
                        {createdPatient?.abhaId}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">
                        {t.cardAbhaAddress}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-800 truncate font-semibold">
                        {createdPatient?.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@abdm
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div className="shrink-0 flex flex-col items-center">
                      <img src={qrCodeUrl} alt="ABHA QR Code" className="w-16 h-16 rounded border border-slate-200" />
                      <span className="text-[7px] text-slate-400 font-bold mt-0.5">
                        {t.cardScanVerify}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Govt Strip */}
                <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 text-center">
                  <span className="text-[8px] font-bold text-slate-600">
                    {t.cardComplianceFooter}
                  </span>
                </div>
              </div>

              {/* Actions: Print / Download & Reset */}
              <div className="flex items-center gap-2 pt-2 print-hide">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.printBtn}</span>
                </button>
                <button
                  onClick={() => {
                    setStep('FORM');
                    setIsExistingRecord(false);
                    setCreatedPatient(null);
                    setPhone('');
                    setFullName('');
                    setAge('');
                    setAadhaarLast4('');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.newBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
