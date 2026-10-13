'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';
import {
  X,
  Bell,
  BellRing,
  BellOff,
  Pill,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Volume2,
  ShieldCheck,
  Building2,
  User,
  Sparkles,
  Check,
  Send,
  Info,
} from 'lucide-react';

interface CitizenNotificationsModalProps {
  onClose: () => void;
}

export interface MedicineReminder {
  id: string;
  name: string;
  dosage: string;
  time: string; // e.g. "14:00"
  meal: 'before' | 'after' | 'with';
  frequency: string;
  isActive: boolean;
  isTakenToday?: boolean;
}

export interface AppointmentReminder {
  id: string;
  doctor: string;
  facility: string;
  date: string; // e.g. "2026-10-16"
  time: string; // e.g. "10:30"
  purpose: string;
  isActive: boolean;
}

export interface VaccineAlert {
  id: string;
  title: string;
  beneficiary: string;
  facility: string;
  dueDate: string;
  status: 'due' | 'upcoming';
}

const DEFAULT_MEDICINES: MedicineReminder[] = [
  {
    id: 'med-1',
    name: 'Metformin 500mg',
    dosage: '1 Tablet',
    time: '20:30',
    meal: 'after',
    frequency: 'Daily (Night)',
    isActive: true,
    isTakenToday: false,
  },
  {
    id: 'med-2',
    name: 'Paracetamol 650mg',
    dosage: '1 Tablet',
    time: '14:00',
    meal: 'after',
    frequency: 'As needed (SOS for fever)',
    isActive: true,
    isTakenToday: true,
  },
  {
    id: 'med-3',
    name: 'Iron & Folic Acid (IFA)',
    dosage: '1 Tablet',
    time: '09:00',
    meal: 'after',
    frequency: 'Daily (Morning)',
    isActive: true,
    isTakenToday: false,
  },
  {
    id: 'med-4',
    name: 'Amlodipine 5mg (BP)',
    dosage: '1 Tablet',
    time: '08:00',
    meal: 'before',
    frequency: 'Daily (Morning)',
    isActive: true,
    isTakenToday: false,
  },
];

const DEFAULT_APPOINTMENTS: AppointmentReminder[] = [
  {
    id: 'apt-1',
    doctor: 'Dr. Ramesh Kulkarni (Medical Officer)',
    facility: 'Primary Health Centre (PHC) Karjat',
    date: '2026-10-16',
    time: '10:30',
    purpose: 'Monthly Blood Pressure & Diabetes Follow-up',
    isActive: true,
  },
  {
    id: 'apt-2',
    doctor: 'ANM Sunita Patil',
    facility: 'Sub-Centre Health & Wellness Clinic',
    date: '2026-10-18',
    time: '11:00',
    purpose: 'Antenatal Check-up (ANC) & Nutrition Counseling',
    isActive: true,
  },
  {
    id: 'apt-3',
    doctor: 'Dr. Anita Joshi (Pediatric Specialist)',
    facility: 'Sub-District Hospital (SDH)',
    date: '2026-10-22',
    time: '09:30',
    purpose: 'Child Growth Monitoring & Immunization review',
    isActive: true,
  },
];

const DEFAULT_VACCINES: VaccineAlert[] = [
  {
    id: 'vac-1',
    title: 'Pulse Polio National Immunization Booster',
    beneficiary: 'Child (Under 5 years)',
    facility: 'Anganwadi Centre & PHC Booth',
    dueDate: 'Sunday, 19 Oct 2026',
    status: 'due',
  },
  {
    id: 'vac-2',
    title: 'Pentavalent-3 & Rota Booster Dose',
    beneficiary: 'Infant (14 Weeks)',
    facility: 'PHC Immunization OPD Room',
    dueDate: '25 Oct 2026',
    status: 'upcoming',
  },
  {
    id: 'vac-3',
    title: 'Tetanus & Diphtheria (Td) Dose',
    beneficiary: 'Maternal Care',
    facility: 'Sub-Centre Health Clinic',
    dueDate: '02 Nov 2026',
    status: 'upcoming',
  },
];

