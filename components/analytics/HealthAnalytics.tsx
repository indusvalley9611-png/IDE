'use client';

import React, { useState, useEffect, useId } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  BarChart3,
  Bed,
  Building2,
  HeartPulse,
  Minus,
  PieChart,
  Pill,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

export interface HealthAnalyticsProps {
  onClose: () => void;
}

// ── Types for Datasets ──
interface PatientVisitDay {
  day: string;
  fullDay: string;
  date: string;
  visits: number;
  emergency: number;
  opd: number;
}

interface ReferralSlice {
  id: string;
  label: string;
  sublabel: string;
  percentage: number;
  count: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
}

interface FacilityOccupancy {
  id: string;
  name: string;
  type: string;
  totalBeds: number;
  occupiedBeds: number;
  percentage: number;
  icuTotal: number;
  icuOccupied: number;
  status: 'Critical' | 'High Demand' | 'Optimal' | 'Available';
  statusColor: string;
  barColor: string;
}

interface DiseaseTrend {
  id: string;
  name: string;
  marathiName: string;
  category: 'Vector-Borne' | 'Communicable' | 'NCD / Chronic' | 'Maternal Care';
  cases: number;
  trend: 'up' | 'down' | 'stable';
  changePct: string;
  history: number[];
  color: string;
  gradientId: string;
  actionProtocol: string;
  severity: 'high' | 'medium' | 'routine';
}

