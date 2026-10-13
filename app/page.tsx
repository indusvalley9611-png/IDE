'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSync } from '@/context/SyncContext';
import { Role, Patient, Referral } from '@/lib/types';
import { AppShell } from '@/components/layout/AppShell';
import { SpecialistDashboard } from '@/components/dashboards/SpecialistDashboard';
import { DistrictCoordinationDashboard } from '@/components/dashboards/DistrictCoordinationDashboard';
import WorkerWorkspace from '@/components/directory/WorkerWorkspace';
import { NewPatientModal } from '@/components/ehr/NewPatientModal';
import { PatientTimelineModal } from '@/components/ehr/PatientTimelineModal';
import { AbhaCardModal } from '@/components/ehr/AbhaCardModal';
import { SmartReferralModal } from '@/components/referral/SmartReferralModal';
import { ReferralTokenModal } from '@/components/referral/ReferralTokenModal';
import { BedMatrixModal } from '@/components/inventory/BedMatrixModal';
import { DrugStockModal } from '@/components/inventory/DrugStockModal';
import { GlobalPatientSearchModal } from '@/components/ehr/GlobalPatientSearchModal';
import { StaffLoginModal } from '@/components/auth/StaffLoginModal';
import { PatientDownloadModal } from '@/components/auth/PatientDownloadModal';
import { AuditTrailModal } from '@/components/compliance/AuditTrailModal';
import { EmergencyHelpModal } from '@/components/emergency/EmergencyHelpModal';
import { LandingPitchPage } from '@/components/landing/LandingPitchPage';
import { SignInPortalPage } from '@/components/auth/SignInPortalPage';
import { MobileEntryPage } from '@/components/mobile/MobileEntryPage';
import { RuralCitizenPage } from '@/components/citizen/RuralCitizenPage';
import { SymptomChecker } from '@/components/ai/SymptomChecker';
import { Bot } from 'lucide-react';

