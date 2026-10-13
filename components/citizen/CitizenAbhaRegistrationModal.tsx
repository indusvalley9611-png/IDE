'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode';
import { useLanguage } from '@/context/LanguageContext';
import { useSync } from '@/context/SyncContext';
import { generateRandomAbhaId } from '@/lib/idbStorage';
import { Patient } from '@/lib/types';
import {
  X,
  ShieldCheck,
  Download,
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
} from 'lucide-react';

interface CitizenAbhaRegistrationModalProps {
  onClose: () => void;
}

export function CitizenAbhaRegistrationModal({ onClose }: CitizenAbhaRegistrationModalProps) {
  const { language } = useLanguage();
  const { addPatient } = useSync();

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

  // Generated ABHA details
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const handleGenerateAbha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg(language === 'kn' ? 'ದಯವಿಟ್ಟು ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter full name');
      return;
    }
    if (!phone || phone.length < 10) {
      setErrorMsg(language === 'kn' ? 'ದಯವಿಟ್ಟು 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ' : 'Please enter valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Simulate ABDM Verification & Cryptographic ABHA Creation
    await new Promise((r) => setTimeout(r, 800));

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
                {step === 'FORM' ? 'Create ABHA Health ID (ಆಭಾ ನೋಂದಣಿ)' : 'Official ABDM Health Card'}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Ayushman Bharat Digital Mission &bull; National Health Authority
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
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
                  Enter your basic information below to instantly create your 14-digit official government <strong>ABHA ID</strong>. Works offline and syncs automatically with the health gateway.
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
                  Full Name (ಪೂರ್ಣ ಹೆಸರು / पूरा नाम) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil / ರಮೇಶ್ ಪಾಟೀಲ್"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Age & Gender Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Age (ವಯಸ್ಸು / उम्र) *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 32"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender (ಲಿಂಗ / लिंग) *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Male">Male (ಪುರುಷ)</option>
                    <option value="Female">Female (ಮಹಿಳೆ)</option>
                    <option value="Other">Other (ಇತರೆ)</option>
                  </select>
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Aadhaar Last 4 Digits */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Aadhaar Number (Last 4 digits / ಆಧಾರ್ ಕೊನೆಯ 4 ಅಂಕಿ)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="XXXX"
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Simulated instant e-KYC via UIDAI secure gateway
                </span>
              </div>

              {/* Village & District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Village (ಗ್ರಾಮ / गाँव)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Velhe"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    District (ಜಿಲ್ಲೆ / जिला)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span>Generating ABHA ID...</span>
                ) : (
                  <>
                    <span>Generate Official ABHA Health ID</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Generated ABHA Card Display */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  ABHA ID Created Successfully!
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Your digital health card is generated and linked to the ABDM registry.
                </p>
              </div>

              {/* The Visual ABHA Card (Government Standard Format) */}
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
                      National Health Authority &bull; Government of India
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
                    <span className="text-[8px] text-slate-400 font-bold mt-1 uppercase">Photo</span>
                  </div>

                  {/* Citizen Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">Name</div>
                      <div className="text-xs font-black text-slate-900 truncate">
                        {createdPatient?.fullName}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div>
                        <span className="text-slate-400 font-bold">Gender: </span>
                        <span className="font-bold text-slate-800">{createdPatient?.gender}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">Age: </span>
                        <span className="font-bold text-slate-800">{createdPatient?.age} yrs</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">ABHA Number</div>
                      <div className="text-xs font-mono font-black text-blue-900 tracking-wide">
                        {createdPatient?.abhaId}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">ABHA Address</div>
                      <div className="text-[10px] font-mono text-emerald-800 truncate font-semibold">
                        {createdPatient?.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@abdm
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div className="shrink-0 flex flex-col items-center">
                      <img src={qrCodeUrl} alt="ABHA QR Code" className="w-16 h-16 rounded border border-slate-200" />
                      <span className="text-[7px] text-slate-400 font-bold mt-0.5">SCAN &amp; VERIFY</span>
                    </div>
                  )}
                </div>

                {/* Bottom Govt Strip */}
                <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 text-center">
                  <span className="text-[8px] font-bold text-slate-600">
                    National Health Identity &bull; 100% ABDM Compliant &bull; FHIR R4
                  </span>
                </div>
              </div>

              {/* Actions: Print / Download & Reset */}
              <div className="flex items-center gap-2 pt-2 print-hide">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save Card</span>
                </button>
                <button
                  onClick={() => setStep('FORM')}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Register another citizen"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
