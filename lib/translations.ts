export type Language = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'mr';

export interface LanguageInfo {
  code: Language;
  label: string;
  native: string;
  short: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', native: 'English', short: 'EN' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', short: 'ಕನ್ನ' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', short: 'हिन्' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', short: 'தமி' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', short: 'తెలు' },
];

export const translations = {
  en: {
    appTitle: 'SwasthyaSetu',
    appSubtitle: 'Integrated Public Healthcare & Referral Management System',
    govtHeader: 'Public Health Department, Government Health Platform',
    abdmConform: 'ABDM & FHIR R4 Compliant',
    
    // Roles
    role_asha: 'ASHA Worker / Sub-Centre',
    role_phc: 'PHC Medical Officer',
    role_specialist: 'District Specialist / Casualty',
    role_admin: 'District Health Authority / Medicals',
    
    // Nav & Common
    dashboard: 'Dashboard',
    patients: 'Patient Registry',
    referrals: 'Triage & Referrals',
    resources: 'Beds & Resources',
    inventory: 'Emergency Stock',
    outbreakMap: 'Disease Outbreaks',
    searchPlaceholder: 'Search by 14-digit ABHA ID, Phone or Name...',
    online: 'Online',
    offline: 'Offline Mode',
    synced: 'All Changes Synced',
    pendingSync: 'Queued Offline',
    syncNow: 'Sync Now',
    simulateOffline: 'Simulate Offline',
    simulateOnline: 'Restore Online',
    switchRole: 'Switch Role',
    
    // Triage
    triageRed: 'CRITICAL (Priority 1)',
    triageYellow: 'URGENT (Priority 2)',
    triageGreen: 'ROUTINE (Priority 3)',
    triageScore: 'Triage Score',
    recommendedFacility: 'Recommended Care Level',
    
    // Vitals
    systolicBp: 'Systolic BP',
    diastolicBp: 'Diastolic BP',
    heartRate: 'Pulse Rate',
    spO2: 'SpO2 Oxygen',
    respiratoryRate: 'Respiration Rate',
    temperature: 'Body Temperature',
    bloodGlucose: 'Blood Glucose',
    hemoglobin: 'Hemoglobin',
    consciousLevel: 'Consciousness (AVPU)',
    
    // Patient Form
    newPatient: 'Register New Patient',
    fullName: 'Full Name',
    age: 'Age',
    gender: 'Gender',
    phone: 'Phone Number',
    village: 'Village / Wada',
    taluka: 'Taluka',
    district: 'District',
    bloodGroup: 'Blood Group',
    isPregnant: 'Is Patient Pregnant?',
    gestationalWeeks: 'Gestational Weeks',
    highRiskFlag: 'High Risk Pregnancy (HRP)',
    saveOffline: 'Save Record (Offline Ready)',
    
    // Referral
    newReferral: 'Generate Digital Referral',
    referringFacility: 'Referring Facility',
    targetFacility: 'Target Destination Hospital',
    specialtyRequired: 'Specialty Required',
    reasonForReferral: 'Clinical Rationale & Chief Complaints',
    generateQrToken: 'Generate Digital Referral Token',
    viewQrSlip: 'View / Print Referral Slip',
    tokenCode: 'Referral Token',
    bypassDeskMsg: 'Scan at Casualty Desk to Bypass Registration Line',
    ambulanceRequired: '108 ALS Ambulance Dispatched',
    
    // Beds & Resources
    bedMatrix: 'Live Hospital Bed Matrix',
    totalBeds: 'Total Beds',
    occupiedBeds: 'Occupied',
    vacantBeds: 'Available',
    icuBeds: 'ICU Beds',
    ventilatorBeds: 'Ventilators',
    oxygenBeds: 'Oxygen Beds',
    
    // Inventory
    emergencyStock: 'Critical Lifesaving Medicines',
    drugName: 'Medicine / Gas',
    currentStock: 'Current Stock',
    bufferStock: 'Buffer Level',
    requestStock: 'Request Inter-Facility Transfer',
    lowStockAlert: 'Low Stock Alert (<25% Buffer)',
    
    // Status
    statusPending: 'Incoming / En Route',
    statusAccepted: 'Accepted by Specialist',
    statusAdmitted: 'Admitted to Ward/ICU',
  },

  kn: {
    appTitle: 'ಸ್ವಾಸ್ಥ್ಯಸೇತು',
    appSubtitle: 'ಸಮಗ್ರ ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಮತ್ತು ರೆಫರಲ್ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ',
    govtHeader: 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಇಲಾಖೆ, ಸರ್ಕಾರಿ ಆರೋಗ್ಯ ವೇದಿಕೆ',
    abdmConform: 'ABDM ಮತ್ತು FHIR R4 ಅನುಸರಣೆ',
    
    // Roles
    role_asha: 'ಆಶಾ ಕಾರ್ಯಕರ್ತೆ / ಉಪಕೇಂದ್ರ',
    role_phc: 'ಪಿಎಚ್‌ಸಿ ವೈದ್ಯಾಧಿಕಾರಿ',
    role_specialist: 'ಜಿಲ್ಲಾ ತಜ್ಞ / ತುರ್ತು ಚಿಕಿತ್ಸೆ',
    role_admin: 'ಜಿಲ್ಲಾ ಆರೋಗ್ಯ ಅಧಿಕಾರಿ',
    
    // Nav & Common
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    patients: 'ರೋಗಿ ನೋಂದಣಿ',
    referrals: 'ಟ್ರಯೇಜ್ ಮತ್ತು ರೆಫರಲ್',
    resources: 'ಹಾಸಿಗೆಗಳು ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು',
    inventory: 'ತುರ್ತು ಔಷಧ ದಾಸ್ತಾನು',
    outbreakMap: 'ಸಾಂಕ್ರಾಮಿಕ ರೋಗ ನಕ್ಷೆ',
    searchPlaceholder: '14-ಅಂಕಿಯ ಆಭಾ ಐಡಿ, ಮೊಬೈಲ್ ಅಥವಾ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ...',
    online: 'ಆನ್‌ಲೈನ್',
    offline: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್',
    synced: 'ಎಲ್ಲಾ ಬದಲಾವಣೆಗಳು ಸಿಂಕ್ ಆಗಿವೆ',
    pendingSync: 'ಆಫ್‌ಲೈನ್ ಸರದಿಯಲ್ಲಿ',
    syncNow: 'ಈಗ ಸಿಂಕ್ ಮಾಡಿ',
    simulateOffline: 'ಆಫ್‌ಲೈನ್ ಪರೀಕ್ಷೆ',
    simulateOnline: 'ಆನ್‌ಲೈನ್ ಮರುಸ್ಥಾಪಿಸಿ',
    switchRole: 'ಪಾತ್ರ ಬದಲಾಯಿಸಿ',
    
    // Triage
    triageRed: 'ಅತ್ಯಂತ ತುರ್ತು (ಆದ್ಯತೆ 1)',
    triageYellow: 'ತುರ್ತು (ಆದ್ಯತೆ 2)',
    triageGreen: 'ಸಾಮಾನ್ಯ (ಆದ್ಯತೆ 3)',
    triageScore: 'ಟ್ರಯೇಜ್ ಸ್ಕೋರ್',
    recommendedFacility: 'ಶಿಫಾರಸು ಮಾಡಿದ ಆರೈಕೆ ಕೇಂದ್ರ',
    
    // Vitals
    systolicBp: 'ಸಿಸ್ಟೋಲಿಕ್ ಬಿಪಿ',
    diastolicBp: 'ಡಯಾಸ್ಟೋಲಿಕ್ ಬಿಪಿ',
    heartRate: 'ನಾಡಿ ಬಡಿತ (Pulse)',
    spO2: 'SpO2 ಆಮ್ಲಜನಕ',
    respiratoryRate: 'ಉಸಿರಾಟದ ದರ',
    temperature: 'ದೇಹದ ಉಷ್ಣತೆ',
    bloodGlucose: 'ರಕ್ತದ ಸಕ್ಕರೆ',
    hemoglobin: 'ಹಿಮೋಗ್ಲೋಬಿನ್',
    consciousLevel: 'ಪ್ರಜ್ಞೆಯ ಮಟ್ಟ (AVPU)',
    
    // Patient Form
    newPatient: 'ಹೊಸ ರೋಗಿ ನೋಂದಣಿ',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    age: 'ವಯಸ್ಸು',
    gender: 'ಲಿಂಗ',
    phone: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    village: 'ಗ್ರಾಮ',
    taluka: 'ತಾಲೂಕು',
    district: 'ಜಿಲ್ಲೆ',
    bloodGroup: 'ರಕ್ತದ ಗುಂಪು',
    isPregnant: 'ರೋಗಿ ಗರ್ಭಿಣಿಯೇ?',
    gestationalWeeks: 'ಗರ್ಭಧಾರಣೆಯ ವಾರಗಳು',
    highRiskFlag: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಗರ್ಭಧಾರಣೆ (HRP)',
    saveOffline: 'ದಾಖಲೆ ಉಳಿಸಿ (ಆಫ್‌ಲೈನ್ ಸಿದ್ಧ)',
    
    // Referral
    newReferral: 'ಡಿಜಿಟಲ್ ರೆಫರಲ್ ರಚಿಸಿ',
    referringFacility: 'ರೆಫರ್ ಮಾಡುವ ಕೇಂದ್ರ',
    targetFacility: 'ಗುರಿ ಆಸ್ಪತ್ರೆ',
    specialtyRequired: 'ಅಗತ್ಯವಿರುವ ತಜ್ಞರು',
    reasonForReferral: 'ರೆಫರಲ್ ಕಾರಣ ಮತ್ತು ದೂರುಗಳು',
    generateQrToken: 'ಡಿಜಿಟಲ್ ರೆಫರಲ್ ಟೋಕನ್ ರಚಿಸಿ',
    viewQrSlip: 'ರೆಫರಲ್ ರಸೀದಿ ನೋಡಿ / ಮುದ್ರಿಸಿ',
    tokenCode: 'ರೆಫರಲ್ ಟೋಕನ್',
    bypassDeskMsg: 'ತುರ್ತು ವಿಭಾಗದಲ್ಲಿ ಕ್ಯೂ ತಪ್ಪಿಸಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    ambulanceRequired: '108 ಆಂಬ್ಯುಲೆನ್ಸ್ ರವಾನಿಸಲಾಗಿದೆ',
    
    // Beds & Resources
    bedMatrix: 'ಆಸ್ಪತ್ರೆ ಹಾಸಿಗೆ ಲಭ್ಯತೆ',
    totalBeds: 'ಒಟ್ಟು ಹಾಸಿಗೆಗಳು',
    occupiedBeds: 'ಭರ್ತಿಯಾಗಿವೆ',
    vacantBeds: 'ಲಭ್ಯವಿದೆ',
    icuBeds: 'ಐಸಿಯು ಹಾಸಿಗೆಗಳು',
    ventilatorBeds: 'ವೆಂಟಿಲೇಟರ್‌ಗಳು',
    oxygenBeds: 'ಆಕ್ಸಿಜನ್ ಹಾಸಿಗೆಗಳು',
    
    // Inventory
    emergencyStock: 'ಜೀವ ರಕ್ಷಕ ಔಷಧಗಳು',
    drugName: 'ಔಷಧ / ಅನಿಲ',
    currentStock: 'ಪ್ರಸ್ತುತ ದಾಸ್ತಾನು',
    bufferStock: 'ಕನಿಷ್ಠ ದಾಸ್ತಾನು',
    requestStock: 'ಔಷಧ ವರ್ಗಾವಣೆ ವಿನಂತಿ',
    lowStockAlert: 'ಕಡಿಮೆ ದಾಸ್ತಾನು ಎಚ್ಚರಿಕೆ (<25%)',
    
    // Status
    statusPending: 'ದಾರಿಯಲ್ಲಿದೆ / ಒಳಬರುತ್ತಿದೆ',
    statusAccepted: 'ತಜ್ಞರಿಂದ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    statusAdmitted: 'ದಾಖಲಿಸಲಾಗಿದೆ',
  },

  hi: {
    appTitle: 'स्वास्थ्यसेतु',
    appSubtitle: 'एकीकृत सार्वजनिक स्वास्थ्य एवं रेफरल प्रबंधन प्रणाली',
    govtHeader: 'सार्वजनिक स्वास्थ्य विभाग, सरकारी स्वास्थ्य मंच',
    abdmConform: 'ABDM एवं FHIR R4 अनुपालित',
    
    // Roles
    role_asha: 'आशा कार्यकर्ता / उप-केंद्र',
    role_phc: 'पीएचसी चिकित्सा अधिकारी',
    role_specialist: 'जिला विशेषज्ञ / आपातकालीन',
    role_admin: 'जिला स्वास्थ्य अधिकारी',
    
    // Nav & Common
    dashboard: 'डैशबोर्ड',
    patients: 'मरीज रजिस्ट्री',
    referrals: 'ट्राइएज एवं रेफरल',
    resources: 'बेड एवं संसाधन',
    inventory: 'आपातकालीन स्टॉक',
    outbreakMap: 'रोग प्रकोप मानचित्र',
    searchPlaceholder: '14-अंकीय आभा आईडी, मोबाइल या नाम से खोजें...',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन मोड',
    synced: 'सभी रिकॉर्ड सिंक हो गए',
    pendingSync: 'ऑफलाइन कतार में',
    syncNow: 'अभी सिंक करें',
    simulateOffline: 'ऑफलाइन परीक्षण',
    simulateOnline: 'ऑनलाइन पुनर्स्थापित करें',
    switchRole: 'भूमिका बदलें',
    
    // Triage
    triageRed: 'अति गंभीर (प्राथमिकता 1)',
    triageYellow: 'तत्काल (प्राथमिकता 2)',
    triageGreen: 'सामान्य (प्राथमिकता 3)',
    triageScore: 'ट्राइएज स्कोर',
    recommendedFacility: 'अनुशंसित स्वास्थ्य केंद्र',
    
    // Vitals
    systolicBp: 'सिस्टोलिक बीपी',
    diastolicBp: 'डायस्टोलिक बीपी',
    heartRate: 'नाड़ी दर (Pulse)',
    spO2: 'ऑक्सीजन स्तर (SpO2)',
    respiratoryRate: 'श्वसन दर',
    temperature: 'शरीर का तापमान',
    bloodGlucose: 'ब्लड शुगर',
    hemoglobin: 'हीमोग्लोबिन',
    consciousLevel: 'चेतना स्तर (AVPU)',
    
    // Patient Form
    newPatient: 'नया मरीज पंजीकरण',
    fullName: 'मरीज का पूरा नाम',
    age: 'आयु',
    gender: 'लिंग',
    phone: 'मोबाइल नंबर',
    village: 'गाँव / क्षेत्र',
    taluka: 'तहसील / तालुका',
    district: 'जिला',
    bloodGroup: 'रक्त समूह',
    isPregnant: 'क्या मरीज गर्भवती है?',
    gestationalWeeks: 'गर्भधारण के सप्ताह',
    highRiskFlag: 'उच्च जोखिम गर्भावस्था (HRP)',
    saveOffline: 'रिकॉर्ड सहेजें (ऑफलाइन तैयार)',
    
    // Referral
    newReferral: 'डिजिटल रेफरल बनाएं',
    referringFacility: 'रेफर करने वाला केंद्र',
    targetFacility: 'गंतव्य अस्पताल',
    specialtyRequired: 'आवश्यक विशेषज्ञता',
    reasonForReferral: 'रेफरल का मुख्य कारण',
    generateQrToken: 'डिजिटल रेफरल टोकन बनाएं',
    viewQrSlip: 'रेफरल पर्ची देखें / प्रिंट करें',
    tokenCode: 'रेफरल टोकन',
    bypassDeskMsg: 'कतार से बचने के लिए आपातकालीन डेस्क पर स्कैन करें',
    ambulanceRequired: '108 एम्बुलेंस रवाना की गई',
    
    // Beds & Resources
    bedMatrix: 'अस्पताल बेड स्थिति',
    totalBeds: 'कुल बेड',
    occupiedBeds: 'भरे हुए',
    vacantBeds: 'उपलब्ध',
    icuBeds: 'आईसीयू बेड',
    ventilatorBeds: 'वेंटिलेटर',
    oxygenBeds: 'ऑक्सीजन बेड',
    
    // Inventory
    emergencyStock: 'जीवन रक्षक दवाएं',
    drugName: 'दवा का नाम',
    currentStock: 'मौजूदा स्टॉक',
    bufferStock: 'बफर स्तर',
    requestStock: 'स्टॉक ट्रांसफर अनुरोध',
    lowStockAlert: 'कम स्टॉक चेतावनी (<25%)',
    
    // Status
    statusPending: 'प्रतीक्षारत / रास्ते में',
    statusAccepted: 'विशेषज्ञ द्वारा स्वीकृत',
    statusAdmitted: 'भर्ती कराया गया',
  },

  ta: {
    appTitle: 'சுவஸ்த்யாசேது',
    appSubtitle: 'ஒருங்கிணைந்த பொது சுகாதார மற்றும் பரிந்துரை மேலாண்மை அமைப்பு',
    govtHeader: 'பொது சுகாதாரத் துறை, அரசு சுகாதார தளம்',
    abdmConform: 'ABDM மற்றும் FHIR R4 இணக்கமானது',
    
    // Roles
    role_asha: 'ஆஷா பணியாளர் / துணை மையம்',
    role_phc: 'பிஎச்சி மருத்துவ அலுவலர்',
    role_specialist: 'மாவட்ட நிபுணர் / அவசர சிகிச்சை',
    role_admin: 'மாவட்ட சுகாதார அலுவலர்',
    
    // Nav & Common
    dashboard: 'டாஷ்போர்டு',
    patients: 'நோயாளி பதிவேடு',
    referrals: 'முன்னுரிமை & பரிந்துரைகள்',
    resources: 'படுக்கைகள் & வளங்கள்',
    inventory: 'அவசர மருந்து இருப்பு',
    outbreakMap: 'நோய் பரவல் வரைபடம்',
    searchPlaceholder: '14-இலக்க ஆபா ஐடி, தொலைபேசி அல்லது பெயரால் தேடுங்கள்...',
    online: 'ஆன்லைன்',
    offline: 'ஆஃப்லைன் பயன்முறை',
    synced: 'அனைத்து மாற்றங்களும் ஒத்திசைக்கப்பட்டன',
    pendingSync: 'ஆஃப்லைன் வரிசையில்',
    syncNow: 'இப்போது ஒத்திசை',
    simulateOffline: 'ஆஃப்லைன் சோதனை',
    simulateOnline: 'ஆன்லைனை மீட்டமை',
    switchRole: 'பங்கை மாற்று',
    
    // Triage
    triageRed: 'மிகவும் அவசரம் (முன்னுரிமை 1)',
    triageYellow: 'அவசரம் (முன்னுரிமை 2)',
    triageGreen: 'வழக்கமானது (முன்னுரிமை 3)',
    triageScore: 'முன்னுரிமை மதிப்பீடு',
    recommendedFacility: 'பரிந்துரைக்கப்பட்ட மருத்துவமனை',
    
    // Vitals
    systolicBp: 'சிஸ்டாலிக் பிபி',
    diastolicBp: 'டயஸ்டாலிக் பிபி',
    heartRate: 'நாடித் துடிப்பு (Pulse)',
    spO2: 'SpO2 ஆக்ஸிஜன்',
    respiratoryRate: 'சுவாச விகிதம்',
    temperature: 'உடல் வெப்பநிலை',
    bloodGlucose: 'இரத்த சர்க்கரை',
    hemoglobin: 'ஹீமோகுளோபின்',
    consciousLevel: 'நினைவு நிலை (AVPU)',
    
    // Patient Form
    newPatient: 'புதிய நோயாளி பதிவு',
    fullName: 'முழு பெயர்',
    age: 'வயது',
    gender: 'பாலினம்',
    phone: 'தொலைபேசி எண்',
    village: 'கிராமம்',
    taluka: 'வட்டம் / தாலுகா',
    district: 'மாவட்டம்',
    bloodGroup: 'இரத்த வகை',
    isPregnant: 'கர்ப்பிணியா?',
    gestationalWeeks: 'கர்ப்ப வாரங்கள்',
    highRiskFlag: 'அதிக ஆபத்துள்ள கர்ப்பம் (HRP)',
    saveOffline: 'பதிவை சேமி (ஆஃப்லைன் தயார்)',
    
    // Referral
    newReferral: 'டிஜிட்டல் பரிந்துரை உருவாக்கு',
    referringFacility: 'பரிந்துரைக்கும் மையம்',
    targetFacility: 'இலக்கு மருத்துவமனை',
    specialtyRequired: 'தேவையான நிபுணர்',
    reasonForReferral: 'பரிந்துரைக்கான காரணம்',
    generateQrToken: 'டிஜிட்டல் டோக்கன் உருவாக்கு',
    viewQrSlip: 'பரிந்துரை சீட்டைப் பார் / அச்சிடு',
    tokenCode: 'பரிந்துரை டோக்கன்',
    bypassDeskMsg: 'வரிசையைத் தவிர்க்க ஸ்கேன் செய்யவும்',
    ambulanceRequired: '108 ஆம்புலன்ஸ் அனுப்பப்பட்டது',
    
    // Beds & Resources
    bedMatrix: 'மருத்துவமனை படுக்கை நிலை',
    totalBeds: 'மொத்த படுக்கைகள்',
    occupiedBeds: 'நிரப்பப்பட்டது',
    vacantBeds: 'கிடைக்கிறது',
    icuBeds: 'ஐசியூ படுக்கைகள்',
    ventilatorBeds: 'வென்டிலேட்டர்கள்',
    oxygenBeds: 'ஆக்ஸிஜன் படுக்கைகள்',
    
    // Inventory
    emergencyStock: 'உயிர் காக்கும் மருந்துகள்',
    drugName: 'மருந்தின் பெயர்',
    currentStock: 'தற்போதைய இருப்பு',
    bufferStock: 'குறைந்தபட்ச இருப்பு',
    requestStock: 'மருந்து பரிமாற்ற கோரிக்கை',
    lowStockAlert: 'குறைந்த இருப்பு எச்சரிக்கை (<25%)',
    
    // Status
    statusPending: 'வருகிறது / வழியில் உள்ளது',
    statusAccepted: 'நிபுணரால் ஏற்கப்பட்டது',
    statusAdmitted: 'அனுமதிக்கப்பட்டது',
  },

  te: {
    appTitle: 'స్వాస్థ్యసేతు',
    appSubtitle: 'సమగ్ర ప్రజా ఆరోగ్య మరియు రెఫరల్ నిర్వహణ వ్యవస్థ',
    govtHeader: 'ప్రజా ఆరోగ్య శాఖ, ప్రభుత్వ ఆరోగ్య వేదిక',
    abdmConform: 'ABDM మరియు FHIR R4 కంప్లైంట్',
    
    // Roles
    role_asha: 'ఆశా కార్యకర్త / ఉపకేంద్రం',
    role_phc: 'పీహెచ్‌సీ వైద్యాధికారి',
    role_specialist: 'జిల్లా నిపుణుడు / అత్యవసర',
    role_admin: 'జిల్లా వైద్యాధికారి',
    
    // Nav & Common
    dashboard: 'డ్యాష్‌బోర్డ్',
    patients: 'రోగుల రిజిస్ట్రీ',
    referrals: 'ట్రయాజ్ & రెఫరల్స్',
    resources: 'పడకలు & వనరులు',
    inventory: 'అత్యవసర ఔషధ నిల్వ',
    outbreakMap: 'వ్యాధి వ్యాప్తి పటం',
    searchPlaceholder: '14-అంకెల ఆభా ఐడీ, ఫోన్ లేదా పేరుతో శోధించండి...',
    online: 'ఆన్‌లైన్',
    offline: 'ఆఫ్‌లైన్ మోడ్',
    synced: 'అన్ని మార్పులు సింక్ అయ్యాయి',
    pendingSync: 'ఆఫ్‌లైన్ క్యూలో ఉంది',
    syncNow: 'ఇప్పుడే సింక్ చేయండి',
    simulateOffline: 'ఆఫ్‌లైన్ పరీక్ష',
    simulateOnline: 'ఆన్‌లైన్ పునరుద్ధరించండి',
    switchRole: 'పాత్రను మార్చండి',
    
    // Triage
    triageRed: 'అత్యంత క్లిష్టమైనది (ప్రాధాన్యత 1)',
    triageYellow: 'అత్యవసరం (ప్రాధాన్యత 2)',
    triageGreen: 'సాధారణం (ప్రాధాన్యత 3)',
    triageScore: 'ట్రయాజ్ స్కోర్',
    recommendedFacility: 'సిఫార్సు చేయబడిన ఆసుపత్రి',
    
    // Vitals
    systolicBp: 'సిస్టోలిక్ బీపీ',
    diastolicBp: 'డయాస్టోలిక్ బీపీ',
    heartRate: 'నాడి రేటు (Pulse)',
    spO2: 'SpO2 ఆక్సిజన్',
    respiratoryRate: 'శ్వాసక్రియ రేటు',
    temperature: 'శరీర ఉష్ణోగ్రత',
    bloodGlucose: 'రక్తంలో చక్కెర',
    hemoglobin: 'హిమోగ్లోబిన్',
    consciousLevel: 'స్పృహ స్థాయి (AVPU)',
    
    // Patient Form
    newPatient: 'కొత్త రోగి నమోదు',
    fullName: 'పూర్తి పేరు',
    age: 'వయస్సు',
    gender: 'లింగం',
    phone: 'ఫోన్ నంబర్',
    village: 'గ్రామం',
    taluka: 'తాలూకా / మండలం',
    district: 'జిల్లా',
    bloodGroup: 'రక్త గ్రూపు',
    isPregnant: 'రోగి గర్భవతా?',
    gestationalWeeks: 'గర్భధారణ వారాలు',
    highRiskFlag: 'అధిక ప్రమాద గర్భం (HRP)',
    saveOffline: 'రికార్డు భద్రపరచండి (ఆఫ్‌లైన్ సిద్ధం)',
    
    // Referral
    newReferral: 'డిజిటల్ రెఫరల్ సృష్టించండి',
    referringFacility: 'రెఫర్ చేస్తున్న కేంద్రం',
    targetFacility: 'గమ్యస్థాన ఆసుపత్రి',
    specialtyRequired: 'అవసరమైన స్పెషాలిటీ',
    reasonForReferral: 'రెఫరల్ కారణం & ప్రధాన సమస్యలు',
    generateQrToken: 'డిజిటల్ రెఫరల్ టోకెన్ పొందండి',
    viewQrSlip: 'రెఫరల్ రసీదు చూడండి / ముద్రించండి',
    tokenCode: 'రెఫరల్ టోకెన్',
    bypassDeskMsg: 'క్యూ నివారించడానికి అత్యవసర డెస్క్ వద్ద స్కాన్ చేయండి',
    ambulanceRequired: '108 అంబులెన్స్ బయలుదేరింది',
    
    // Beds & Resources
    bedMatrix: 'ఆసుపత్రి పడకల స్థితి',
    totalBeds: 'మొత్తం పడకలు',
    occupiedBeds: 'భర్తీ అయ్యాయి',
    vacantBeds: 'అందుబాటులో ఉన్నాయి',
    icuBeds: 'ఐసీయూ పడకలు',
    ventilatorBeds: 'వెంటిలేటర్లు',
    oxygenBeds: 'ఆక్సిజన్ పడకలు',
    
    // Inventory
    emergencyStock: 'ప్రాణ రక్షక ఔషధాలు',
    drugName: 'మందు పేరు',
    currentStock: 'ప్రస్తుత నిల్వ',
    bufferStock: 'కనిష్ట నిಲ್వ',
    requestStock: 'ఔషధ బదిలీ అభ్యర్థన',
    lowStockAlert: 'తక్కువ నిల్వ హెచ్చరిక (<25%)',
    
    // Status
    statusPending: 'వస్తోంది / మార్గంలో ఉంది',
    statusAccepted: 'స్పెషలిస్ట్ ఆమోదించారు',
    statusAdmitted: 'చేర్చుకున్నారు',
  },

  mr: {
    appTitle: 'स्वास्थ्यसेतू',
    appSubtitle: 'एकात्मिक सार्वजनिक आरोग्य व संदर्भ सेवा व्यवस्थापन प्रणाली',
    govtHeader: 'सार्वजनिक आरोग्य विभाग, शासन आरोग्य व्यासपीठ',
    abdmConform: 'आयुष्मान भारत डिजिटल मिशन (ABDM) सुसंगत',
    
    // Roles
    role_asha: 'आशा सेविका / उपकेंद्र',
    role_phc: 'वैद्यकीय अधिकारी (प्रा.आ.के.)',
    role_specialist: 'जिल्हा रुग्णालय तज्ज्ञ / कॅज्युअल्टी',
    role_admin: 'जिल्हा आरोग्य अधिकारी व औषध नियंत्रण',
    
    // Nav & Common
    dashboard: 'डॅशबोर्ड',
    patients: 'रुग्ण नोंदवही',
    referrals: 'रुग्ण संदर्भ व ट्रायज',
    resources: 'खाटा व संसाधने',
    inventory: 'तातडीचा औषध साठा',
    outbreakMap: 'रोग प्रादुर्भाव नकाशा',
    searchPlaceholder: '१४-अंकी आभा आयडी, फोन किंवा नावाने शोधा...',
    online: 'ऑनलाईन',
    offline: 'ऑफलाईन मोड',
    synced: 'सर्व माहिती समक्रमित',
    pendingSync: 'ऑफलाईन रांगेत',
    syncNow: 'आता सिंक करा',
    simulateOffline: 'ऑफलाईन चाचणी',
    simulateOnline: 'ऑनलाईन पूर्ववत करा',
    switchRole: 'भूमिका बदला',
    
    // Triage
    triageRed: 'अतिदक्षता / गंभीर (प्राधान्य १)',
    triageYellow: 'तातडीचे (प्राधान्य २)',
    triageGreen: 'नियमित (प्राधान्य ३)',
    triageScore: 'ट्रायज गुणसंख्या',
    recommendedFacility: 'शिफारस केलेली आरोग्य सुविधा',
    
    // Vitals
    systolicBp: 'रक्तदाब (सिस्टोलिक)',
    diastolicBp: 'रक्तदाब (डायस्टोलिक)',
    heartRate: 'नाडीचे ठोके (Pulse)',
    spO2: 'ऑक्सिजन प्रमाण (SpO2)',
    respiratoryRate: 'श्वसन गती',
    temperature: 'शरीराचे तापमान',
    bloodGlucose: 'रक्तातील साखर',
    hemoglobin: 'हिमोग्लोबिन',
    consciousLevel: 'शुद्धीची स्थिती (AVPU)',
    
    // Patient Form
    newPatient: 'नवीन रुग्ण नोंदणी',
    fullName: 'रुग्णाचे पूर्ण नाव',
    age: 'वय',
    gender: 'लिंग',
    phone: 'मोबाईल क्रमांक',
    village: 'गाव / वाडी',
    taluka: 'तालुका',
    district: 'जिल्हा',
    bloodGroup: 'रक्तगट',
    isPregnant: 'रुग्ण गरोदर आहे का?',
    gestationalWeeks: 'गरोदरपणाचे आठवडे',
    highRiskFlag: 'अतिधोकादायक गरोदरपण (HRP)',
    saveOffline: 'नोंद जतन करा (ऑफलाईन सक्षम)',
    
    // Referral
    newReferral: 'डिजिटल रेफरल तयार करा',
    referringFacility: 'रेफर करणारी सुविधा',
    targetFacility: 'गंतव्य रुग्णालय',
    specialtyRequired: 'आवश्यक तज्ज्ञ विभाग',
    reasonForReferral: 'रेफर करण्याचे मुख्य वैद्यकीय कारण',
    generateQrToken: 'डिजिटल रेफरल टोकन बनवा',
    viewQrSlip: 'रेफरल पावती पहा / प्रिंट करा',
    tokenCode: 'रेफरल टोकन क्रमांक',
    bypassDeskMsg: 'गंतव्य रुग्णालयात रांग वगळण्यासाठी स्कॅन करा',
    ambulanceRequired: '१०८ रुग्णवाहिका रवाना करण्यात आली',
    
    // Beds & Resources
    bedMatrix: 'थेट रुग्णालय खाटा स्थिती',
    totalBeds: 'एकूण खाटा',
    occupiedBeds: 'भरलेल्या खाटा',
    vacantBeds: 'उपलब्ध खाटा',
    icuBeds: 'आयसीयू (ICU) खाटा',
    ventilatorBeds: 'व्हेंटिलेटर सुविधा',
    oxygenBeds: 'ऑक्सिजन खाटा',
    
    // Inventory
    emergencyStock: 'तातडीची जीवनरक्षक औषधे',
    drugName: 'औषधाचे नाव / वायू',
    currentStock: 'सध्याचा साठा',
    bufferStock: 'किमान राखीव साठा',
    requestStock: 'आंतर-रुग्णालय पुरवठा मागणी',
    lowStockAlert: 'कमी साठा इशारा (२५% पेक्षा कमी)',
    
    // Status
    statusPending: 'येत आहे / मार्गावर',
    statusAccepted: 'तज्ज्ञांकडून स्वीकारले',
    statusAdmitted: 'दाखल करून घेतले',
  }
};
