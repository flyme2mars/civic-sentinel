'use client';

import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { STATUS_MAP, PRIORITY_MAP } from '@/lib/mock-data';

export function Pill({ status, dark }: { status: keyof typeof STATUS_MAP, dark: boolean }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending;
  const c = dark ? cfg.dark : cfg.light;
  
  // Refactored to Tailwind where possible, but keeping the dynamic colors from STATUS_MAP
  return (
    <span 
      className="px-[10px] py-[3px] rounded-full text-[11px] font-bold font-mono tracking-wider whitespace-nowrap border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {cfg.label}
    </span>
  );
}

export function PriorityDot({ priority, dark }: { priority: keyof typeof PRIORITY_MAP, dark: boolean }) {
  const color = dark ? PRIORITY_MAP[priority]?.dark : PRIORITY_MAP[priority]?.light;
  return (
    <span 
      className={`inline-block w-[7px] h-[7px] rounded-full flex-shrink-0 ${priority === 'critical' ? 'shadow-[0_0_6px_var(--dot-color)]' : ''}`}
      style={{ background: color, '--dot-color': color } as React.CSSProperties} 
    />
  );
}

export function SLABar({ reportedAt, slaHours, compact, dark }: { reportedAt: number, slaHours: number, compact?: boolean, dark: boolean }) {
  const { breached, h, m, pct, urgent } = useCountdown(reportedAt, slaHours);
  const barColor = breached ? (dark ? "#EF4444" : "#DC2626") : urgent ? (dark ? "#F97316" : "#EA580C") : (dark ? "#4ADE80" : "#16A34A");
  const textColor = breached ? (dark ? "#EF4444" : "#DC2626") : urgent ? (dark ? "#F97316" : "#EA580C") : (dark ? "#4ADE80" : "#16A34A");

  if (compact) {
    return (
      <span className="font-mono text-[11px] font-bold" style={{ color: textColor }}>
        {breached ? `+${h}h overdue` : `${h}h ${m}m`}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono tracking-widest" style={{ color: dark ? "#6B7280" : "#9CA3AF" }}>
          {breached ? "SLA BREACHED" : "SLA DEADLINE"}
        </span>
        <span className="font-mono text-[13px] font-bold" style={{ color: textColor }}>
          {breached ? `+${h}h ${m}m` : `${h}h ${m}m`}
        </span>
      </div>
      <div className="h-[5px] rounded-[3px] overflow-hidden relative" style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}>
        <div 
          className="h-full rounded-[3px] transition-all duration-1000 linear"
          style={{ 
            width: `${Math.max(0, Math.min(100, pct))}%`, 
            background: barColor,
            boxShadow: `0 0 8px ${barColor}50`
          }} 
        />
        {(urgent || breached) && (
          <div 
            className="absolute inset-0 animate-pulse" 
            style={{ background: `linear-gradient(90deg, transparent 60%, ${barColor}30)` }} 
          />
        )}
      </div>
    </div>
  );
}

export function SLARing({ reportedAt, slaHours, dark, size = 52 }: { reportedAt: number, slaHours: number, dark: boolean, size?: number }) {
  const { breached, h, m, pct, urgent } = useCountdown(reportedAt, slaHours);
  const color = breached ? (dark ? "#EF4444" : "#DC2626") : urgent ? (dark ? "#F97316" : "#EA580C") : (dark ? "#4ADE80" : "#16A34A");
  const trackColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const cx = size / 2, cy = size / 2, r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth="4" />
        {/* Progress */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          className="transition-all duration-1000 linear"
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }} />
        {/* Glow when urgent/breached */}
        {(urgent || breached) && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="4" opacity="0.2"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            className="blur-[3px]"
            style={{ transformOrigin: "center", transform: "rotate(-90deg)" }} />
        )}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
        <span className="font-mono font-bold leading-none" style={{ fontSize: size < 60 ? 9 : 11, color }}>
          {breached ? `+${h}h` : `${h}h`}
        </span>
        <span className="font-mono leading-none mt-[1px]" style={{ fontSize: size < 60 ? 7 : 9, color: dark ? "#6B7280" : "#9CA3AF" }}>
          {breached ? "over" : `${m}m`}
        </span>
      </div>
    </div>
  );
}

export function ScoreRing({ score, dark, size = 44 }: { score: number, dark: boolean, size?: number }) {
  const color = score >= 80 ? (dark ? "#4ADE80" : "#16A34A") : score >= 50 ? (dark ? "#FBBF24" : "#D97706") : (dark ? "#EF4444" : "#DC2626");
  const r = 16; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        className="transition-all duration-600 ease-in-out"
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }} />
      <text x="20" y="24" textAnchor="middle" fill={color} fontSize="9" className="font-mono font-bold">{score}</text>
    </svg>
  );
}