export function CitizenNotificationsModal({ onClose }: CitizenNotificationsModalProps) {
  const { language } = useLanguage();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  const [activeTab, setActiveTab] = useState<'medicines' | 'appointments' | 'vaccines'>('medicines');
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [medicines, setMedicines] = useState<MedicineReminder[]>(DEFAULT_MEDICINES);
  const [appointments, setAppointments] = useState<AppointmentReminder[]>(DEFAULT_APPOINTMENTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for adding a new medicine reminder
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('1 Tablet');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newMedMeal, setNewMedMeal] = useState<'before' | 'after' | 'with'>('after');
  const [newMedFreq, setNewMedFreq] = useState('Daily');

  // Form states for adding appointment
  const [isAddingApt, setIsAddingApt] = useState(false);
  const [newAptDoctor, setNewAptDoctor] = useState('');
  const [newAptFacility, setNewAptFacility] = useState('');
  const [newAptDate, setNewAptDate] = useState('');
  const [newAptTime, setNewAptTime] = useState('10:00');
  const [newAptPurpose, setNewAptPurpose] = useState('');

  // Play subtle audible chime on notification
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (_) {}
  };

  // Check notification permission on mount & load localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }

    try {
      const savedMeds = localStorage.getItem('swasthya_citizen_meds');
      if (savedMeds) {
        setMedicines(JSON.parse(savedMeds));
      }
      const savedApts = localStorage.getItem('swasthya_citizen_apts');
      if (savedApts) {
        setAppointments(JSON.parse(savedApts));
      }
    } catch (_) {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save changes to localStorage
  const saveMedicines = (updated: MedicineReminder[]) => {
    setMedicines(updated);
    try {
      localStorage.setItem('swasthya_citizen_meds', JSON.stringify(updated));
    } catch (_) {}
  };

  const saveAppointments = (updated: AppointmentReminder[]) => {
    setAppointments(updated);
    try {
      localStorage.setItem('swasthya_citizen_apts', JSON.stringify(updated));
    } catch (_) {}
  };

  // Request External System Push Notification Permission
  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast(getLoc({
        en: 'Browser notifications are not supported on this device.',
        kn: 'ಈ ಸಾಧನದಲ್ಲಿ ಬ್ರೌಸರ್ ಅಧಿಸೂಚನೆಗಳು ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.',
        hi: 'इस डिवाइस पर ब्राउज़र नोटिफिकेशन समर्थित नहीं है।',
        ta: 'இந்த சாதனத்தில் உலாவி அறிவிப்புகள் ஆதரிக்கப்படவில்லை.',
        te: 'ఈ పరికరంలో బ్రౌజర్ నోటిఫికేషన్‌లు మద్దతు ఇవ్వవు.',
        mr: 'या डिव्हाइसवर ब्राउझर नोटिफिकेशन्स समर्थित नाहीत.',
      }));
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setPermissionStatus(res);
      if (res === 'granted') {
        playAlertChime();
        triggerSystemNotification(
          getLoc({
            en: '✅ SwasthyaSetu Health Notifications Enabled!',
            kn: '✅ ಸ್ವಾಸ್ಥ್ಯಸೇತು ಆರೋಗ್ಯ ಅಧಿಸೂಚನೆಗಳು ಸಕ್ರಿಯವಾಗಿವೆ!',
            hi: '✅ स्वास्थ्यसेतु हेल्थ नोटिफिकेशन्स चालू हो गए!',
            ta: '✅ சுவஸ்த்யாசேது சுகாதார அறிவிப்புகள் இயக்கப்பட்டன!',
            te: '✅ స్వాస్థ్యసేతు ఆరోగ్య నోటిఫికేషన్‌లు ప్రారంభించబడ్డాయి!',
            mr: '✅ स्वास्थ्यसेतू आरोग्य सूचना सक्रिय झाल्या आहेत!',
          }),
          getLoc({
            en: 'You will receive real external alerts for medicine timings & doctor visits.',
            kn: 'ಔಷಧಿ ಸಮಯಗಳು ಮತ್ತು ವೈದ್ಯರ ಭೇಟಿಗಳಿಗಾಗಿ ನೀವು ನೈಜ ಬಾಹ್ಯ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸ್ವೀಕರಿಸುತ್ತೀರಿ.',
            hi: 'आपको दवाओं के समय और डॉक्टर की मुलाकातों के लिए सीधे बाहरी अलर्ट मिलेंगे।',
            ta: 'மருந்து நேரங்கள் மற்றும் மருத்துவர் சந்திப்புகளுக்கான விழிப்பூட்டல்களைப் பெறுவீர்கள்.',
            te: 'మందుల సమయాలు మరియు వైద్యుల సందర్శనల కోసం మీకు బాహ్య హెచ్చరికలు వస్తాయి.',
            mr: 'औषधांच्या वेळा व डॉक्टरांच्या भेटींसाठी आपल्याला थेट बाहेरून सूचना मिळतील.',
          })
        );
        showToast(getLoc({
          en: 'Device notifications activated successfully!',
          kn: 'ಸಾಧನದ ಅಧಿಸೂಚನೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ!',
          hi: 'डिवाइस नोटिफिकेशन्स सफलतापूर्वक सक्रिय हो गए!',
          ta: 'சாதன அறிவிப்புகள் வெற்றிகரமாக செயல்படுத்தப்பட்டன!',
          te: 'పరికర నోటిఫికేషన్‌లు విజయవంతంగా సక్రియం చేయబడ్డాయి!',
          mr: 'डिव्हाइस नोटिफिकेशन्स यशस्वीरित्या सक्रिय झाले!',
        }));
      } else {
        showToast(getLoc({
          en: 'Notifications were blocked. Please allow notifications in site permissions.',
          kn: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿಸಿ.',
          hi: 'नोटिफिकेशन अवरुद्ध हैं। कृपया ब्राउज़र अनुमतियों में इसे चालू करें।',
          ta: 'அறிவிப்புகள் தடுக்கப்பட்டுள்ளன. உலாவி அனுமதிகளில் இயக்கவும்.',
          te: 'నోటిఫికేషన్‌లు నిరోధించబడ్డాయి. సైట్ అనుమతులలో ప్రారంభించండి.',
          mr: 'सूचना अवरोधित केल्या आहेत. कृपया ब्राउझरमध्ये परवानगी द्या.',
        }));
      }
    } catch (err) {
      console.warn('Error requesting notifications:', err);
    }
  };

  // Trigger External Device Notification
  const triggerSystemNotification = (title: string, body: string) => {
    playAlertChime();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'swasthya-reminder',
        });
        notif.onclick = () => {
          window.focus();
        };
      } catch (_) {}
    }
  };

  // Test send custom external reminder
  const handleTestNotification = (type: 'medicine' | 'appointment') => {
    if (permissionStatus !== 'granted') {
      handleRequestPermission();
      return;
    }

    if (type === 'medicine') {
      triggerSystemNotification(
        getLoc({
          en: '💊 Medicine Alert: Metformin 500mg',
          kn: '💊 ಔಷಧಿ ಜ್ಞಾಪನೆ: ಮೆಟ್‌ಫಾರ್ಮಿನ್ 500mg',
          hi: '💊 दवा रिमाइंडर: मेटफॉर्मिन 500mg',
          ta: '💊 மருந்து நினைவூட்டல்: மெட்ஃபோர்மின் 500mg',
          te: '💊 మందుల రిమైండర్: మెట్‌ఫార్మిన్ 500mg',
          mr: '💊 औषध स्मरणपत्र: मेटफॉर्मिन ५००mg',
        }),
        getLoc({
          en: 'Scheduled for 8:30 PM (After Dinner). Please take your medicine with a glass of water.',
          kn: 'ರಾತ್ರಿ 8:30 ಕ್ಕೆ ನಿಗದಿಯಾಗಿದೆ (ಊಟದ ನಂತರ). ದಯವಿಟ್ಟು ಔಷಧಿಯನ್ನು ಸೇವಿಸಿ.',
          hi: 'रात 8:30 बजे (भोजन के बाद)। कृपया अपनी दवा एक गिलास पानी के साथ लें।',
          ta: 'இரவு 8:30 மணிக்கு (இரவு உணவுக்குப் பின்). மருந்தை உட்கொள்ளவும்.',
          te: 'రాత్రి 8:30 గంటలకు (భోజనం తర్వాత). దయచేసి మీ మందు తీసుకోండి.',
          mr: 'रात्री ८:३० वाजता (जेवणानंतर). कृपया आपली गोळी घ्या.',
        })
      );
      showToast(getLoc({
        en: 'External Medicine Notification sent to your device!',
        kn: 'ನಿಮ್ಮ ಸಾಧನಕ್ಕೆ ಬಾಹ್ಯ ಔಷಧಿ ಅಧಿಸೂಚನೆಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ!',
        hi: 'आपके डिवाइस पर दवा का बाहरी नोटिफिकेशन भेजा गया!',
        ta: 'உங்கள் சாதனத்திற்கு மருந்து அறிவிப்பு அனுப்பப்பட்டது!',
        te: 'మీ పరికరానికి మందుల నోటిఫికేషన్ పంపబడింది!',
        mr: 'आपल्या डिव्हाइसवर औषधाची थेट सूचना पाठवली गेली!',
      }));
    } else {
      triggerSystemNotification(
        getLoc({
          en: '🏥 Doctor Appointment: Dr. Ramesh Kulkarni',
          kn: '🏥 ವೈದ್ಯರ ಭೇಟಿ: ಡಾ. ರಮೇಶ್ ಕುಲಕರ್ಣಿ',
          hi: '🏥 डॉक्टर अपॉइंटमेंट: डॉ. रमेश कुलकर्णी',
          ta: '🏥 மருத்துவர் சந்திப்பு: டாக்டர் ரமேஷ் குல்கர்னி',
          te: '🏥 డాక్టర్ అపాయింట్‌మెంట్: డాక్టర్ రమేష్ కులకర్ణి',
          mr: '🏥 डॉक्टर भेट: डॉ. रमेश कुलकर्णी',
        }),
        getLoc({
          en: 'Tomorrow at 10:30 AM at Primary Health Centre (PHC) Karjat. Bring your ABHA card.',
          kn: 'ನಾಳೆ ಬೆಳಿಗ್ಗೆ 10:30 ಕ್ಕೆ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC). ನಿಮ್ಮ ಆಭಾ ಕಾರ್ಡ್ ತರಲು ಮರೆಯದಿರಿ.',
          hi: 'कल सुबह 10:30 बजे प्राथमिक स्वास्थ्य केंद्र (PHC)। अपना आभा कार्ड साथ लाएं।',
          ta: 'நாளை காலை 10:30 மணிக்கு ஆரம்ப சுகாதார நிலையம் (PHC). ஆபா அட்டையைக் கொண்டு வாருங்கள்.',
          te: 'రేపు ఉదయం 10:30 గంటలకు ప్రాథమిక ఆరోగ్య కేంద్రం (PHC). మీ ఆభా కార్డు తీసుకురండి.',
          mr: 'उद्या सकाळी १०:३० वाजता प्राथमिक आरोग्य केंद्र (PHC). आपले आभा कार्ड सोबत आणा.',
        })
      );
      showToast(getLoc({
        en: 'External Appointment Notification sent to your device!',
        kn: 'ನಿಮ್ಮ ಸಾಧನಕ್ಕೆ ಬಾಹ್ಯ ಭೇಟಿ ಅಧಿಸೂಚನೆಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ!',
        hi: 'आपके डिवाइस पर अपॉइंटमेंट का बाहरी नोटिफिकेशन भेजा गया!',
        ta: 'உங்கள் சாதனத்திற்கு சந்திப்பு அறிவிப்பு அனுப்பப்பட்டது!',
        te: 'మీ పరికరానికి అపాయింట్‌మెంట్ నోటిఫికేషన్ పంపబడింది!',
        mr: 'आपल्या डिव्हाइसवर डॉक्टर भेटीची थेट सूचना पाठवली गेली!',
      }));
    }
  };

  // Toggle Medicine Taken
  const handleToggleTaken = (id: string) => {
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, isTakenToday: !m.isTakenToday } : m
    );
    saveMedicines(updated);
    showToast(getLoc({
      en: 'Updated medicine status.',
      kn: 'ಔಷಧಿಯ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.',
      hi: 'दवा की स्थिति अपडेट हो गई।',
      ta: 'மருந்து நிலை புதுப்பிக்கப்பட்டது.',
      te: 'మందుల స్థితి నవీకరించబడింది.',
      mr: 'औषध स्थिती अद्ययावत केली.',
    }));
  };

  // Toggle Active/Inactive
  const handleToggleActiveMed = (id: string) => {
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    );
    saveMedicines(updated);
  };

  const handleDeleteMed = (id: string) => {
    const updated = medicines.filter((m) => m.id !== id);
    saveMedicines(updated);
    showToast(getLoc({
      en: 'Medicine reminder removed.',
      kn: 'ಔಷಧಿ ಜ್ಞಾಪನೆಯನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.',
      hi: 'दवा रिमाइंडर हटा दिया गया।',
      ta: 'மருந்து நினைவூட்டல் நீக்கப்பட்டது.',
      te: 'మందుల రిమైండర్ తీసివేయబడింది.',
      mr: 'औषध स्मरणपत्र हटवले.',
    }));
  };

  // Add new medicine reminder
  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newReminder: MedicineReminder = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage,
      time: newMedTime,
      meal: newMedMeal,
      frequency: newMedFreq,
      isActive: true,
      isTakenToday: false,
    };

    saveMedicines([newReminder, ...medicines]);
    setIsAddingMed(false);
    setNewMedName('');
    showToast(getLoc({
      en: 'New medicine reminder created!',
      kn: 'ಹೊಸ ಔಷಧಿ ಜ್ಞಾಪನೆಯನ್ನು ರಚಿಸಲಾಗಿದೆ!',
      hi: 'नया दवा रिमाइंडर बनाया गया!',
      ta: 'புதிய மருந்து நினைவூட்டல் உருவாக்கப்பட்டது!',
      te: 'కొత్త మందుల రిమైండర్ సృష్టించబడింది!',
      mr: 'नवीन औषध स्मरणपत्र तयार केले!',
    }));

    // Trigger confirmation notification if granted
    if (permissionStatus === 'granted') {
      triggerSystemNotification(
        `💊 Reminder Set: ${newReminder.name}`,
        `Scheduled for ${newReminder.time} (${newReminder.meal === 'after' ? 'After food' : 'Before food'}). SwasthyaSetu`
      );
    }
  };

  // Add new appointment reminder
  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptDoctor.trim() || !newAptDate) return;

    const newApt: AppointmentReminder = {
      id: `apt-${Date.now()}`,
      doctor: newAptDoctor.trim(),
      facility: newAptFacility.trim() || 'Nearby Primary Health Centre',
      date: newAptDate,
      time: newAptTime,
      purpose: newAptPurpose.trim() || 'Routine Consultation',
      isActive: true,
    };

    saveAppointments([newApt, ...appointments]);
    setIsAddingApt(false);
    setNewAptDoctor('');
    setNewAptFacility('');
    setNewAptDate('');
    setNewAptPurpose('');
    showToast(getLoc({
      en: 'New appointment reminder scheduled!',
      kn: 'ಹೊಸ ಭೇಟಿ ಜ್ಞಾಪನೆಯನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ!',
      hi: 'नई डॉक्टर अपॉइंटमेंट शेड्यूल हो गई!',
      ta: 'புதிய சந்திப்பு நினைவூட்டல் திட்டமிடப்பட்டது!',
      te: 'కొత్త అపాయింట్‌మెంట్ రిమైండర్ షెడ్యూల్ చేయబడింది!',
      mr: 'नवीन डॉक्टर भेट स्मरणपत्र नियोजित केले!',
    }));

    if (permissionStatus === 'granted') {
      triggerSystemNotification(
        `🏥 Appointment Scheduled: ${newApt.doctor}`,
        `Date: ${newApt.date} at ${newApt.time} (${newApt.facility})`
      );
    }
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter((a) => a.id !== id);
    saveAppointments(updated);
    showToast(getLoc({
      en: 'Appointment removed.',
      kn: 'ಭೇಟಿಯನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.',
      hi: 'अपॉइंटमेंट हटा दी गई।',
      ta: 'சந்திப்பு நீக்கப்பட்டது.',
      te: 'అపాయింట్‌మెంట్ తీసివేయబడింది.',
      mr: 'अपॉइंटमेंट हटवली.',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[92vh] max-h-[760px] overflow-hidden">
        
        {/* ── HEADER ── */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-700 via-emerald-700 to-slate-900 text-white flex items-center justify-between border-b border-teal-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner shrink-0 relative">
              <BellRing className="w-5 h-5 animate-bounce" />
              {permissionStatus === 'granted' && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -top-0.5 -right-0.5" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {getLoc({
                  en: 'Health Notifications & Reminders',
                  kn: 'ಆರೋಗ್ಯ ಅಧಿಸೂಚನೆಗಳು ಮತ್ತು ಜ್ಞಾಪನೆಗಳು',
                  hi: 'स्वास्थ्य सूचनाएं एवं स्मरणपत्र',
                  ta: 'சுகாதார அறிவிப்புகள் & நினைவூட்டல்கள்',
                  te: 'ఆరోగ్య నోటిఫికేషన్‌లు & రిమైండర్‌లు',
                  mr: 'आरोग्य सूचना व स्मरणपत्रे',
                })}
              </h2>
              <p className="text-xs text-teal-200 font-medium">
                {getLoc({
                  en: 'Real device push notifications for medicines & doctor visits',
                  kn: 'ಔಷಧಿಗಳು ಮತ್ತು ವೈದ್ಯರ ಭೇಟಿಗಳಿಗಾಗಿ ನೈಜ ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು',
                  hi: 'दवाओं और डॉक्टर की विजिट के लिए सीधे डिवाइस पर अलर्ट',
                  ta: 'மருந்துகள் மற்றும் மருத்துவர் சந்திப்புகளுக்கான நேரடி அறிவிப்புகள்',
                  te: 'మందులు మరియు వైద్యుల సందర్శనల కోసం నిజమైన పుష్ హెచ్చరికలు',
                  mr: 'औषधांच्या वेळा व डॉक्टरांच्या भेटींसाठी थेट डिव्हाइस अलर्ट',
                })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-teal-100 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── EXTERNAL PUSH NOTIFICATION PERMISSION BANNER ── */}
        <div className="px-5 py-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border-b border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              permissionStatus === 'granted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-amber-500 text-white'
            }`}>
              {permissionStatus === 'granted' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>
                  {permissionStatus === 'granted'
                    ? getLoc({
                        en: 'External Device Notifications: Active',
                        kn: 'ಬಾಹ್ಯ ಸಾಧನ ಅಧಿಸೂಚನೆಗಳು: ಸಕ್ರಿಯ',
                        hi: 'बाहरी डिवाइस नोटिफिकेशन्स: सक्रिय',
                        ta: 'வெளிப்புற சாதன அறிவிப்புகள்: செயலில்',
                        te: 'బాహ్య పరికర నోటిఫికేషన్‌లు: సక్రియంగా ఉంది',
                        mr: 'थेट डिव्हाइस सूचना: सक्रिय',
                      })
                    : getLoc({
                        en: 'Device Push Notifications: Inactive',
                        kn: 'ಸಾಧನ ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು: ನಿಷ್ಕ್ರಿಯ',
                        hi: 'डिवाइस पुश नोटिफिकेशन्स: निष्क्रिय',
                        ta: 'சாதன அறிவிப்புகள்: செயலற்றது',
                        te: 'పరికర పుష్ నోటిఫికేషన్‌లు: నిష్క్రియంగా ఉంది',
                        mr: 'डिव्हाइस पुश नोटिफिकेशन्स: निष्क्रिय',
                      })}
                </span>
                {permissionStatus === 'granted' && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-black">
                    ON
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {permissionStatus === 'granted'
                  ? getLoc({
                      en: 'You will receive popups on this phone/PC even when browser is in background.',
                      kn: 'ಬ್ರೌಸರ್ ಮುಚ್ಚಿದ್ದರೂ ಈ ಫೋನ್/ಪಿಸಿಯಲ್ಲಿ ಪಾಪ್-ಅಪ್ ಎಚ್ಚರಿಕೆಗಳು ಬರುತ್ತವೆ.',
                      hi: 'ब्राउज़र बैकग्राउंड में होने पर भी आपको इस स्क्रीन पर पॉपअप मिलेंगे।',
                      ta: 'உலாவி பின்னணியில் இருந்தாலும் திரையில் எச்சரிக்கைகள் வரும்.',
                      te: 'బ్రౌజర్ బ్యాక్‌గ్రౌండ్‌లో ఉన్నప్పటికీ మీకు పాప్-అప్ హెచ్చరికలు వస్తాయి.',
                      mr: 'ब्राउझर बॅकग्राउंडमध्ये असला तरीही स्क्रीनवर थेट सूचना दिसतील.',
                    })
                  : getLoc({
                      en: 'Enable to get real alerts outside the webpage for scheduled doses & visits.',
                      kn: 'ನಿಗದಿತ ಡೋಸ್‌ಗಳು ಮತ್ತು ಭೇಟಿಗಳಿಗಾಗಿ ನೈಜ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಲು ಸಕ್ರಿಯಗೊಳಿಸಿ.',
                      hi: 'दवाओं और डॉक्टर की मुलाकातों के लिए बाहर भी असली पॉपअप पाने हेतु चालू करें।',
                      ta: 'மருந்து அளவுகள் மற்றும் சந்திப்புகளுக்கான உண்மையான விழிப்பூட்டல்களைப் பெற இயக்கவும்.',
                      te: 'నిజమైన హెచ్చరికలను పొందడానికి దీన్ని ప్రారంభించండి.',
                      mr: 'वेळेवर औषधे व डॉक्टर भेटींचे थेट पॉपअप मिळवण्यासाठी सक्रिय करा.',
                    })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {permissionStatus !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>
                  {getLoc({
                    en: 'Enable System Alerts',
                    kn: 'ಅಧಿಸೂಚನೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ',
                    hi: 'सिस्टम अलर्ट चालू करें',
                    ta: 'அறிவிப்புகளை இயக்கு',
                    te: 'సిస్టమ్ హెచ్చరికలను ప్రారంభించండి',
                    mr: 'सिस्टम सूचना सुरू करा',
                  })}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => handleTestNotification('medicine')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Send immediate external test medicine reminder"
                >
                  <Pill className="w-3 h-3 text-emerald-600" />
                  <span>Test Medicine Alert</span>
                </button>
                <button
                  onClick={() => handleTestNotification('appointment')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Send immediate external test appointment reminder"
                >
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <span>Test Doctor Alert</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-5 pt-2 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button
            onClick={() => setActiveTab('medicines')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
              activeTab === 'medicines'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>
              {getLoc({
                en: 'Medicine Timers',
                kn: 'ಔಷಧಿ ಜ್ಞಾಪನೆಗಳು',
                hi: 'दवा रिमाइंडर',
                ta: 'மருந்து நினைவூட்டல்',
                te: 'మందుల రిమైండర్‌లు',
                mr: 'औषध स्मरणपत्रे',
              })}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              {medicines.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
              activeTab === 'appointments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>
              {getLoc({
                en: 'Doctor Visits',
                kn: 'ವೈದ್ಯರ ಭೇಟಿಗಳು',
                hi: 'डॉक्टर अपॉइंटमेंट',
                ta: 'மருத்துவர் வருகை',
                te: 'వైద్యుల సందర్శనలు',
                mr: 'डॉक्टर भेट',
              })}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vaccines')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
              activeTab === 'vaccines'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {getLoc({
                en: 'Vaccines & Camps',
                kn: 'ಲಸಿಕೆ ಮತ್ತು ಶಿಬಿರಗಳು',
                hi: 'टीकाकरण व शिविर',
                ta: 'தடுப்பூசி & முகாம்கள்',
                te: 'టీకాలు & శిబిరాలు',
                mr: 'लसीकरण व शिबिरे',
              })}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
              {DEFAULT_VACCINES.length}
            </span>
          </button>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/70 dark:bg-slate-950/50">

          {/* TAB 1: MEDICINE REMINDERS */}
          {activeTab === 'medicines' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {getLoc({
                      en: 'Daily Prescription Doses',
                      kn: 'ದೈನಂದಿನ ಔಷಧಿಯ ಡೋಸ್‌ಗಳು',
                      hi: 'दैनिक दवाओं की खुराक',
                      ta: 'தினசரி மருந்து அளவுகள்',
                      te: 'రోజువారీ మందుల మోతాదులు',
                      mr: 'दैनिक औषध मात्रा',
                    })}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {getLoc({
                      en: 'Toggle taken status and receive push alarms at dosage timings',
                      kn: 'ಔಷಧಿ ಸೇವಿಸಿದ ಸ್ಥಿತಿಯನ್ನು ಟಾಗಲ್ ಮಾಡಿ ಮತ್ತು ನಿಗದಿತ ಸಮಯದಲ್ಲಿ ಎಚ್ಚರಿಕೆ ಪಡೆಯಿರಿ',
                      hi: 'दवा लेने के बाद टिक करें और समय पर बाहरी अलार्म प्राप्त करें',
                      ta: 'மருந்து எடுத்ததை குறித்துக் கொள்ளுங்கள் மற்றும் சரியான நேரத்தில் எச்சரிக்கை பெறுங்கள்',
                      te: 'మందులు తీసుకున్న స్థితిని గుర్తించండి మరియు సమయానికి హెచ్చరికలను పొందండి',
                      mr: 'औषध घेतल्यावर खूण करा व वेळेवर अचूक सूचना मिळवा',
                    })}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingMed(!isAddingMed)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {getLoc({
                      en: 'Add Medicine',
                      kn: 'ಔಷಧಿಯನ್ನು ಸೇರಿಸಿ',
                      hi: 'दवा जोड़ें',
                      ta: 'மருந்து சேர்க்க',
                      te: 'మందును జోడించండి',
                      mr: 'औषध जोडा',
                    })}
                  </span>
                </button>
              </div>

              {/* Add Medicine Inline Form */}
              {isAddingMed && (
                <form
                  onSubmit={handleAddMedicine}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-lg space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5" />
                      {getLoc({
                        en: 'Schedule New Medicine Reminder',
                        kn: 'ಹೊಸ ಔಷಧಿ ಜ್ಞಾಪನೆಯನ್ನು ನಿಗದಿಪಡಿಸಿ',
                        hi: 'नया दवा रिमाइंडर सेट करें',
                        ta: 'புதிய மருந்து நினைவூட்டலை அமைக்கவும்',
                        te: 'కొత్త మందుల రిమైండర్‌ను సెట్ చేయండి',
                        mr: 'नवीन औषध स्मरणपत्र सेट करा',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingMed(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Medicine Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pantoprazole 40mg"
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Tablet / 5ml Syrup"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Time of Dose
                      </label>
                      <input
                        type="time"
                        required
                        value={newMedTime}
                        onChange={(e) => setNewMedTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Meal Instruction
                      </label>
                      <select
                        value={newMedMeal}
                        onChange={(e) => setNewMedMeal(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="after">After Food (जेवणानंतर / ಊಟದ ನಂತರ)</option>
                        <option value="before">Before Food (जेवणापूर्वी / ಊಟಕ್ಕೆ ಮುಂಚೆ)</option>
                        <option value="with">With Food (जेवणासोबत / ಊಟದೊಂದಿಗೆ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingMed(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      Save Reminder
                    </button>
                  </div>
                </form>
              )}

              {/* Medicine Cards List */}
              <div className="space-y-2.5">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                      med.isTakenToday
                        ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                        : med.isActive
                        ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTaken(med.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          med.isTakenToday
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                        }`}
                        title={med.isTakenToday ? 'Mark as Not Taken' : 'Mark as Taken Today'}
                      >
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-black truncate ${
                            med.isTakenToday
                              ? 'line-through text-slate-500 dark:text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {med.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                            {med.dosage}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {med.time}
                          </span>
                          <span>•</span>
                          <span>
                            {med.meal === 'after'
                              ? getLoc({ en: 'After Food', kn: 'ಊಟದ ನಂತರ', hi: 'भोजन के बाद', ta: 'உணவுக்குப் பின்', te: 'భోజనం తర్వాత', mr: 'जेवणानंतर' })
                              : med.meal === 'before'
                              ? getLoc({ en: 'Before Food', kn: 'ಊಟಕ್ಕೆ ಮುಂಚೆ', hi: 'भोजन से पहले', ta: 'உணவுக்கு முன்', te: 'భోజనానికి ముందు', mr: 'जेवणापूर्वी' })
                              : getLoc({ en: 'With Food', kn: 'ಊಟದೊಂದಿಗೆ', hi: 'भोजन के साथ', ta: 'உணவுடன்', te: 'భోజనంతో పాటు', mr: 'जेवणासोबत' })}
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">{med.frequency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleActiveMed(med.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          med.isActive
                            ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={med.isActive ? 'Mute Alert' : 'Unmute Alert'}
                      >
                        {med.isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeleteMed(med.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DOCTOR APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {getLoc({
                      en: 'Scheduled PHC & Hospital Visits',
                      kn: 'ನಿಗದಿತ ಪಿಎಚ್‌ಸಿ ಮತ್ತು ಆಸ್ಪತ್ರೆ ಭೇಟಿಗಳು',
                      hi: 'निर्धारित पीएचसी व अस्पताल मुलाक़ातें',
                      ta: 'திட்டமிடப்பட்ட ஆரம்ப சுகாதார நிலைய வருகைகள்',
                      te: 'షెడ్యూల్ చేయబడిన పీహెచ్‌సీ సందర్శనలు',
                      mr: 'नियोजित पीएचसी व रुग्णालय भेटी',
                    })}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {getLoc({
                      en: 'Get reminders 24h & 1h prior with required documents (ABHA ID, reports)',
                      kn: '24 ಗಂಟೆ ಮತ್ತು 1 ಗಂಟೆ ಮುಂಚಿತವಾಗಿ ಅಗತ್ಯ ದಾಖಲೆಗಳ ಜ್ಞಾಪನೆಗಳನ್ನು ಪಡೆಯಿರಿ',
                      hi: 'ज़रूरी कागजात (आभा आईडी) के साथ 24 घंटे और 1 घंटे पहले सीधे अलर्ट पाएं',
                      ta: '24 மணிநேரம் & 1 மணிநேரத்திற்கு முன்பே ஆவண நினைவூட்டல்களைப் பெறுங்கள்',
                      te: 'ముఖ్యమైన పత్రాలతో 24 గంటలు & 1 గంట ముందు హెచ్చరికలను పొందండి',
                      mr: 'आवश्यक कागदपत्रांसह (आभा कार्ड) २४ तास व १ तास आधी थेट स्मरणपत्र मिळवा',
                    })}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingApt(!isAddingApt)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {getLoc({
                      en: 'Add Visit',
                      kn: 'ಭೇಟಿಯನ್ನು ಸೇರಿಸಿ',
                      hi: 'विजिट जोड़ें',
                      ta: 'வருகை சேர்க்க',
                      te: 'సందర్శనను జోడించండి',
                      mr: 'भेट जोडा',
                    })}
                  </span>
                </button>
              </div>

              {/* Add Appointment Form */}
              {isAddingApt && (
                <form
                  onSubmit={handleAddAppointment}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500/40 shadow-lg space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {getLoc({
                        en: 'Add Doctor Appointment Reminder',
                        kn: 'ವೈದ್ಯರ ಭೇಟಿ ಜ್ಞಾಪನೆಯನ್ನು ಸೇರಿಸಿ',
                        hi: 'डॉक्टर अपॉइंटमेंट रिमाइंडर जोड़ें',
                        ta: 'மருத்துவர் சந்திப்பு நினைவூட்டல் சேர்க்க',
                        te: 'డాక్టర్ అపాయింట్‌మెంట్ రిమైండర్ జోడించండి',
                        mr: 'डॉक्टर भेट स्मरणपत्र जोडा',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingApt(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Doctor / Specialist Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Ramesh Kulkarni (Medical Officer)"
                        value={newAptDoctor}
                        onChange={(e) => setNewAptDoctor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Hospital / PHC Facility
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Primary Health Centre (PHC)"
                        value={newAptFacility}
                        onChange={(e) => setNewAptFacility(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Date of Visit
                      </label>
                      <input
                        type="date"
                        required
                        value={newAptDate}
                        onChange={(e) => setNewAptDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={newAptTime}
                        onChange={(e) => setNewAptTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Purpose of Visit / Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Blood Sugar Checkup & Prescription renewal"
                        value={newAptPurpose}
                        onChange={(e) => setNewAptPurpose(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingApt(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      Save Appointment
                    </button>
                  </div>
                </form>
              )}

              {/* Appointment Cards List */}
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-950/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {apt.doctor}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 font-bold mt-0.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{apt.facility}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {apt.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 sm:justify-end">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>{apt.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold">
                          {apt.time} AM/PM
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAppointment(apt.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Visit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VACCINES & HEALTH SCHEME CAMPS */}
          {activeTab === 'vaccines' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {getLoc({
                    en: 'National Health Mission Immunization Alerts',
                    kn: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಮಿಷನ್ ಲಸಿಕೆ ಎಚ್ಚರಿಕೆಗಳು',
                    hi: 'राष्ट्रीय स्वास्थ्य मिशन टीकाकरण अलर्ट',
                    ta: 'தேசிய சுகாதார இயக்கம் தடுப்பூசி விழிப்பூட்டல்கள்',
                    te: 'జాతీయ ఆరోగ్య మిషన్ టీకా హెచ్చరికలు',
                    mr: 'राष्ट्रीय आरोग्य अभियान लसीकरण सूचना',
                  })}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {getLoc({
                    en: 'Free government immunization drives at your Anganwadi and PHC',
                    kn: 'ನಿಮ್ಮ ಅಂಗನವಾಡಿ ಮತ್ತು ಪಿಎಚ್‌ಸಿಯಲ್ಲಿ ಉಚಿತ ಸರ್ಕಾರಿ ಲಸಿಕೆ ಅಭಿಯಾನ',
                    hi: 'आपकी आंगनवाड़ी और पीएचसी में निःशुल्क सरकारी टीकाकरण अभियान',
                    ta: 'உங்கள் அங்கன்வாடி மற்றும் ஆரம்ப சுகாதார நிலையத்தில் இலவச அரசு தடுப்பூசி முகாம்கள்',
                    te: 'మీ అంగన్‌వాడీ మరియు పీహెచ్‌సీలో ఉచిత ప్రభుత్వ టీకా డ్రైవ్‌లు',
                    mr: 'आपल्या अंगणवाडी व प्राथमिक आरोग्य केंद्रातील मोफत शासकीय लसीकरण मोहिमा',
                  })}
                </p>
              </div>

              <div className="space-y-3">
                {DEFAULT_VACCINES.map((vac) => (
                  <div
                    key={vac.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-950/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            vac.status === 'due'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
                          }`}>
                            {vac.status === 'due' ? 'Due Soon' : 'Upcoming'}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            For: {vac.beneficiary}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                          {vac.title}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                          {vac.dueDate}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                        {vac.facility}
                      </span>
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                        100% Free / विनामूल्य
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── FOOTER ── */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>National Health Mission · ABDM Citizen Care</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xl border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
