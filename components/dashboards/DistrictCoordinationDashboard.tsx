'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { StockTransfer, Facility } from '@/lib/types';
import { Language } from '@/lib/translations';
import {
  Tablets,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  ArrowLeftRight,
  Building2,
  ShieldCheck,
  X,
  Package,
  RefreshCw,
  Send,
  Check,
  AlertOctagon,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface DistrictCoordinationDashboardProps {
  onOpenBedMatrix?: () => void;
  onOpenStockLedger?: () => void;
  onOpenAuditLogs?: () => void;
  onOpenPatientTimeline?: (patient: any) => void;
  onOpenReferralToken?: (referral: any) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

type TransferFilterTab =
  | 'ALL'
  | 'PHC_TO_DISTRICT'
  | 'DISTRICT_TO_PHC'
  | 'PENDING'
  | 'DISPATCHED'
  | 'COMPLETED'
  | 'CRITICAL';

export function DistrictCoordinationDashboard({
  onOpenBedMatrix,
  onOpenStockLedger,
}: DistrictCoordinationDashboardProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const {
    stockTransfers,
    facilities,
    stocks,
    processStockTransfer,
    createStockTransfer,
  } = useSync();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  // Local state
  const [filterTab, setFilterTab] = useState<TransferFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhcFilter, setSelectedPhcFilter] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [activeDispatchItem, setActiveDispatchItem] = useState<StockTransfer | null>(null);
  const [activeRejectItem, setActiveRejectItem] = useState<StockTransfer | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [dispatchTransportMode, setDispatchTransportMode] = useState<
    'DISTRICT_MEDICAL_COURIER' | '108_AMBULANCE' | 'FACILITY_TRANSPORT' | 'POLICE_GREEN_CORRIDOR'
  >('DISTRICT_MEDICAL_COURIER');
  const [dispatchConsignmentCode, setDispatchConsignmentCode] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form State for New Transfer
  const [newDirection, setNewDirection] = useState<'PHC_TO_DISTRICT' | 'DISTRICT_TO_PHC'>('PHC_TO_DISTRICT');
  const [newSourcePhcId, setNewSourcePhcId] = useState('');
  const [newMedicineName, setNewMedicineName] = useState('Anti-Snake Venom (ASV Polyvalent Lyophilized)');
  const [newQuantity, setNewQuantity] = useState<number>(20);
  const [newUrgency, setNewUrgency] = useState<'ROUTINE' | 'URGENT' | 'CRITICAL'>('URGENT');
  const [newTransportMode, setNewTransportMode] = useState<
    'DISTRICT_MEDICAL_COURIER' | '108_AMBULANCE' | 'FACILITY_TRANSPORT' | 'POLICE_GREEN_CORRIDOR'
  >('DISTRICT_MEDICAL_COURIER');
  const [newReason, setNewReason] = useState('Medicine buffer rebalance and transfer from Primary Health Centre to District Central Warehouse.');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const currentDistrict = user?.district || 'Bengaluru Urban';

  // Get list of PHC facilities
  const phcFacilities = useMemo(() => {
    const phcs = facilities.filter((f) => f.type === 'PHC' || f.type === 'Sub-Centre');
    if (phcs.length > 0) return phcs;
    return facilities;
  }, [facilities]);

  // District Hospital / Central Warehouse facility
  const districtCentralFacility = useMemo(() => {
    const dh = facilities.find((f) => f.type === 'District Hospital' || f.type === 'Rural Hospital');
    if (dh) return dh;
    return {
      id: 'fac-dh-central',
      name: `${currentDistrict} District Central Medical Warehouse`,
      type: 'District Hospital',
    } as Facility;
  }, [facilities, currentDistrict]);

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    let list = stockTransfers || [];

    // Filter by tab
    if (filterTab === 'PHC_TO_DISTRICT') {
      list = list.filter((t) => {
        const dest = (t.destinationFacilityName || '').toLowerCase();
        const src = (t.sourceFacilityName || '').toLowerCase();
        return (dest.includes('district') || dest.includes('hospital') || dest.includes('warehouse')) ||
          (src.includes('phc') || src.includes('primary') || src.includes('centre'));
      });
    } else if (filterTab === 'DISTRICT_TO_PHC') {
      list = list.filter((t) => {
        const src = (t.sourceFacilityName || '').toLowerCase();
        const dest = (t.destinationFacilityName || '').toLowerCase();
        return (src.includes('district') || src.includes('hospital') || src.includes('warehouse')) ||
          (dest.includes('phc') || dest.includes('primary') || dest.includes('centre'));
      });
    } else if (filterTab === 'PENDING') {
      list = list.filter((t) => t.status === 'PENDING' || t.status === 'PENDING_SOURCE_APPROVAL');
    } else if (filterTab === 'DISPATCHED') {
      list = list.filter((t) => t.status === 'DISPATCHED');
    } else if (filterTab === 'COMPLETED') {
      list = list.filter((t) => t.status === 'COMPLETED');
    } else if (filterTab === 'CRITICAL') {
      list = list.filter((t) => t.urgency === 'CRITICAL' || t.isEmergency);
    }

    // Filter by specific PHC
    if (selectedPhcFilter !== 'ALL') {
      list = list.filter(
        (t) => t.sourceFacilityId === selectedPhcFilter || t.destinationFacilityId === selectedPhcFilter
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.medicineName.toLowerCase().includes(q) ||
          t.sourceFacilityName.toLowerCase().includes(q) ||
          t.destinationFacilityName.toLowerCase().includes(q) ||
          (t.consignmentCode || '').toLowerCase().includes(q) ||
          (t.reason || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [stockTransfers, filterTab, selectedPhcFilter, searchQuery]);

  // KPI Metrics
  const kpis = useMemo(() => {
    const all = stockTransfers || [];
    const pending = all.filter((t) => t.status === 'PENDING' || t.status === 'PENDING_SOURCE_APPROVAL').length;
    const dispatched = all.filter((t) => t.status === 'DISPATCHED').length;
    const completed = all.filter((t) => t.status === 'COMPLETED').length;
    const critical = all.filter((t) => t.urgency === 'CRITICAL' || t.isEmergency).length;

    return {
      total: all.length,
      pending,
      dispatched,
      completed,
      critical,
    };
  }, [stockTransfers]);

  // Handle Approve
  const handleApprove = async (transferId: string) => {
    setIsActionLoading(true);
    try {
      const success = await processStockTransfer(transferId, 'APPROVE');
      if (success) {
        showToast(getLoc({
          en: `Transfer ${transferId} approved successfully. Ready for dispatch.`,
          kn: `ವರ್ಗಾವಣೆ ${transferId} ಯಶಸ್ವಿಯಾಗಿ ಅನುಮೋದಿಸಲಾಗಿದೆ. ರವಾನೆಗೆ ಸಿದ್ಧವಾಗಿದೆ.`,
          hi: `हस्तांतरण ${transferId} सफलतापूर्वक स्वीकृत। डिस्पैच के लिए तैयार।`,
          ta: `பரிமாற்றம் ${transferId} வெற்றிகரமாக அங்கீகரிக்கப்பட்டது.`,
          te: `బదిలీ ${transferId} విజయవంతంగా ఆమోదించబడింది.`,
          mr: `हस्तांतरण ${transferId} यशस्वीरित्या मंजूर करण्यात आले.`,
        }));
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open Dispatch Modal
  const handleOpenDispatch = (item: StockTransfer) => {
    setActiveDispatchItem(item);
    setDispatchConsignmentCode(`CONS-${Date.now().toString().slice(-6)}`);
    setDispatchTransportMode(item.transportMode || 'DISTRICT_MEDICAL_COURIER');
  };

  // Submit Dispatch
  const handleConfirmDispatch = async () => {
    if (!activeDispatchItem) return;
    setIsActionLoading(true);
    try {
      const success = await processStockTransfer(activeDispatchItem.id, 'DISPATCH', undefined, {
        consignmentCode: dispatchConsignmentCode || `CONS-${Date.now().toString().slice(-6)}`,
        transportMode: dispatchTransportMode,
        dispatchedByUserName: user?.name || 'District Medical Logistics Officer',
      });
      if (success) {
        showToast(getLoc({
          en: `Consignment ${dispatchConsignmentCode} dispatched via ${dispatchTransportMode.replace(/_/g, ' ')}.`,
          kn: `ಸರಕು ರವಾನಿಸಲಾಗಿದೆ: ${dispatchConsignmentCode}.`,
          hi: `कंसाइनमेंट ${dispatchConsignmentCode} डिस्पैच किया गया।`,
          ta: `சரக்கு ${dispatchConsignmentCode} அனுப்பப்பட்டது.`,
          te: `రవాణా ${dispatchConsignmentCode} పంపబడింది.`,
          mr: `कन्साइनमेंट ${dispatchConsignmentCode} रवाना करण्यात आले.`,
        }));
        setActiveDispatchItem(null);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  // Confirm Receipt at District
  const handleConfirmReceive = async (transferId: string) => {
    setIsActionLoading(true);
    try {
      const success = await processStockTransfer(transferId, 'RECEIVE', undefined, {
        receivedByUserName: user?.name || 'District Warehouse Superintendent',
      });
      if (success) {
        showToast(getLoc({
          en: `Transfer ${transferId} received at District Warehouse. Stock inventories updated!`,
          kn: `ವರ್ಗಾವಣೆ ${transferId} ಜಿಲ್ಲಾ ಉಗ್ರಾಣದಲ್ಲಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ದಾಸ್ತಾನು ನವೀಕರಿಸಲಾಗಿದೆ!`,
          hi: `हस्तांतरण ${transferId} जिला गोदाम में प्राप्त। स्टॉक अपडेट किया गया!`,
          ta: `பரிமாற்றம் ${transferId} மாவட்ட கிடங்கில் பெறப்பட்டது. சரக்கு இருப்பு புதுப்பிக்கப்பட்டது!`,
          te: `బదిలీ ${transferId} జిల్లా గిడ్డంగిలో స్వీకరించబడింది. స్టాక్ అప్‌డేట్ చేయబడింది!`,
          mr: `हस्तांतरण ${transferId} जिल्हा गोदामात प्राप्त झाले व साठा अद्यतनित झाला!`,
        }));
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Reject Modal
  const handleOpenReject = (item: StockTransfer) => {
    setActiveRejectItem(item);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!activeRejectItem || !rejectReason.trim()) return;
    setIsActionLoading(true);
    try {
      const success = await processStockTransfer(activeRejectItem.id, 'REJECT', rejectReason);
      if (success) {
        showToast(getLoc({
          en: `Transfer ${activeRejectItem.id} rejected. Reason logged.`,
          kn: `ವರ್ಗಾವಣೆ ${activeRejectItem.id} ತಿರಸ್ಕರಿಸಲಾಗಿದೆ. ಕಾರಣ ದಾಖಲಿಸಲಾಗಿದೆ.`,
          hi: `हस्तांतरण ${activeRejectItem.id} अस्वीकृत। कारण दर्ज किया गया।`,
          ta: `பரிமாற்றம் ${activeRejectItem.id} நிராகரிக்கப்பட்டது.`,
          te: `బదిలీ ${activeRejectItem.id} తిరస్కరించబడింది.`,
          mr: `हस्तांतरण ${activeRejectItem.id} नाकारण्यात आले.`,
        }));
        setActiveRejectItem(null);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  // Submit New Transfer
  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceFacility = phcFacilities.find((f) => f.id === newSourcePhcId) || phcFacilities[0];
    if (!sourceFacility) return;

    const sourceName = newDirection === 'PHC_TO_DISTRICT' ? sourceFacility.name : districtCentralFacility.name;
    const sourceId = newDirection === 'PHC_TO_DISTRICT' ? sourceFacility.id : districtCentralFacility.id;
    const destName = newDirection === 'PHC_TO_DISTRICT' ? districtCentralFacility.name : sourceFacility.name;
    const destId = newDirection === 'PHC_TO_DISTRICT' ? districtCentralFacility.id : sourceFacility.id;

    const created = createStockTransfer({
      medicineName: newMedicineName,
      sourceStockId: `stk-${sourceId}-01`,
      destinationStockId: `stk-${destId}-01`,
      sourceFacilityId: sourceId,
      sourceFacilityName: sourceName,
      destinationFacilityId: destId,
      destinationFacilityName: destName,
      requestedQuantity: Number(newQuantity) || 10,
      urgency: newUrgency,
      reason: newReason,
      isEmergency: newUrgency === 'CRITICAL',
      transportMode: newTransportMode,
      consignmentCode: `CONS-TRF-${Date.now().toString().slice(-5)}`,
    });

    if (created) {
      showToast(getLoc({
        en: `New Medicine Transfer initiated: ${newMedicineName} (${newQuantity} units).`,
        kn: `ಹೊಸ ಔಷಧಿ ವರ್ಗಾವಣೆ ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ: ${newMedicineName} (${newQuantity} ಯೂನಿಟ್‌ಗಳು).`,
        hi: `नया दवा हस्तांतरण शुरू किया गया: ${newMedicineName} (${newQuantity} यूनिट)।`,
        ta: `புதிய மருந்து பரிமாற்றம் தொடங்கப்பட்டது: ${newMedicineName} (${newQuantity} அலகுகள்).`,
        te: `కొత్త ఔషధ బదిలీ ప్రారంభించబడింది: ${newMedicineName} (${newQuantity} యూనిట్లు).`,
        mr: `नवीन औषध हस्तांतरण सुरू झाले: ${newMedicineName} (${newQuantity} युनिट).`,
      }));
      setIsNewTransferOpen(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-16">
      
      {/* ── TOAST NOTIFICATION ── */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* ── 1. DISTRICT MEDICINE HEADER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Tablets className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {getLoc({
                  en: 'DISTRICT HEALTH CONTROL',
                  kn: 'ಜಿಲ್ಲಾ ಆರೋಗ್ಯ ನಿಯಂತ್ರಣ',
                  hi: 'जिला स्वास्थ्य नियंत्रण',
                  ta: 'மாவட்ட சுகாதார கட்டுப்பாடு',
                  te: 'జిల్లా ఆరోగ్య నియంత్రణ',
                  mr: 'जिल्हा आरोग्य नियंत्रण',
                })}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{getLoc({
                  en: 'PHC Supply Grid Active',
                  kn: 'ಪಿಎಚ್‌ಸಿ ಪೂರೈಕೆ ಜಾಲ ಸಕ್ರಿಯ',
                  hi: 'पीएचसी आपूर्ति ग्रिड सक्रिय',
                  ta: 'பிஎச்சி விநியோக கட்டமைப்பு செயலில் உள்ளது',
                  te: 'పీహెచ్‌సీ సరఫరా గ్రిడ్ యాక్టివ్',
                  mr: 'पीएचसी पुरवठा ग्रिड सक्रिय',
                })}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              {getLoc({
                en: `${currentDistrict} · PHC to District Medicine Transfers`,
                kn: `${currentDistrict} · ಪಿಎಚ್‌ಸಿಯಿಂದ ಜಿಲ್ಲಾ ಔಷಧಿ ವರ್ಗಾವಣೆಗಳು`,
                hi: `${currentDistrict} · पीएचसी से जिला दवा हस्तांतरण`,
                ta: `${currentDistrict} · பிஎச்சியிலிருந்து மாவட்ட மருந்து பரிமாற்றங்கள்`,
                te: `${currentDistrict} · పీహెచ్‌సీ నుండి జిల్లా ఔషధ బదిలీలు`,
                mr: `${currentDistrict} · पीएचसी ते जिल्हा औषध हस्तांतरण`,
              })}
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              {getLoc({
                en: 'Direct management of all medicine consignments, requisitions, and cold-chain transfers between Primary Health Centres and the District Central Warehouse.',
                kn: 'ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳು ಮತ್ತು ಜಿಲ್ಲಾ ಕೇಂದ್ರ ಉಗ್ರಾಣದ ನಡುವಿನ ಎಲ್ಲಾ ಔಷಧಿ ರವಾನೆಗಳು ಮತ್ತು ವರ್ಗಾವಣೆಗಳ ನೇರ ನಿರ್ವಹಣೆ.',
                hi: 'प्राथमिक स्वास्थ्य केंद्रों और जिला केंद्रीय गोदाम के बीच सभी दवा कंसाइनमेंट और हस्तांतरण का प्रत्यक्ष प्रबंधन।',
                ta: 'ஆரம்ப சுகாதார நிலையங்களுக்கும் மாவட்ட மத்திய கிடங்கிற்கும் இடையிலான அனைத்து மருந்து பரிமாற்றங்களின் நேரடி மேலாண்மை.',
                te: 'ప్రాథమిక ఆరోగ్య కేంద్రాలు మరియు జిల్లా కేంద్ర గిడ్డంగి మధ్య అన్ని ఔషధ బదిలీల ప్రత్యక్ష నిర్వహణ.',
                mr: 'प्राथमिक आरोग्य केंद्रे व जिल्हा मध्यवर्ती गोदामामधील सर्व औषध हस्तांतरणांचे थेट व्यवस्थापन.',
              })}
            </p>
          </div>
        </div>

        {/* Action Button: Create New Transfer */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => setIsNewTransferOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{getLoc({
              en: 'Initiate Medicine Transfer',
              kn: 'ಔಷಧಿ ವರ್ಗಾವಣೆ ಪ್ರಾರಂಭಿಸಿ',
              hi: 'दवा हस्तांतरण शुरू करें',
              ta: 'மருந்து பரிமாற்றத்தை தொடங்கு',
              te: 'ఔషధ బదిలీని ప్రారంభించండి',
              mr: 'नवीन औषध हस्तांतरण सुरू करा',
            })}</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI METRICS CARDS (FOCUSED 100% ON MEDICINE TRANSFERS) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Transfers */}
        <div
          onClick={() => setFilterTab('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterTab === 'ALL'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {getLoc({ en: 'Total Transfers', kn: 'ಒಟ್ಟು ವರ್ಗಾವಣೆಗಳು', hi: 'कुल हस्तांतरण', ta: 'மொத்த பரிமாற்றங்கள்', te: 'మొత్తం బదిలీలు', mr: 'एकूण हस्तांतरण' })}
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            {kpis.total}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {getLoc({ en: 'Across all health centres', kn: 'ಎಲ್ಲಾ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳಲ್ಲಿ', hi: 'सभी केंद्रों में', ta: 'அனைத்து மையங்களிலும்', te: 'అన్ని కేంద్రాలలో', mr: 'सर्व केंद्रांमध्ये' })}
          </p>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => setFilterTab('PENDING')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterTab === 'PENDING'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {getLoc({ en: 'Pending Approval', kn: 'ಅನುಮೋದನೆ ಬಾಕಿ', hi: 'स्वीकृति लंबित', ta: 'ஒப்புதல் நிலுவை', te: 'ఆమోదం పెండింగ్', mr: 'मंजुरी प्रलंबित' })}
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
            {kpis.pending}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {getLoc({ en: 'Awaiting DHO authorization', kn: 'DHO ಅನುಮೋದನೆ ನಿರೀಕ್ಷೆಯಲ್ಲಿದೆ', hi: 'डीएचओ अनुमोदन की प्रतीक्षा', ta: 'DHO ஒப்புதலுக்காக காத்திருக்கிறது', te: 'DHO ఆమోదం కోసం వేచి ఉంది', mr: 'DHO मंजुरीची प्रतीक्षा' })}
          </p>
        </div>

        {/* In-Transit (Dispatched) */}
        <div
          onClick={() => setFilterTab('DISPATCHED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterTab === 'DISPATCHED'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              {getLoc({ en: 'In Transit', kn: 'ರವಾನೆಯಲ್ಲಿರುವವು', hi: 'मार्ग में (डिस्पैच)', ta: 'வழியில் உள்ளது', te: 'రవాణాలో ఉంది', mr: 'मार्गावर (रवाना)' })}
            </span>
            <Truck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1.5">
            {kpis.dispatched}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {getLoc({ en: 'Couriers & 108 Ambulances', kn: 'ಕೊರಿಯರ್ ಮತ್ತು 108 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗಳು', hi: 'कूरियर और 108 एम्बुलेंस', ta: 'கூரியர் மற்றும் 108 ஆம்புலன்ஸ்', te: 'కొరియర్ మరియు 108 అంబులెన్స్', mr: 'कुरिअर व 108 रुग्णवाहिका' })}
          </p>
        </div>

        {/* Completed / Received */}
        <div
          onClick={() => setFilterTab('COMPLETED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            filterTab === 'COMPLETED'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {getLoc({ en: 'Received at District', kn: 'ಜಿಲ್ಲೆಯಲ್ಲಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ', hi: 'जिले में प्राप्त', ta: 'மாவட்டத்தில் பெறப்பட்டது', te: 'జిల్లాలో స్వీకరించబడింది', mr: 'जिल्ह्यात प्राप्त' })}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {kpis.completed}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {getLoc({ en: 'Stock verified in ledger', kn: 'ದಾಸ್ತಾನು ಲೆಕ್ಕದಲ್ಲಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ', hi: 'स्टॉक सत्यापित किया गया', ta: 'சரக்கு சரிபார்க்கப்பட்டது', te: 'స్టాక్ ధృవీకరించబడింది', mr: 'साठा नोंदवहीत नोंदवला' })}
          </p>
        </div>

        {/* Critical Emergency */}
        <div
          onClick={() => setFilterTab('CRITICAL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs col-span-2 lg:col-span-1 ${
            filterTab === 'CRITICAL'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              {getLoc({ en: 'Critical Lifesaving', kn: 'ತುರ್ತು ಜೀವರಕ್ಷಕ', hi: 'आपातकालीन जीवनरक्षक', ta: 'முக்கிய அவசர மருந்துகள்', te: 'అత్యవసర ప్రాణరక్షక', mr: 'तातडीची जीवरक्षक औषधे' })}
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5">
            {kpis.critical}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {getLoc({ en: 'ASV, ARV, & Obstetric drugs', kn: 'ASV, ARV, ಹೆರಿಗೆ ಔಷಧಗಳು', hi: 'एआरवी, एएसवी, प्रसूति दवाएं', ta: 'ஏஎஸ்வி, ஏஆர்வி மருந்துகள்', te: 'ఏఎస్‌వీ, ఏఆర్‌వీ మందులు', mr: 'ASV, ARV व प्रसूती औषधे' })}
          </p>
        </div>
      </div>

      {/* ── 3. FILTER, TABS & SEARCH BAR ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { id: 'ALL', label: getLoc({ en: 'All Transfers', kn: 'ಎಲ್ಲಾ ವರ್ಗಾವಣೆಗಳು', hi: 'सभी हस्तांतरण', ta: 'அனைத்து பரிமாற்றங்கள்', te: 'అన్ని బదిలీలు', mr: 'सर्व हस्तांतरण' }) },
              { id: 'PHC_TO_DISTRICT', label: getLoc({ en: 'PHC ➔ District', kn: 'ಪಿಎಚ್‌ಸಿ ➔ ಜಿಲ್ಲಾ', hi: 'पीएचसी ➔ जिला', ta: 'பிஎச்சி ➔ மாவட்டம்', te: 'పీహెచ్‌సీ ➔ జిల్లా', mr: 'पीएचसी ➔ जिल्हा' }) },
              { id: 'DISTRICT_TO_PHC', label: getLoc({ en: 'District ➔ PHC', kn: 'ಜಿಲ್ಲಾ ➔ ಪಿಎಚ್‌ಸಿ', hi: 'जिला ➔ पीएचसी', ta: 'மாவட்டம் ➔ பிஎச்சி', te: 'జిల్లా ➔ పీహెచ్‌సీ', mr: 'जिल्हा ➔ पीएचसी' }) },
              { id: 'PENDING', label: getLoc({ en: 'Pending', kn: 'ಬಾಕಿ ಉಳಿದವು', hi: 'लंबित', ta: 'நிலுவை', te: 'పెండింగ్', mr: 'प्रलंबित' }) },
              { id: 'DISPATCHED', label: getLoc({ en: 'In Transit', kn: 'ರವಾನೆಯಲ್ಲಿರುವವು', hi: 'डिस्पैच', ta: 'வழியில்', te: 'రవాణాలో', mr: 'रवाना' }) },
              { id: 'COMPLETED', label: getLoc({ en: 'Received', kn: 'ಸ್ವೀಕರಿಸಿದವು', hi: 'प्राप्त', ta: 'பெறப்பட்டது', te: 'స్వీకరించబడింది', mr: 'प्राप्त' }) },
              { id: 'CRITICAL', label: getLoc({ en: 'Emergency', kn: 'ತುರ್ತು', hi: 'आपातकालीन', ta: 'அவசரம்', te: 'అత్యవసరం', mr: 'तातडीचे' }) },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as TransferFilterTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getLoc({
                en: 'Search medicine, PHC name, consignment...',
                kn: 'ಔಷಧಿ, ಪಿಎಚ್‌ಸಿ ಹೆಸರು, ಸರಕು ಹುಡುಕಿ...',
                hi: 'दवा, पीएचसी का नाम, कंसाइनमेंट खोजें...',
                ta: 'மருந்து, பிஎச்சி பெயர், சரக்கு எண் தேடவும்...',
                te: 'మందు, పీహెచ్‌సీ పేరు, రవాణా కోడ్ శోధించండి...',
                mr: 'औषध, पीएचसी नाव, कन्साइनमेंट शोधा...',
              })}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

        </div>
      </div>

      {/* ── 4. MEDICINE TRANSFERS LIST ── */}
      <div className="space-y-3">
        {filteredTransfers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
              {getLoc({
                en: 'No Medicine Transfers Found',
                kn: 'ಯಾವುದೇ ಔಷಧಿ ವರ್ಗಾವಣೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
                hi: 'कोई दवा हस्तांतरण नहीं मिला',
                ta: 'மருந்து பரிமாற்றங்கள் எதுவும் இல்லை',
                te: 'ఎటువంటి ఔషధ బదిలీలు కనుగొనబడలేదు',
                mr: 'कोणतेही औषध हस्तांतरण आढळले नाही',
              })}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {getLoc({
                en: 'No active medicine shipments match the selected filters. Use the button above to initiate a new transfer.',
                kn: 'ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಯಾವುದೇ ಸಕ್ರಿಯ ರವಾನೆಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ.',
                hi: 'चयनित फ़िल्टर से मेल खाता कोई सक्रिय शिपमेंट नहीं है। नया हस्तांतरण शुरू करने के लिए ऊपर दिए गए बटन का उपयोग करें।',
                ta: 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுக்கு பொருந்தும் ஏற்றுமதிகள் எதுவும் இல்லை.',
                te: 'ఎంచుకున్న ఫిల్టర్‌లకు సరిపోలే రవాణాలు లేవు.',
                mr: 'निवडलेल्या निकषांनुसार कोणतेही हस्तांतरण उपलब्ध नाही.',
              })}
            </p>
          </div>
        ) : (
          filteredTransfers.map((item) => {
            const isCritical = item.urgency === 'CRITICAL' || item.isEmergency;
            const isPending = item.status === 'PENDING' || item.status === 'PENDING_SOURCE_APPROVAL';
            const isApproved = item.status === 'APPROVED';
            const isDispatched = item.status === 'DISPATCHED';
            const isCompleted = item.status === 'COMPLETED';
            const isRejected = item.status === 'REJECTED';

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:shadow-md ${
                  isCritical
                    ? 'border-rose-200 dark:border-rose-900/60 bg-gradient-to-r from-rose-50/20 via-white to-white dark:from-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Details */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Urgency Badge */}
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                          isCritical
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                            : item.urgency === 'URGENT'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                        }`}
                      >
                        {item.urgency}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : isDispatched
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-300 dark:border-purple-800 animate-pulse'
                            : isApproved
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                            : isRejected
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {isDispatched && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />}
                        <span>{item.status.replace(/_/g, ' ')}</span>
                      </span>

                      {/* Consignment Code */}
                      {item.consignmentCode && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.consignmentCode}
                        </span>
                      )}

                      {/* Created At */}
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto lg:ml-0">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </span>
                    </div>

                    {/* Medicine Name & Quantity */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {item.medicineName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black border border-blue-200 dark:border-blue-800">
                        {item.requestedQuantity} Units / Vials
                      </span>
                    </div>

                    {/* Route: Source PHC ➔ Destination District */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 flex-wrap">
                      <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{item.sourceFacilityName}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{item.destinationFacilityName}</span>
                      </div>
                    </div>

                    {/* Reason & Transport notes */}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.reason}
                    </p>

                    {item.transportMode && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5 font-medium">
                        <Truck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Mode: <strong className="text-slate-700 dark:text-slate-200">{item.transportMode.replace(/_/g, ' ')}</strong></span>
                        {item.dispatchedByUserName && <span>&bull; By: {item.dispatchedByUserName}</span>}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Operational Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 flex-wrap">
                    
                    {/* 1. APPROVE BUTTON (When Pending) */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={isActionLoading}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{getLoc({ en: 'Approve Transfer', kn: 'ವರ್ಗಾವಣೆ ಅನುಮೋದಿಸಿ', hi: 'हस्तांतरण स्वीकृत करें', ta: 'அங்கீகரி', te: 'ఆమోదించండి', mr: 'मंजूर करा' })}</span>
                        </button>

                        <button
                          onClick={() => handleOpenReject(item)}
                          disabled={isActionLoading}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
                        >
                          <span>{getLoc({ en: 'Reject', kn: 'ತಿರಸ್ಕರಿಸಿ', hi: 'अस्वीकार', ta: 'நிராகரி', te: 'తిరస్కరించు', mr: 'नाकारा' })}</span>
                        </button>
                      </>
                    )}

                    {/* 2. DISPATCH BUTTON (When Approved) */}
                    {isApproved && (
                      <button
                        onClick={() => handleOpenDispatch(item)}
                        disabled={isActionLoading}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{getLoc({ en: 'Dispatch Consignment', kn: 'ಸರಕು ರವಾನಿಸಿ', hi: 'कंसाइनमेंट डिस्पैच करें', ta: 'சரக்கு அனுப்புக', te: 'రవాణాను పంపండి', mr: 'कन्साइनमेंट रवाना करा' })}</span>
                      </button>
                    )}

                    {/* 3. CONFIRM RECEIPT (When Dispatched) */}
                    {isDispatched && (
                      <button
                        onClick={() => handleConfirmReceive(item.id)}
                        disabled={isActionLoading}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{getLoc({ en: 'Confirm Receipt at District', kn: 'ಜಿಲ್ಲೆಯಲ್ಲಿ ಸ್ವೀಕೃತಿ ದೃಢೀಕರಿಸಿ', hi: 'जिले में प्राप्ति की पुष्टि करें', ta: 'வரவை உறுதிசெய்', te: 'స్వీకృతిని నిర్ధారించండి', mr: 'जिल्ह्यात पावती निश्चित करा' })}</span>
                      </button>
                    )}

                    {/* 4. COMPLETED BADGE */}
                    {isCompleted && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{getLoc({ en: 'Verified in District Stock', kn: 'ಜಿಲ್ಲಾ ದಾಸ್ತಾನಿನಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ', hi: 'जिला स्टॉक में सत्यापित', ta: 'மாவட்ட இருப்பில் சரிபார்க்கப்பட்டது', te: 'జిల్లా స్టాక్‌లో ధృవీకరించబడింది', mr: 'जिल्हा साठ्यात पडताळणी पूर्ण' })}</span>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 5. MODAL: INITIATE NEW MEDICINE TRANSFER ── */}
      {isNewTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <Tablets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {getLoc({
                      en: 'Initiate PHC ⇄ District Transfer',
                      kn: 'ಪಿಎಚ್‌ಸಿ ⇄ ಜಿಲ್ಲಾ ವರ್ಗಾವಣೆ ಪ್ರಾರಂಭಿಸಿ',
                      hi: 'पीएचसी ⇄ जिला हस्तांतरण शुरू करें',
                      ta: 'பிஎச்சி ⇄ மாவட்ட பரிமாற்றத்தை தொடங்கு',
                      te: 'పీహెచ్‌సీ ⇄ జిల్లా బదిలీని ప్రారంభించండి',
                      mr: 'पीएचसी ⇄ जिल्हा औषध हस्तांतरण सुरू करा',
                    })}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    National Health Mission &bull; Drug Inventory Redistribution
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTransferOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateTransfer} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Transfer Direction */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {getLoc({ en: 'Transfer Direction', kn: 'ವರ್ಗಾವಣೆ ದಿಕ್ಕು', hi: 'हस्तांतरण दिशा', ta: 'பரிமாற்ற திசை', te: 'బదిలీ దిశ', mr: 'हस्तांतरण दिशा' })}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewDirection('PHC_TO_DISTRICT')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDirection === 'PHC_TO_DISTRICT'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>PHC ➔ District</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDirection('DISTRICT_TO_PHC')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDirection === 'DISTRICT_TO_PHC'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>District ➔ PHC</span>
                  </button>
                </div>
              </div>

              {/* PHC Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {newDirection === 'PHC_TO_DISTRICT'
                    ? getLoc({ en: 'Source Primary Health Centre (PHC)', kn: 'ಮೂಲ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC)', hi: 'स्रोत प्राथमिक स्वास्थ्य केंद्र (PHC)', ta: 'மூல ஆரம்ப சுகாதார நிலையம்', te: 'మూల ప్రాథమిక ఆరోగ్య కేంద్రం', mr: 'मूळ प्राथमिक आरोग्य केंद्र' })
                    : getLoc({ en: 'Target Primary Health Centre (PHC)', kn: 'ಗುರಿ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC)', hi: 'गंतव्य प्राथमिक स्वास्थ्य केंद्र (PHC)', ta: 'இலக்கு ஆரம்ப சுகாதார நிலையம்', te: 'లక్ష్య ప్రాథమిక ఆరోగ్య కేంద్రం', mr: 'गंतव्य प्राथमिक आरोग्य केंद्र' })}
                </label>
                <select
                  value={newSourcePhcId}
                  onChange={(e) => setNewSourcePhcId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{getLoc({ en: 'Select Health Centre...', kn: 'ಆರೋಗ್ಯ ಕೇಂದ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ...', hi: 'स्वास्थ्य केंद्र चुनें...', ta: 'மையத்தை தேர்வுசெய்க...', te: 'కేంద్రాన్ని ఎంచుకోండి...', mr: 'आरोग्य केंद्र निवडा...' })}</option>
                  {phcFacilities.map((phc) => (
                    <option key={phc.id} value={phc.id}>
                      {phc.name} ({phc.taluka || phc.district || 'PHC'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Medicine Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {getLoc({ en: 'Medicine Item', kn: 'ಔಷಧಿ ಹೆಸರು', hi: 'दवा का नाम', ta: 'மருந்தின் பெயர்', te: 'మందు పేరు', mr: 'औषधाचे नाव' })}
                </label>
                <select
                  value={newMedicineName}
                  onChange={(e) => setNewMedicineName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Anti-Snake Venom (ASV Polyvalent Lyophilized)">Anti-Snake Venom (ASV Polyvalent Lyophilized)</option>
                  <option value="Anti-Rabies Vaccine (ARV Purified Vero Cell)">Anti-Rabies Vaccine (ARV Purified Vero Cell)</option>
                  <option value="Oxytocin Injection IP (10 IU/ml)">Oxytocin Injection IP (10 IU/ml)</option>
                  <option value="Atropine Sulfate 0.6mg/ml">Atropine Sulfate 0.6mg/ml</option>
                  <option value="Ceftriaxone Sodium 1g Vial">Ceftriaxone Sodium 1g Vial</option>
                  <option value="Paracetamol 500mg IP (Blister pack)">Paracetamol 500mg IP (Blister pack)</option>
                  <option value="Metformin 500mg Tab">Metformin 500mg Tab</option>
                </select>
              </div>

              {/* Quantity & Urgency Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {getLoc({ en: 'Quantity (Units)', kn: 'ಪ್ರಮಾಣ (ಯೂನಿಟ್‌ಗಳು)', hi: 'मात्रा (यूनिट)', ta: 'அளவு (அலகுகள்)', te: 'పరిమాణం (యూనిట్లు)', mr: 'प्रमाण (युनिट)' })}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {getLoc({ en: 'Urgency Level', kn: 'ತುರ್ತು ಮಟ್ಟ', hi: 'प्राथमिकता स्तर', ta: 'அவசர நிலை', te: 'ప్రాధాన్యత స్థాయి', mr: 'प्राधान्य पातळी' })}
                  </label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="URGENT">Urgent</option>
                    <option value="CRITICAL">Critical (Emergency)</option>
                  </select>
                </div>
              </div>

              {/* Transport Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {getLoc({ en: 'Logistics Transport Mode', kn: 'ಸಾರಿಗೆ ವಿಧಾನ', hi: 'परिवहन साधन', ta: 'போக்குவரத்து முறை', te: 'రవాణా విధానం', mr: 'वाहतूक साधन' })}
                </label>
                <select
                  value={newTransportMode}
                  onChange={(e) => setNewTransportMode(e.target.value as any)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DISTRICT_MEDICAL_COURIER">District Medical Courier (Cold-Chain Van)</option>
                  <option value="108_AMBULANCE">108 Emergency Ambulance (Priority Dispatch)</option>
                  <option value="FACILITY_TRANSPORT">PHC / Sub-Centre Facility Transport</option>
                  <option value="POLICE_GREEN_CORRIDOR">Police Green Corridor (Ultra Critical)</option>
                </select>
              </div>

              {/* Reason / Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {getLoc({ en: 'Clinical Justification & Reason', kn: 'ಕಾರಣ ಮತ್ತು ವಿವರಣೆ', hi: 'कारण और विवरण', ta: 'காரணம் மற்றும் குறிப்பு', te: 'కారణం మరియు గమనిక', mr: 'औचित्य व कारण' })}
                </label>
                <textarea
                  rows={2}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTransferOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {getLoc({ en: 'Cancel', kn: 'ರದ್ದುಮಾಡಿ', hi: 'रद्द करें', ta: 'ரத்துசெய்', te: 'రద్దు చేయండి', mr: 'रद्द करा' })}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  {getLoc({ en: 'Authorize & Submit Transfer', kn: 'ವರ್ಗಾವಣೆ ದೃಢೀಕರಿಸಿ', hi: 'हस्तांतरण अधिकृत करें', ta: 'அங்கீகரித்து சமர்ப்பி', te: 'ధృవీకరించి సమర్పించండి', mr: 'अधिकृत करून सादर करा' })}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── 6. MODAL: DISPATCH CONSIGNMENT ── */}
      {activeDispatchItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {getLoc({ en: 'Dispatch Consignment', kn: 'ಸರಕು ರವಾನಿಸಿ', hi: 'कंसाइनमेंट डिस्पैच करें', ta: 'சரக்கு அனுப்பு', te: 'రవాణాను పంపండి', mr: 'कन्साइनमेंट रवाना करा' })}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeDispatchItem.medicineName} ({activeDispatchItem.requestedQuantity} Units)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDispatchItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {getLoc({ en: 'Consignment Tracking Code', kn: 'ಟ್ರ್ಯಾಕಿಂಗ್ ಕೋಡ್', hi: 'ट्रैकिंग कोड', ta: 'கண்காணிப்பு குறியீடு', te: 'ట్రాకింగ్ కోడ్', mr: 'ट्रॅकिंग कोड' })}
              </label>
              <input
                type="text"
                value={dispatchConsignmentCode}
                onChange={(e) => setDispatchConsignmentCode(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {getLoc({ en: 'Courier / Vehicle Mode', kn: 'ವಾಹನ ವಿಧಾನ', hi: 'वाहन साधन', ta: 'வாகன முறை', te: 'వాహన విధానం', mr: 'वाहन साधन' })}
              </label>
              <select
                value={dispatchTransportMode}
                onChange={(e) => setDispatchTransportMode(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="DISTRICT_MEDICAL_COURIER">District Medical Courier (Cold-Chain Van)</option>
                <option value="108_AMBULANCE">108 Emergency Ambulance (Priority)</option>
                <option value="FACILITY_TRANSPORT">PHC Facility Vehicle</option>
                <option value="POLICE_GREEN_CORRIDOR">Police Green Corridor</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveDispatchItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {getLoc({ en: 'Cancel', kn: 'ರದ್ದುಮಾಡಿ', hi: 'रद्द करें', ta: 'ரத்து', te: 'రద్దు', mr: 'रद्द' })}
              </button>
              <button
                onClick={handleConfirmDispatch}
                disabled={isActionLoading}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md cursor-pointer"
              >
                {getLoc({ en: 'Confirm Dispatch', kn: 'ರವಾನೆ ದೃಢೀಕರಿಸಿ', hi: 'डिस्पैच पुष्टि करें', ta: 'அனுப்புதலை உறுதிசெய்', te: 'డిస్పాచ్ నిర్ధారించండి', mr: 'रवाना निश्चित करा' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. MODAL: REJECT REASON ── */}
      {activeRejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-rose-600 dark:text-rose-400">
                {getLoc({ en: 'Reject Transfer Request', kn: 'ವರ್ಗಾವಣೆ ತಿರಸ್ಕರಿಸಿ', hi: 'हस्तांतरण अनुरोध अस्वीकार करें', ta: 'பரிமாற்றத்தை நிராகரி', te: 'బదిలీని తిరస్కరించండి', mr: 'हस्तांतरण नाकारा' })}
              </h3>
              <button
                onClick={() => setActiveRejectItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {getLoc({ en: 'Mandatory Reason for Rejection', kn: 'ತಿರಸ್ಕಾರಕ್ಕೆ ಕಡ್ಡಾಯ ಕಾರಣ', hi: 'अस्वीकृति का कारण', ta: 'நிராகரிப்புக்கான காரணம்', te: 'తిరస్కరణకు కారణం', mr: 'नाकारण्याचे कारण' })}
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={getLoc({
                  en: 'E.g., Insufficient source buffer stock, batch expiration check failed...',
                  kn: 'ಉದಾಹರಣೆಗೆ, ಸಾಕಷ್ಟು ದಾಸ್ತಾನು ಇಲ್ಲ...',
                  hi: 'उदा. स्रोत स्टॉक अपर्याप्त है...',
                  ta: 'உதாரணமாக, போதிய இருப்பு இல்லை...',
                  te: 'ఉదాహరణకు, తగినంత స్టాక్ లేదు...',
                  mr: 'उदा. मूळ साठा अपुरा आहे...',
                })}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveRejectItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {getLoc({ en: 'Cancel', kn: 'ರದ್ದು', hi: 'रद्द', ta: 'ரத்து', te: 'రద్దు', mr: 'रद्द' })}
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isActionLoading || !rejectReason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
              >
                {getLoc({ en: 'Confirm Rejection', kn: 'ತಿರಸ್ಕಾರ ದೃಢೀಕರಿಸಿ', hi: 'अस्वीकृति की पुष्टि करें', ta: 'நிராகரிப்பை உறுதிசெய்', te: 'తిరస్కరణ నిర్ధారించండి', mr: 'नाकारणे निश्चित करा' })}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
