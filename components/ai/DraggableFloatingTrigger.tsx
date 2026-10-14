'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Bot, Sparkles, GripHorizontal } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';

interface DraggableFloatingTriggerProps {
  onOpen: () => void;
}

export function DraggableFloatingTrigger({ onOpen }: DraggableFloatingTriggerProps) {
  const { language } = useLanguage();

  const getLoc = (dict: Record<Language, string>): string => {
    return dict[language] || dict.en;
  };

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  // Load saved position or default to bottom-right on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('swasthyasetu_trigger_pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const btnW = btnRef.current?.offsetWidth || 180;
          const btnH = btnRef.current?.offsetHeight || 60;
          const clampedX = Math.max(10, Math.min(window.innerWidth - btnW - 10, parsed.x));
          const clampedY = Math.max(10, Math.min(window.innerHeight - btnH - 10, parsed.y));
          setPosition({ x: clampedX, y: clampedY });
          return;
        }
      } catch (_) {}
    }

    // Default position: bottom-right
    const isSmall = window.innerWidth < 640;
    const btnW = isSmall ? 160 : 200;
    const btnH = 56;
    const defaultX = Math.max(10, window.innerWidth - btnW - (isSmall ? 12 : 24));
    const defaultY = Math.max(10, window.innerHeight - btnH - (isSmall ? 16 : 24));
    setPosition({ x: defaultX, y: defaultY });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    setIsDragging(true);
    setHasMoved(false);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position?.x ?? (window.innerWidth - 220),
      posY: position?.y ?? (window.innerHeight - 80),
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.hypot(dx, dy) > 5) {
      setHasMoved(true);
    }

    const btnW = btnRef.current?.offsetWidth || 180;
    const btnH = btnRef.current?.offsetHeight || 60;

    const maxX = Math.max(10, window.innerWidth - btnW - 10);
    const maxY = Math.max(10, window.innerHeight - btnH - 10);

    const nextX = Math.max(10, Math.min(maxX, dragStartRef.current.posX + dx));
    const nextY = Math.max(10, Math.min(maxY, dragStartRef.current.posY + dy));

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    setIsDragging(false);
    dragStartRef.current = null;

    if (position) {
      localStorage.setItem('swasthyasetu_trigger_pos', JSON.stringify(position));
    }

    // If pointer did not move significantly, treat as click to open
    if (!hasMoved) {
      onOpen();
    }
  };

  return (
    <div
      ref={btnRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: position ? `${position.x}px` : 'auto',
        top: position ? `${position.y}px` : 'auto',
        right: position ? 'auto' : '20px',
        bottom: position ? 'auto' : '20px',
      }}
      className={`fixed z-[80] flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 active:scale-95 text-white pl-3.5 pr-4 py-2.5 sm:py-3 rounded-full shadow-2xl hover:shadow-emerald-600/40 transition-shadow border-2 border-white/30 text-xs sm:text-sm font-black select-none touch-none group animate-in fade-in duration-200 ${
        isDragging ? 'cursor-grabbing shadow-emerald-400/50 scale-105 ring-4 ring-emerald-300/40' : 'cursor-grab'
      }`}
      aria-label="Open AI Voice Health Assistant (Drag anywhere)"
      title="Click to chat · Drag anywhere to reposition"
    >
      {/* Visual drag handle grip indicator */}
      <div className="opacity-60 group-hover:opacity-100 transition-opacity -ml-1 text-emerald-200 shrink-0">
        <GripHorizontal className="w-3.5 h-3.5" />
      </div>

      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <Mic className="w-4 h-4 text-white animate-pulse" />
      </div>

      <div className="text-left min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-emerald-200 font-extrabold leading-none truncate">
          {getLoc({
            en: 'Voice & 6 Languages',
            kn: 'ಧ್ವನಿ ಮತ್ತು ೬ ಭಾಷೆಗಳು',
            hi: 'आवाज व ६ भाषाएं',
            ta: 'குரல் மற்றும் 6 மொழிகள்',
            te: 'వాయిస్ & 6 భాషలు',
            mr: 'आवाज व ६ भाषा',
          })}
        </div>
        <span className="font-black tracking-wide text-xs sm:text-sm leading-tight block truncate">
          {getLoc({
            en: 'AI Voice Health Bot',
            kn: 'AI ಆರೋಗ್ಯ ಬಾಟ್',
            hi: 'AI स्वास्थ्य बॉट',
            ta: 'AI சுகாதார பாட்',
            te: 'AI హెల్త్ బాట్',
            mr: 'AI व्हॉइस बॉट',
          })}
        </span>
      </div>

      <span className="relative flex h-2.5 w-2.5 ml-0.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
      </span>
    </div>
  );
}
