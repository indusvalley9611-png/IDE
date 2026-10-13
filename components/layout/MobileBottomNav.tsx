'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { canRegisterPatient } from '@/lib/patientPrivacyService';
import {
  Users,
  Search,
  Plus,
  Pill,
  Menu,
  Building2,
  Activity,
  FolderHeart,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeNavItem: string;
  onSelectNavItem: (itemId: string) => void;
  onOpenNewPatient?: () => void;
  onOpenSearch: () => void;
  onOpenStockLedger: () => void;
  onOpenMobileDrawer: () => void;
}

export function MobileBottomNav({
  activeNavItem,
  onSelectNavItem,
  onOpenNewPatient,
  onOpenSearch,
  onOpenStockLedger,
  onOpenMobileDrawer,
}: MobileBottomNavProps) {
  const { user, role } = useAuth();
  const { language } = useLanguage();
  const isMr = language === 'mr';

  const canCreate = canRegisterPatient(user);

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-200 safe-bottom"
    >
      <div className="grid grid-cols-5 h-15 max-w-md mx-auto items-center px-1">
        
        {/* 1. Directory / Dashboard Tab */}
        <button
          onClick={() => {
            const defaultItem = role === 'district_officer' ? 'overview' : role === 'specialist' ? 'incoming' : 'directory';
            onSelectNavItem(defaultItem);
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeNavItem === 'directory' || activeNavItem === 'overview' || activeNavItem === 'incoming' || activeNavItem === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold'
          }`}
        >
          {role === 'district_officer' ? (
            <Building2 className="w-5 h-5" />
          ) : role === 'specialist' ? (
            <Activity className="w-5 h-5" />
          ) : (
            <Users className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
            {role === 'district_officer'
              ? isMr ? 'नियंत्रण' : 'Control'
              : role === 'specialist'
              ? isMr ? 'ट्रायज' : 'Triage'
              : isMr ? 'समुदाय' : 'Patients'}
          </span>
        </button>

        {/* 2. Global Search Tab */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {isMr ? 'शोधा' : 'Search'}
          </span>
        </button>

        {/* 3. Center Action Button: Quick Register New Patient */}
        <div className="flex items-center justify-center">
          {canCreate && onOpenNewPatient ? (
            <button
              onClick={onOpenNewPatient}
              className="w-12 h-12 -mt-4 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-950/30 border-2 border-white dark:border-slate-900 cursor-pointer transition-transform"
              title={isMr ? 'नवीन रुग्ण नोंदवा' : 'Register New Patient'}
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={() => onSelectNavItem(role === 'district_officer' ? 'capacity' : 'medicine_requests')}
              className="flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors cursor-pointer"
            >
              <FolderHeart className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight">
                {isMr ? 'रेफरल' : 'Referral'}
              </span>
            </button>
          )}
        </div>

        {/* 4. Medicine Stock / Pharmacy */}
        <button
          onClick={onOpenStockLedger}
          className="flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors cursor-pointer"
        >
          <Pill className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {isMr ? 'औषधे' : 'Medicines'}
          </span>
        </button>

        {/* 5. More / Full Menu Drawer */}
        <button
          onClick={onOpenMobileDrawer}
          className="flex flex-col items-center justify-center py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {isMr ? 'मेनू' : 'Menu'}
          </span>
        </button>

      </div>
    </nav>
  );
}