export default function Home() {
  const { role, isAuthenticated, switchRole } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { referrals } = useSync();

  const [mounted, setMounted] = useState(false);

  // Modal states
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isBedMatrixOpen, setIsBedMatrixOpen] = useState(false);
  const [isDrugStockOpen, setIsDrugStockOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isSymptomCheckerOpen, setIsSymptomCheckerOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  // Unauthenticated view: 'pitch' (desktop page 1), 'signin' (page 2), 'mobile_entry' (mobile 2-option hub), or 'rural_citizen'
  const [unauthView, setUnauthView] = useState<'pitch' | 'signin' | 'mobile_entry' | 'rural_citizen'>('pitch');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && document.documentElement.classList.contains('dark'))) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    // ── Mobile Device / PWA Display Mode Detection ──
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
    const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 768;
    const isMobileUA = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const forceMobile = urlParams?.get('mode') === 'mobile';

    const mobileDetected = isStandalone || isMobileViewport || isMobileUA || forceMobile;
    setIsMobile(mobileDetected);

    // Default to the main Landing Pitch page so the user always sees the comprehensive landing page
    setUnauthView('pitch');

    const handleResize = () => {
      const isMobileNow = window.innerWidth < 768 || window.matchMedia('(display-mode: standalone)').matches;
      setIsMobile(isMobileNow);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const [selectedLoginRole, setSelectedLoginRole] = useState<Role | 'patient' | undefined>(undefined);
  const [timelinePatient, setTimelinePatient] = useState<Patient | null>(null);
  const [abhaCardPatient, setAbhaCardPatient] = useState<Patient | null>(null);
  const [referralPatient, setReferralPatient] = useState<Patient | null>(null);
  const [referralToken, setReferralToken] = useState<Referral | null>(null);

  // Active navigation view managed across left sidebar and main content
  const getDefaultNavItem = (r?: Role) => {
    if (r === 'district_officer') return 'overview';
    if (r === 'specialist') return 'incoming';
    if (r === 'phc_doctor') return 'directory';
    if (r === 'nurse') return 'directory';
    if (r === 'pharmacist') return 'dashboard';
    if (r === 'asha') return 'directory';
    return 'directory';
  };

  const [activeNavItem, setActiveNavItem] = useState<string>('directory');

  useEffect(() => {
    if (role) {
      setActiveNavItem(getDefaultNavItem(role));
    }
  }, [role]);

  const renderAiAssistantTrigger = () => (
    <>
      <button
        onClick={() => setIsSymptomCheckerOpen(true)}
        className="fixed bottom-5 right-5 z-[80] flex items-center gap-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 active:scale-95 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all border border-teal-400/40 text-xs sm:text-sm font-semibold"
        aria-label="Open AI Health Assistant"
        title="AI Symptom Checker & Clinical Triage"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold tracking-wide">AI Health Assistant</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
      </button>

      {isSymptomCheckerOpen && (
        <SymptomChecker onClose={() => setIsSymptomCheckerOpen(false)} />
      )}
    </>
  );

  if (!mounted) {
    return null;
  }

  // ── UNAUTHENTICATED STATE: SPLIT BETWEEN MOBILE ENTRY, PAGE 1 (PITCH), PAGE 2 (SIGN IN) & RURAL CITIZEN ──
  if (!isAuthenticated || !role) {
    // 0. RURAL CITIZEN PUBLIC HEALTH PORTAL (Standalone Offline-First Citizen Hub)
    if (unauthView === 'rural_citizen') {
      return (
        <RuralCitizenPage
          onBack={() => setUnauthView(isMobile ? 'mobile_entry' : 'signin')}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      );
    }

    // 1. MOBILE/PWA ENTRY: 2-Option Screen (Emergency & Sign In)
    if (isMobile && unauthView === 'mobile_entry') {
      return (
        <>
          <MobileEntryPage
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onNavigateToSignIn={() => setUnauthView('signin')}
            onNavigateToRuralCitizen={() => setUnauthView('rural_citizen')}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          {isEmergencyOpen && (
            <EmergencyHelpModal onClose={() => setIsEmergencyOpen(false)} />
          )}
          {renderAiAssistantTrigger()}
        </>
      );
    }

    // 2. DESKTOP PAGE 1: Landing Pitch / Marketing & Stats
    if (unauthView === 'pitch') {
      return (
        <>
          <LandingPitchPage
            onNavigateToSignIn={() => setUnauthView('signin')}
            onSelectRole={(r) => {
              setSelectedLoginRole(r as Role | 'patient');
              setIsLoginModalOpen(true);
            }}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
          {isLoginModalOpen && selectedLoginRole !== 'patient' && (
            <StaffLoginModal 
              onClose={() => {
                setIsLoginModalOpen(false);
                setSelectedLoginRole(undefined);
              }}
              initialRole={selectedLoginRole}
            />
          )}
          {isLoginModalOpen && selectedLoginRole === 'patient' && (
            <PatientDownloadModal onClose={() => setIsLoginModalOpen(false)} />
          )}
          {isEmergencyOpen && (
            <EmergencyHelpModal onClose={() => setIsEmergencyOpen(false)} />
          )}
          {renderAiAssistantTrigger()}
        </>
      );
    }

    // 3. PAGE 2: Sign In Portal (Role Selection & Patient EHR ABHA)
    return (
      <>
        <SignInPortalPage
          onSelectRole={(r) => {
            setSelectedLoginRole(r as Role | 'patient');
            setIsLoginModalOpen(true);
          }}
          onSelectRuralCitizen={() => setUnauthView('rural_citizen')}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onNavigateToPitch={() => {
            if (isMobile) {
              setUnauthView('mobile_entry');
            } else {
              setUnauthView('pitch');
            }
          }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Auth Modals */}
        {isLoginModalOpen && selectedLoginRole !== 'patient' && (
          <StaffLoginModal 
            onClose={() => {
              setIsLoginModalOpen(false);
              setSelectedLoginRole(undefined);
            }}
            initialRole={selectedLoginRole}
          />
        )}
        {isLoginModalOpen && selectedLoginRole === 'patient' && (
          <PatientDownloadModal onClose={() => setIsLoginModalOpen(false)} />
        )}
        {isEmergencyOpen && (
          <EmergencyHelpModal onClose={() => setIsEmergencyOpen(false)} />
        )}
        {renderAiAssistantTrigger()}
      </>
    );
  }

  // ── DASHBOARD VIEW FOR LOGGED-IN USERS ──
  return (
    <AppShell
      activeNavItem={activeNavItem}
      onSelectNavItem={(item) => {
        setActiveNavItem(item);
        if (item === 'audit') {
          setIsAuditTrailOpen(true);
        }
      }}
      onOpenNewPatient={() => setIsNewPatientOpen(true)}
      onOpenSearch={() => setIsGlobalSearchOpen(true)}
      onOpenBedMatrix={() => setIsBedMatrixOpen(true)}
      onOpenStockLedger={() => setIsDrugStockOpen(true)}
      onOpenAuditLogs={() => setIsAuditTrailOpen(true)}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
    >
      {role === 'district_officer' && (
        <DistrictCoordinationDashboard
          onOpenBedMatrix={() => setIsBedMatrixOpen(true)}
          onOpenStockLedger={() => setIsDrugStockOpen(true)}
          onOpenAuditLogs={() => setIsAuditTrailOpen(true)}
          onOpenPatientTimeline={(patient) => setTimelinePatient(patient)}
          onOpenReferralToken={(ref) => setReferralToken(ref)}
          activeTab={activeNavItem as any}
          onTabChange={(tab) => setActiveNavItem(tab)}
        />
      )}

      {role === 'specialist' && (
        <SpecialistDashboard
          onOpenReferralToken={(ref) => setReferralToken(ref)}
          onOpenPatientTimeline={(patient) => setTimelinePatient(patient)}
          onOpenBedMatrix={() => setIsBedMatrixOpen(true)}
          onOpenNewPatient={() => setIsNewPatientOpen(true)}
          activeTab={activeNavItem as any}
          onTabChange={(tab) => setActiveNavItem(tab)}
        />
      )}

      {(role === 'asha' || role === 'phc_doctor' || role === 'nurse' || role === 'pharmacist') && (
        <WorkerWorkspace
          role={role as any}
          activeSubView={
            activeNavItem === 'dashboard'
              ? 'dashboard'
              : activeNavItem === 'medicine_requests'
              ? 'medicine_requests'
              : activeNavItem === 'medicine_inventory'
              ? 'medicine_inventory'
              : 'directory'
          }
          onSubViewChange={(subView) => setActiveNavItem(subView)}
          onOpenNewPatient={() => setIsNewPatientOpen(true)}
          onOpenPatientTimeline={(patient) => setTimelinePatient(patient)}
          onOpenAbhaCard={(patient) => setAbhaCardPatient(patient)}
          onOpenReferral={(patient) => setReferralPatient(patient)}
          onOpenReferralToken={(ref) => setReferralToken(ref)}
        />
      )}

      {/* Shared Dashboard Modals */}
      {isNewPatientOpen && (
        <NewPatientModal
          onClose={() => setIsNewPatientOpen(false)}
          onSuccess={(newPatient) => {
            setTimelinePatient(newPatient);
          }}
        />
      )}

      {isGlobalSearchOpen && (
        <GlobalPatientSearchModal
          onClose={() => setIsGlobalSearchOpen(false)}
          onOpenPatientTimeline={(patient) => setTimelinePatient(patient)}
          onOpenAbhaCard={(patient) => setAbhaCardPatient(patient)}
          onOpenReferral={(patient) => setReferralPatient(patient)}
        />
      )}

      {timelinePatient && (
        <PatientTimelineModal
          patient={timelinePatient}
          onClose={() => setTimelinePatient(null)}
          onOpenAbhaCard={(patient) => setAbhaCardPatient(patient)}
          onOpenReferral={(patient) => setReferralPatient(patient)}
        />
      )}

      {abhaCardPatient && (
        <AbhaCardModal
          patient={abhaCardPatient}
          onClose={() => setAbhaCardPatient(null)}
        />
      )}

      {referralPatient && (
        <SmartReferralModal
          patient={referralPatient}
          onClose={() => setReferralPatient(null)}
          onReferralCreated={(newRef) => {
            setReferralPatient(null);
            setReferralToken(newRef);
          }}
        />
      )}

      {referralToken && (
        <ReferralTokenModal
          referral={referralToken}
          onClose={() => setReferralToken(null)}
        />
      )}

      {isBedMatrixOpen && (
        <BedMatrixModal onClose={() => setIsBedMatrixOpen(false)} />
      )}

      {isDrugStockOpen && (
        <DrugStockModal onClose={() => setIsDrugStockOpen(false)} />
      )}

      {isAuditTrailOpen && (
        <AuditTrailModal onClose={() => setIsAuditTrailOpen(false)} />
      )}

      {renderAiAssistantTrigger()}
    </AppShell>
  );
}