export function HealthAnalytics({ onClose }: HealthAnalyticsProps) {
  const chartId = useId();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7D' | '14D' | '30D'>('7D');
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [activeDonutIndex, setActiveDonutIndex] = useState<number | null>(null);
  const [activeDiseaseId, setActiveDiseaseId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  // ── 1. Summary Cards Data ──
  const summaryMetrics = [
    {
      id: 'patients',
      title: 'Total Patients Registered',
      value: '1,247',
      change: '+12% this week',
      changeType: 'positive' as const,
      subtext: '45 avg. daily consultations',
      icon: Users,
      color: 'blue',
      borderColor: 'border-blue-200 dark:border-blue-800/60',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'referrals',
      title: 'Active Referrals',
      value: '23',
      change: '8 critical',
      changeType: 'critical' as const,
      subtext: '15 in-transit / evaluated',
      icon: ArrowRightLeft,
      color: 'rose',
      borderColor: 'border-rose-200 dark:border-rose-800/60',
      bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'occupancy',
      title: 'Bed Occupancy',
      value: '73%',
      change: 'trending up',
      changeType: 'warning' as const,
      subtext: '702 / 962 total cluster beds',
      icon: Bed,
      color: 'amber',
      borderColor: 'border-amber-200 dark:border-amber-800/60',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'stocks',
      title: 'Drug Stock Alerts',
      value: '5',
      change: '5 critical items',
      changeType: 'alert' as const,
      subtext: 'Buffer breaches requiring refill',
      icon: Pill,
      color: 'emerald',
      borderColor: 'border-emerald-200 dark:border-emerald-800/60',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    },
  ];

  // ── 2. Patient Flow 7 Days Data ──
  const patientFlowData: PatientVisitDay[] = [
    { day: 'Mon', fullDay: 'Monday', date: 'Oct 07', visits: 45, emergency: 8, opd: 37 },
    { day: 'Tue', fullDay: 'Tuesday', date: 'Oct 08', visits: 52, emergency: 11, opd: 41 },
    { day: 'Wed', fullDay: 'Wednesday', date: 'Oct 09', visits: 38, emergency: 5, opd: 33 },
    { day: 'Thu', fullDay: 'Thursday', date: 'Oct 10', visits: 61, emergency: 14, opd: 47 },
    { day: 'Fri', fullDay: 'Friday', date: 'Oct 11', visits: 55, emergency: 9, opd: 46 },
    { day: 'Sat', fullDay: 'Saturday', date: 'Oct 12', visits: 42, emergency: 7, opd: 35 },
    { day: 'Sun', fullDay: 'Sunday', date: 'Oct 13', visits: 28, emergency: 4, opd: 24 },
  ];

  const totalWeeklyVisits = patientFlowData.reduce((acc, curr) => acc + curr.visits, 0);
  const avgWeeklyVisits = Math.round(totalWeeklyVisits / patientFlowData.length);
  const maxVisits = Math.max(...patientFlowData.map((d) => d.visits));

  // ── 3. Referral Priority Distribution ──
  const referralData: ReferralSlice[] = [
    {
      id: 'red',
      label: 'RED Priority',
      sublabel: 'Immediate / Critical (0-15 min)',
      percentage: 15,
      count: 4,
      color: '#ef4444',
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-600 dark:text-rose-400',
      accentBorder: 'border-rose-500/30',
    },
    {
      id: 'yellow',
      label: 'YELLOW Priority',
      sublabel: 'Urgent Referral (within 2h)',
      percentage: 45,
      count: 10,
      color: '#f59e0b',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-600 dark:text-amber-400',
      accentBorder: 'border-amber-500/30',
    },
    {
      id: 'green',
      label: 'GREEN Priority',
      sublabel: 'Routine Care / Stable',
      percentage: 40,
      count: 9,
      color: '#10b981',
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      accentBorder: 'border-emerald-500/30',
    },
  ];

  // ── 4. Facility Bed Occupancy Data ──
  const facilitiesData: FacilityOccupancy[] = [
    {
      id: 'dh_aundh',
      name: 'District Hospital Aundh',
      type: 'Secondary Referral Care',
      totalBeds: 250,
      occupiedBeds: 205,
      percentage: 82,
      icuTotal: 24,
      icuOccupied: 20,
      status: 'High Demand',
      statusColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
      barColor: 'from-amber-500 to-orange-500',
    },
    {
      id: 'sassoon',
      name: 'Sassoon General Hospital',
      type: 'Tertiary Medical College',
      totalBeds: 500,
      occupiedBeds: 455,
      percentage: 91,
      icuTotal: 50,
      icuOccupied: 47,
      status: 'Critical',
      statusColor: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30',
      barColor: 'from-rose-500 to-red-600',
    },
    {
      id: 'bhor_rh',
      name: 'Bhor Rural Hospital',
      type: 'Sub-District Facility',
      totalBeds: 80,
      occupiedBeds: 36,
      percentage: 45,
      icuTotal: 8,
      icuOccupied: 3,
      status: 'Optimal',
      statusColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      barColor: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'velhe_phc',
      name: 'Velhe Primary Health Centre',
      type: 'Primary Care Unit',
      totalBeds: 20,
      occupiedBeds: 6,
      percentage: 30,
      icuTotal: 2,
      icuOccupied: 0,
      status: 'Available',
      statusColor: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/30',
      barColor: 'from-sky-500 to-blue-500',
    },
  ];

  // ── 5. Disease Trends Data ──
  const diseaseTrends: DiseaseTrend[] = [
    {
      id: 'dengue',
      name: 'Dengue Fever',
      marathiName: 'डेंग्यू ताप',
      category: 'Vector-Borne',
      cases: 34,
      trend: 'up',
      changePct: '+28% vs last wk',
      history: [14, 18, 20, 22, 27, 31, 34],
      color: '#f43f5e',
      gradientId: 'grad-dengue',
      actionProtocol: 'Vector Fogging & Platelet Tracking',
      severity: 'high',
    },
    {
      id: 'malaria',
      name: 'Malaria',
      marathiName: 'हिवताप',
      category: 'Vector-Borne',
      cases: 18,
      trend: 'down',
      changePct: '-31% vs last wk',
      history: [30, 27, 24, 22, 21, 19, 18],
      color: '#10b981',
      gradientId: 'grad-malaria',
      actionProtocol: 'RDT Mass Screening & Bednet Distribution',
      severity: 'medium',
    },
    {
      id: 'hypertension',
      name: 'Hypertension (NCD)',
      marathiName: 'उच्च रक्तदाब',
      category: 'NCD / Chronic',
      cases: 156,
      trend: 'stable',
      changePct: '±1.2% constant',
      history: [153, 155, 154, 156, 154, 157, 156],
      color: '#0284c7',
      gradientId: 'grad-hyper',
      actionProtocol: 'Routine Monthly ASHA Dispensary Refills',
      severity: 'routine',
    },
    {
      id: 'maternal_hr',
      name: 'Maternal High-Risk',
      marathiName: 'उच्च जोखमीची माता',
      category: 'Maternal Care',
      cases: 23,
      trend: 'up',
      changePct: '+15% detected',
      history: [12, 14, 16, 17, 19, 21, 23],
      color: '#8b5cf6',
      gradientId: 'grad-maternal',
      actionProtocol: 'Pradhan Mantri Surakshit Matritva Triage',
      severity: 'high',
    },
  ];

  // Helper to generate SVG sparkline path
  const createSparklinePath = (points: number[], width = 110, height = 36) => {
    if (!points.length) return { linePath: '', areaPath: '', lastPoint: null };
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max === min ? 1 : max - min;
    const padding = 3;
    const innerH = height - padding * 2;

    const coords = points.map((val, idx) => {
      const x = padding + (idx / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * innerH;
      return { x, y };
    });

    // Generate smooth bezier curve
    let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx.toFixed(1)} ${p0.y.toFixed(1)}, ${cx.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }

    const lastX = coords[coords.length - 1].x.toFixed(1);
    const firstX = coords[0].x.toFixed(1);
    const area = `${d} L ${lastX} ${height} L ${firstX} ${height} Z`;

    return { linePath: d, areaPath: area, lastPoint: coords[coords.length - 1] };
  };

  // ── Donut Chart Geometry Math ──
  const donutRadius = 60;
  const donutStrokeWidth = 24;
  const donutCircumference = 2 * Math.PI * donutRadius; // ≈ 376.991

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 md:p-6 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analytics-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-2xl transition-all">
        {/* ── MODAL HEADER ── */}
        <header className="relative flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="analytics-modal-title"
                    className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white"
                  >
                    SwasthyaSetu Healthcare Analytics
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Telemetry
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Pune District Health Surveillance &bull; Clinical Throughput &bull; Hospital Utilization
                </p>
              </div>
            </div>

            {/* Actions: Time selector & Close */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Range Toggle Buttons */}
              <div className="hidden sm:flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                {(['7D', '14D', '30D'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      selectedTimeRange === range
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefresh}
                title="Refresh Real-time Metrics"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
                <span className="hidden sm:inline">Updated: {lastRefreshedAt}</span>
              </button>

              <button
                onClick={onClose}
                aria-label="Close analytics modal"
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* ── SCROLLABLE MODAL BODY ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {/* ══════════════════════════════════════════════════════
              1. SUMMARY CARDS ROW (4 CARDS)
             ══════════════════════════════════════════════════════ */}
          <section aria-label="Key Performance Indicators">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {summaryMetrics.map((metric) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={metric.id}
                    className={`relative overflow-hidden rounded-2xl border ${metric.borderColor} bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5`}
                  >
                    <div
                      className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br ${metric.bgGradient} blur-xl pointer-events-none`}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 line-clamp-1">
                        {metric.title}
                      </span>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${metric.iconBg}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {metric.value}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-black ${
                          metric.changeType === 'positive'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : metric.changeType === 'critical'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : metric.changeType === 'warning'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        }`}
                      >
                        {metric.changeType === 'positive' && <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />}
                        {metric.changeType === 'warning' && <TrendingUp className="h-3 w-3 stroke-[2.5]" />}
                        {metric.changeType === 'critical' && <AlertCircle className="h-3 w-3 stroke-[2.5]" />}
                        {metric.changeType === 'alert' && <AlertTriangle className="h-3 w-3 stroke-[2.5]" />}
                        {metric.change}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate text-right">
                        {metric.subtext}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════
              ROW 2: PATIENT FLOW CHART & REFERRAL DISTRIBUTION
             ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* ── 2. PATIENT FLOW CHART (SVG BAR CHART) [7 COLS] ── */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Patient Flow Trend ({selectedTimeRange === '7D' ? 'Last 7 Days' : selectedTimeRange === '14D' ? 'Last 14 Days' : 'Last 30 Days'})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Daily clinical footfall across outpatient & casualty departments
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {totalWeeklyVisits} <span className="font-normal text-slate-500">Visits</span>
                    </span>
                    <span className="h-3.5 w-px bg-slate-200 dark:bg-slate-700" />
                    <span className="font-extrabold text-sky-600 dark:text-sky-400">
                      ~{avgWeeklyVisits} <span className="font-normal text-slate-500">Daily Avg</span>
                    </span>
                  </div>
                </div>

                {/* SVG Bar Chart Visualization */}
                <div className="mt-4 w-full">
                  <div className="relative w-full aspect-[16/8] sm:aspect-[16/7]">
                    <svg
                      viewBox="0 0 520 220"
                      className="w-full h-full overflow-visible font-sans select-none"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        {/* Gradients for bars */}
                        <linearGradient id={`${chartId}-bar-gradient`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0ea5e9" />
                          <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>
                        <linearGradient id={`${chartId}-bar-peak`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id={`${chartId}-bar-active`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#4338ca" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines & Y-axis labels */}
                      {[0, 20, 40, 60].map((level) => {
                        const yPos = 180 - (level / 70) * 150;
                        return (
                          <g key={level} className="text-slate-400 dark:text-slate-600">
                            <line
                              x1="45"
                              y1={yPos}
                              x2="505"
                              y2={yPos}
                              stroke="currentColor"
                              strokeDasharray={level === 0 ? 'none' : '4 4'}
                              strokeWidth={level === 0 ? '1.5' : '1'}
                              className={level === 0 ? 'text-slate-300 dark:text-slate-700' : 'text-slate-200 dark:text-slate-800'}
                            />
                            <text
                              x="35"
                              y={yPos + 4}
                              textAnchor="end"
                              className="text-[11px] font-semibold fill-slate-400 dark:fill-slate-500"
                            >
                              {level}
                            </text>
                          </g>
                        );
                      })}

                      {/* Average reference line */}
                      {(() => {
                        const avgY = 180 - (avgWeeklyVisits / 70) * 150;
                        return (
                          <g>
                            <line
                              x1="45"
                              y1={avgY}
                              x2="505"
                              y2={avgY}
                              stroke="#0284c7"
                              strokeWidth="1.5"
                              strokeDasharray="6 4"
                              strokeOpacity="0.6"
                            />
                            <text
                              x="500"
                              y={avgY - 6}
                              textAnchor="end"
                              className="text-[10px] font-bold fill-sky-600 dark:fill-sky-400"
                            >
                              Avg: {avgWeeklyVisits}
                            </text>
                          </g>
                        );
                      })()}

                      {/* Bars */}
                      {patientFlowData.map((d, index) => {
                        const barWidth = 38;
                        const plotWidth = 460;
                        const step = plotWidth / patientFlowData.length;
                        const x = 50 + index * step + (step - barWidth) / 2;
                        const barHeight = (d.visits / 70) * 150;
                        const y = 180 - barHeight;
                        const isPeak = d.visits === maxVisits;
                        const isHovered = activeBarIndex === index;

                        return (
                          <g
                            key={d.day}
                            onMouseEnter={() => setActiveBarIndex(index)}
                            onMouseLeave={() => setActiveBarIndex(null)}
                            className="cursor-pointer group transition-all"
                          >
                            {/* Hover Backdrop Highlight */}
                            {isHovered && (
                              <rect
                                x={50 + index * step}
                                y="25"
                                width={step}
                                height="160"
                                fill="currentColor"
                                className="text-slate-100/70 dark:text-slate-800/50"
                                rx="8"
                              />
                            )}

                            {/* Bar Rectangle */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              rx="6"
                              fill={
                                isHovered
                                  ? `url(#${chartId}-bar-active)`
                                  : isPeak
                                  ? `url(#${chartId}-bar-peak)`
                                  : `url(#${chartId}-bar-gradient)`
                              }
                              className="transition-all duration-300 filter drop-shadow-xs group-hover:brightness-110"
                            />

                            {/* Value Label above Bar */}
                            <text
                              x={x + barWidth / 2}
                              y={y - 8}
                              textAnchor="middle"
                              className={`text-[12px] font-black transition-all ${
                                isPeak
                                  ? 'fill-emerald-600 dark:fill-emerald-400 font-black'
                                  : isHovered
                                  ? 'fill-indigo-600 dark:fill-indigo-400 font-black'
                                  : 'fill-slate-700 dark:fill-slate-200'
                              }`}
                            >
                              {d.visits}
                            </text>

                            {/* Day Label below Bar */}
                            <text
                              x={x + barWidth / 2}
                              y="198"
                              textAnchor="middle"
                              className={`text-[12px] transition-colors ${
                                isHovered
                                  ? 'font-black fill-slate-900 dark:fill-white'
                                  : 'font-bold fill-slate-500 dark:fill-slate-400'
                              }`}
                            >
                              {d.day}
                            </text>

                            {/* Date micro-label */}
                            <text
                              x={x + barWidth / 2}
                              y="211"
                              textAnchor="middle"
                              className="text-[9px] font-medium fill-slate-400 dark:fill-slate-500"
                            >
                              {d.date.split(' ')[1]}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom Breakdown & Peak Details */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-sky-600" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Standard OPD</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Peak Volume (Thu - 61)</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {activeBarIndex !== null ? (
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {patientFlowData[activeBarIndex].fullDay}: {patientFlowData[activeBarIndex].opd} OPD visits,{' '}
                      {patientFlowData[activeBarIndex].emergency} Emergency triage
                    </span>
                  ) : (
                    <span>Hover over any bar to view department breakdown</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── 3. REFERRAL DISTRIBUTION (SVG DONUT CHART) [5 COLS] ── */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                      <PieChart className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Referral Distribution
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Clinical triage urgency classification
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    23 Cases
                  </span>
                </div>

                {/* Donut Chart Visual */}
                <div className="my-3 flex flex-col sm:flex-row items-center justify-center gap-6">
                  {/* SVG Donut */}
                  <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90 transform overflow-visible select-none">
                      {/* Background Track Circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        stroke="currentColor"
                        strokeWidth={donutStrokeWidth}
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-800/80"
                      />

                      {/* Slices via strokeDasharray & pure offset */}
                      {referralData.map((slice, i) => {
                        const sliceLength = (slice.percentage / 100) * donutCircumference;
                        const priorPercentage = referralData.slice(0, i).reduce((sum, item) => sum + item.percentage, 0);
                        const dashOffset = -((priorPercentage / 100) * donutCircumference);
                        const isHovered = activeDonutIndex === i;

                        return (
                          <circle
                            key={slice.id}
                            cx="80"
                            cy="80"
                            r={donutRadius}
                            stroke={slice.color}
                            strokeWidth={isHovered ? donutStrokeWidth + 4 : donutStrokeWidth}
                            strokeDasharray={`${sliceLength} ${donutCircumference}`}
                            strokeDashoffset={dashOffset}
                            fill="transparent"
                            strokeLinecap="butt"
                            className="transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setActiveDonutIndex(i)}
                            onMouseLeave={() => setActiveDonutIndex(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      {activeDonutIndex !== null ? (
                        <>
                          <span
                            className="text-2xl font-black leading-none"
                            style={{ color: referralData[activeDonutIndex].color }}
                          >
                            {referralData[activeDonutIndex].percentage}%
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                            {referralData[activeDonutIndex].count} Cases
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            23
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                            Total Queue
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="w-full space-y-2.5">
                    {referralData.map((slice, i) => {
                      const isHovered = activeDonutIndex === i;
                      return (
                        <div
                          key={slice.id}
                          onMouseEnter={() => setActiveDonutIndex(i)}
                          onMouseLeave={() => setActiveDonutIndex(null)}
                          className={`rounded-xl border p-2.5 transition-all cursor-pointer ${
                            isHovered
                              ? `${slice.accentBorder} bg-slate-50 dark:bg-slate-800/80 shadow-xs`
                              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ backgroundColor: slice.color }}
                              />
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                                {slice.label}
                              </span>
                            </div>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-xs font-black ${slice.badgeBg} ${slice.badgeText}`}
                            >
                              {slice.percentage}%
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{slice.sublabel}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {slice.count} Patients
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Protocol Note */}
              <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                  Red triage mandates direct ambulance dispatch & ICU reservation
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              ROW 3: FACILITY BED OCCUPANCY & TOP DISEASE TRENDS
             ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* ── 4. FACILITY BED OCCUPANCY (HORIZONTAL BAR CHART) [6 COLS] ── */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Facility Bed Occupancy
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Real-time census across district hospital network
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    4 Facilities
                  </span>
                </div>

                {/* Horizontal Progress Bars */}
                <div className="space-y-4">
                  {facilitiesData.map((fac) => {
                    const freeBeds = fac.totalBeds - fac.occupiedBeds;
                    return (
                      <div
                        key={fac.id}
                        className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {fac.name}
                              </h4>
                              <span className="hidden sm:inline-block text-[10px] text-slate-400 dark:text-slate-500">
                                &bull; {fac.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {fac.occupiedBeds} occupied / {fac.totalBeds} total &bull;{' '}
                              <strong className="text-slate-700 dark:text-slate-300">{freeBeds} free beds</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${fac.statusColor}`}
                            >
                              {fac.status}
                            </span>
                            <span className="text-sm font-black text-slate-900 dark:text-white min-w-[38px] text-right">
                              {fac.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Bar Visual with threshold markers */}
                        <div className="mt-2.5">
                          <div className="relative h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            {/* Critical threshold line at 85% */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-slate-400/60 z-10"
                              style={{ left: '85%' }}
                              title="85% High Occupancy Warning Threshold"
                            />
                            {/* Progress bar */}
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${fac.barColor} transition-all duration-500`}
                              style={{ width: `${fac.percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                          <span>ICU: {fac.icuOccupied} / {fac.icuTotal} occupied</span>
                          <span>
                            {fac.percentage >= 90
                              ? '⚠️ Divert non-critical referrals'
                              : fac.percentage >= 80
                              ? '⚡ Priority triage active'
                              : '✅ Open for transfers'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Horizontal Chart Footer */}
              <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Threshold indicator marker at 85% cluster capacity</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">Overall: 73% Network Occupancy</span>
              </div>
            </div>

            {/* ── 5. TOP DISEASE TRENDS (SPARKLINES / LINE VISUALIZATION) [6 COLS] ── */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Top Disease Trends
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Syndromic surveillance & outbreak velocity
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Weekly Caseload
                  </span>
                </div>

                {/* Disease Rows with Pure SVG Sparklines */}
                <div className="space-y-3">
                  {diseaseTrends.map((disease) => {
                    const { linePath, areaPath, lastPoint } = createSparklinePath(disease.history);
                    const isSelected = activeDiseaseId === disease.id;

                    return (
                      <div
                        key={disease.id}
                        onClick={() => setActiveDiseaseId(isSelected ? null : disease.id)}
                        className={`rounded-xl border p-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-500/50 bg-teal-50/30 dark:bg-teal-950/20 shadow-xs'
                            : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Disease Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                {disease.name}
                              </h4>
                              <span className="text-[10px] text-slate-400">({disease.marathiName})</span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>
                                Caseload: <strong className="text-slate-900 dark:text-white">{disease.cases}</strong> cases
                              </span>
                              <span>&bull;</span>
                              <span
                                className={`inline-flex items-center font-bold ${
                                  disease.trend === 'up'
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : disease.trend === 'down'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-sky-600 dark:text-sky-400'
                                }`}
                              >
                                {disease.trend === 'up' && <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />}
                                {disease.trend === 'down' && <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />}
                                {disease.trend === 'stable' && <Minus className="h-3 w-3 stroke-[2.5]" />}
                                {disease.trend === 'up'
                                  ? 'Trending up'
                                  : disease.trend === 'down'
                                  ? 'Trending down'
                                  : 'Stable'}
                              </span>
                            </div>
                          </div>

                          {/* SVG Sparkline (Line-like visualization) */}
                          <div className="h-9 w-28 shrink-0">
                            <svg viewBox="0 0 110 36" className="h-full w-full overflow-visible">
                              <defs>
                                <linearGradient id={disease.gradientId} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={disease.color} stopOpacity="0.3" />
                                  <stop offset="100%" stopColor={disease.color} stopOpacity="0.0" />
                                </linearGradient>
                              </defs>

                              {/* Area fill */}
                              <path d={areaPath} fill={`url(#${disease.gradientId})`} />

                              {/* Curve line */}
                              <path
                                d={linePath}
                                fill="none"
                                stroke={disease.color}
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              {/* Terminal glowing point */}
                              {lastPoint && (
                                <circle
                                  cx={lastPoint.x}
                                  cy={lastPoint.y}
                                  r="3"
                                  fill={disease.color}
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                />
                              )}
                            </svg>
                          </div>

                          {/* Velocity badge */}
                          <div className="shrink-0 text-right min-w-[68px]">
                            <span
                              className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-black ${
                                disease.trend === 'up'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                  : disease.trend === 'down'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
                              }`}
                            >
                              {disease.changePct}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Protocol Drawer */}
                        {isSelected && (
                          <div className="mt-2.5 rounded-lg border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/40 p-2 text-[11px] text-teal-800 dark:text-teal-300 flex items-center justify-between">
                            <span>
                              <strong>Protocol:</strong> {disease.actionProtocol}
                            </span>
                            <span className="font-bold uppercase tracking-wider text-[10px]">Active</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Disease surveillance footer */}
              <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Integrated Disease Surveillance Programme (IDSP) Sync</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Click any trend for protocol</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MODAL FOOTER ── */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>SwasthyaSetu Mesh Telemetry &bull; Zero external chart dependencies &bull; 100% SVG/CSS</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close Dashboard
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
