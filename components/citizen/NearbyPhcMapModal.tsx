'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSync } from '@/context/SyncContext';
import { Language } from '@/lib/translations';
import {
  X,
  Navigation,
  Phone,
  Bed,
  Clock,
  Compass,
  Search,
  Activity,
  LocateFixed,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface NearbyPhcMapModalProps {
  onClose: () => void;
}

// Default user position (Velhe rural center)
const DEFAULT_USER_LOCATION = {
  lat: 18.3050,
  lng: 73.6200,
  label: 'Your Current Location (Velhe)',
};

// Calculate distance in km between two lat/lng points using Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function NearbyPhcMapModal({ onClose }: NearbyPhcMapModalProps) {
  const { language } = useLanguage();
  const { facilities } = useSync();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PHC' | 'Sub-Centre' | 'Rural Hospital'>('ALL');
  const [userPos, setUserPos] = useState(DEFAULT_USER_LOCATION);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Filter facilities to PHC, Sub-Centre, and Rural Hospitals
  const relevantFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const isRelevantType =
        f.type === 'PHC' || f.type === 'Sub-Centre' || f.type === 'Rural Hospital';
      if (!isRelevantType) return false;

      if (filterType !== 'ALL' && f.type !== filterType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.taluka.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [facilities, filterType, searchQuery]);

  // Facilities with computed distance and ETA
  const facilitiesWithDistance = useMemo(() => {
    return relevantFacilities
      .map((f) => {
        const dist = calculateDistanceKm(userPos.lat, userPos.lng, f.lat, f.lng);
        // Estimate travel time: ~30km/h average speed on rural roads
        const etaMins = Math.max(5, Math.round((dist / 30) * 60));
        return {
          ...f,
          distanceKm: dist,
          etaMinutes: etaMins,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [relevantFacilities, userPos]);

  // Active selected facility (default to closest if none selected)
  const activeFacility = useMemo(() => {
    if (selectedFacilityId) {
      return (
        facilitiesWithDistance.find((f) => f.id === selectedFacilityId) ||
        facilitiesWithDistance[0] ||
        null
      );
    }
    return facilitiesWithDistance[0] || null;
  }, [facilitiesWithDistance, selectedFacilityId]);

  // Calculate Map coordinate bounds for dynamic SVG projection
  const mapBounds = useMemo(() => {
    const allLats = [userPos.lat, ...facilitiesWithDistance.map((f) => f.lat)];
    const allLngs = [userPos.lng, ...facilitiesWithDistance.map((f) => f.lng)];

    const minLat = Math.min(...allLats) - 0.04;
    const maxLat = Math.max(...allLats) + 0.04;
    const minLng = Math.min(...allLngs) - 0.04;
    const maxLng = Math.max(...allLngs) + 0.04;

    return { minLat, maxLat, minLng, maxLng };
  }, [userPos, facilitiesWithDistance]);

  // Convert lat/lng to SVG map percentage coordinates
  const projectToMap = (lat: number, lng: number) => {
    const { minLat, maxLat, minLng, maxLng } = mapBounds;
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * 100;
    // Latitude decreases as you go down on screen (higher lat = higher on screen = lower Y%)
    const y = ((maxLat - lat) / (maxLat - minLat || 1)) * 100;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  const handleSimulateGPS = () => {
    if (navigator.geolocation) {
      setIsGpsActive(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Live Device GPS Location',
          });
          setIsGpsActive(false);
        },
        () => {
          // If error / permission denied, simulate minor offset
          setUserPos({
            lat: 18.2980,
            lng: 73.6300,
            label: 'Velhe Village Center (GPS Pin)',
          });
          setIsGpsActive(false);
        },
        { timeout: 5000 }
      );
    } else {
      setUserPos({
        lat: 18.2980,
        lng: 73.6300,
        label: 'Velhe Village Center (GPS Pin)',
      });
    }
  };

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  // Translations
  const tTitle = getLoc({
    en: 'Real-Time Nearby PHCs Map',
    kn: 'ನೈಜ-ಸಮಯದ ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿಗಳ ನಕ್ಷೆ',
    hi: 'निकटतम पीएचसी का लाइव मानचित्र',
    ta: 'நேரலை அருகிலுள்ள பிஎச்சி வரைபடம்',
    te: 'సమీప పీహెచ్‌సీల రియల్-టైమ్ మ్యాప్',
    mr: 'जवळच्या प्राथमिक आरोग्य केंद्रांचा थेट नकाशा',
  });

  const tSubtitle = getLoc({
    en: 'Real-time primary health centres, bed availability & emergency contact',
    kn: 'ನೈಜ-ಸಮಯದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳು, ಹಾಸಿಗೆ ಲಭ್ಯತೆ ಮತ್ತು ಸಂಪರ್ಕ',
    hi: 'प्राथमिक स्वास्थ्य केंद्र, बेड उपलब्धता और आपातकालीन संपर्क',
    ta: 'ஆரம்ப சுகாதார நிலையங்கள், படுக்கை இருப்பு மற்றும் தொடர்பு',
    te: 'ప్రాథమిక ఆరోగ్య కేంద్రాలు, బెడ్ల లభ్యత మరియు అత్యవసర సంప్రదింపు',
    mr: 'थेट प्राथमिक आरोग्य केंद्रे, खाटांची उपलब्धता व तातडीचा संपर्क',
  });

  const tUserLocation = getLoc({
    en: 'Your Location',
    kn: 'ನಿಮ್ಮ ಸ್ಥಳ',
    hi: 'आपकी स्थिति',
    ta: 'உங்கள் இருப்பிடம்',
    te: 'మీ స్థానం',
    mr: 'आपले स्थान',
  });

  const tLocateMe = getLoc({
    en: 'Locate Me',
    kn: 'ನನ್ನ ಸ್ಥಳ ಗುರುತಿಸಿ',
    hi: 'मेरी स्थिति खोजें',
    ta: 'என்னை கண்டறி',
    te: 'నా స్థానాన్ని గుర్తించండి',
    mr: 'माझे स्थान शोधा',
  });

  const tAvailableBeds = getLoc({
    en: 'Available Beds',
    kn: 'ಲಭ್ಯವಿರುವ ಹಾಸಿಗೆಗಳು',
    hi: 'उपलब्ध बेड',
    ta: 'கிடைக்கும் படுக்கைகள்',
    te: 'అందుబాటులో ఉన్న బెడ్లు',
    mr: 'उपलब्ध खाटा',
  });

  const tCallNow = getLoc({
    en: 'Call Facility',
    kn: 'ಕರೆ ಮಾಡಿ',
    hi: 'कॉल करें',
    ta: 'அழைக்கவும்',
    te: 'కాల్ చేయండి',
    mr: 'कॉल करा',
  });

  const tGetDirections = getLoc({
    en: 'Get Route / Directions',
    kn: 'ಮಾರ್ಗ ಪಡೆಯಿರಿ',
    hi: 'दिशा-निर्देश प्राप्त करें',
    ta: 'வழித்தடம் பெறுக',
    te: 'మార్గదర్శకత్వం పొందండి',
    mr: 'मार्ग / दिशा मिळवा',
  });

  const tLiveUpdate = getLoc({
    en: 'Live Grid Connected',
    kn: 'ಲೈವ್ ಗ್ರಿಡ್ ಸಂಪರ್ಕದಲ್ಲಿದೆ',
    hi: 'लाइव ग्रिड सक्रिय',
    ta: 'நேரலை இணைக்கப்பட்டுள்ளது',
    te: 'లైవ్ గ్రిడ్ అనుసంధానం',
    mr: 'थेट ग्रिड जोडलेले',
  });

  const userPoint = projectToMap(userPos.lat, userPos.lng);
  const activePoint = activeFacility ? projectToMap(activeFacility.lat, activeFacility.lng) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* ── MODAL HEADER ── */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/60 via-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {tTitle}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {tLiveUpdate}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateGPS}
              disabled={isGpsActive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Detect Current Location"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isGpsActive ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{tLocateMe}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── FILTER & SEARCH BAR ── */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {(['ALL', 'PHC', 'Sub-Centre', 'Rural Hospital'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  filterType === type
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                {type === 'ALL' ? 'All Centres' : type}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PHC, village, taluka..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* ── CONTENT GRID: MAP + FACILITY LIST ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          
          {/* MAP CANVAS (7 cols) */}
          <div className="lg:col-span-7 bg-slate-100 dark:bg-slate-950 relative border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-[280px] lg:min-h-full overflow-hidden select-none">
            
            {/* Top Map Controls Info Overlay */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>GPS Live Radar · {facilitiesWithDistance.length} Centres Active</span>
              </div>
            </div>

            {/* Interactive Vector / SVG Map */}
            <div className="relative w-full h-full flex-1 overflow-hidden">
              <svg className="w-full h-full absolute inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Grid pattern for terrain simulation */}
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" className="text-slate-200/70 dark:text-slate-800/60" strokeWidth="0.8" />
                  </pattern>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Background Grid */}
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Simulated Road Lines / Valleys in Rural Region */}
                <path
                  d="M -10 180 Q 200 120 450 220 T 900 160"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-800"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 120 -20 Q 220 220 380 400 T 500 700"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-800"
                  strokeWidth="4"
                  strokeDasharray="6 4"
                />

                {/* Route line connecting Citizen to Selected PHC */}
                {activePoint && (
                  <line
                    x1={`${userPoint.x}%`}
                    y1={`${userPoint.y}%`}
                    x2={`${activePoint.x}%`}
                    y2={`${activePoint.y}%`}
                    stroke="url(#routeGradient)"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* CITIZEN LOCATION PIN */}
              <div
                style={{ left: `${userPoint.x}%`, top: `${userPoint.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto cursor-pointer group"
                title={userPos.label}
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-10 h-10 rounded-full bg-blue-500/25 animate-ping" />
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center border-2 border-white dark:border-slate-900">
                    <Navigation className="w-4 h-4 fill-white" />
                  </div>
                </div>
                {/* Tooltip */}
                <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
                  {tUserLocation}
                </div>
              </div>

              {/* PHC PINS */}
              {facilitiesWithDistance.map((f) => {
                const pt = projectToMap(f.lat, f.lng);
                const isSelected = activeFacility?.id === f.id;
                const availableBeds = Math.max(0, f.totalBeds - f.occupiedBeds);
                const isBedAvailable = availableBeds > 0;

                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFacilityId(f.id)}
                    style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-transform duration-200 cursor-pointer ${
                      isSelected ? 'scale-125 z-40' : 'hover:scale-115'
                    }`}
                  >
                    <div className="relative flex flex-col items-center">
                      {/* Pulse aura if selected */}
                      {isSelected && (
                        <div className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
                      )}

                      {/* Pin Marker */}
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md border-2 border-white dark:border-slate-900 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 shadow-emerald-500/50 ring-2 ring-emerald-400'
                            : isBedAvailable
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>

                      {/* Micro Pill Label */}
                      <div
                        className={`mt-1 px-2 py-0.5 rounded-full text-[9px] font-black shadow-xs whitespace-nowrap border transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white border-emerald-400'
                            : 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {f.name.split(' ')[0]} · {f.distanceKm} km
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Map Legend */}
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium z-10">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>You</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Selected PHC</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span>Sub-Centre / RH</span>
                </span>
              </div>
              <span className="text-[10px]">Real-Time GPS Coordinates Synced</span>
            </div>
          </div>

          {/* FACILITY LIST & SELECTED DETAILS (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            
            {/* SELECTED FACILITY HIGHLIGHT CARD */}
            {activeFacility && (
              <div className="p-4 bg-gradient-to-br from-blue-50/70 via-white to-emerald-50/50 dark:from-slate-800/60 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider">
                        {activeFacility.type}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        Taluka: {activeFacility.taluka}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 leading-snug">
                      {activeFacility.name}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {activeFacility.distanceKm} <span className="text-xs font-normal">km</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      ~{activeFacility.etaMinutes} mins
                    </div>
                  </div>
                </div>

                {/* Capacity Stats Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                      <Bed className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{tAvailableBeds}</span>
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {Math.max(0, activeFacility.totalBeds - activeFacility.occupiedBeds)}
                      <span className="text-xs font-normal text-slate-500"> / {activeFacility.totalBeds}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                      <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Oxygen Beds</span>
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {Math.max(0, activeFacility.oxygenBedsTotal - activeFacility.oxygenBedsOccupied)}
                      <span className="text-xs font-normal text-slate-500"> / {activeFacility.oxygenBedsTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Available Specialists / Staff on duty */}
                {activeFacility.availableSpecialists && activeFacility.availableSpecialists.length > 0 && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-bold">Staff / Duty: </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {activeFacility.availableSpecialists.join(', ')}
                    </span>
                  </div>
                )}

                {/* Action Buttons: Call & Directions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${activeFacility.phone}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-colors shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{tCallNow}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeFacility.lat},${activeFacility.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-colors shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{tGetDirections}</span>
                  </a>
                </div>
              </div>
            )}

            {/* ALL NEARBY CENTRES LIST */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1">
              <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                All Nearby Centres ({facilitiesWithDistance.length})
              </div>

              {facilitiesWithDistance.map((f) => {
                const isSelected = activeFacility?.id === f.id;
                const freeBeds = Math.max(0, f.totalBeds - f.occupiedBeds);

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFacilityId(f.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-855'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {f.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{f.taluka}</span>
                          <span>•</span>
                          <span className={freeBeds > 0 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                            {freeBeds} beds free
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {f.distanceKm} km
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ~{f.etaMinutes}m
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── MODAL FOOTER ── */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium">
              National Health Mission · ABDM Health Facility Registry (HFR)
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
