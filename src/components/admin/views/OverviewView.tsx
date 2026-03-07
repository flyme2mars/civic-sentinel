/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StatCard } from '../StatCard';
import { STATS } from '@/lib/mock-data';
import { 
  FileText, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  Construction,
  Waves,
  Droplets,
  Zap,
  Trash2,
  Building2,
  CircleHelp
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  roads: Construction,
  sanitation: Waves,
  water: Droplets,
  electricity: Zap,
  waste: Trash2,
  infrastructure: Building2,
  other: CircleHelp
};

export function OverviewView({ setSelected, border, surface, textSecondary, grievances }: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Overview Dashboard</h2>
      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard 
          label="TOTAL GRIEVANCES" 
          value={grievances?.length || 0} 
          sub={`+${STATS.todayNew} today`} 
          accent={"#0f172a"} 
          icon={<FileText className="w-5 h-5 text-slate-900" />} 
          delay={0} 
        />
        <StatCard 
          label="PENDING" 
          value={STATS.pending} 
          sub={`${STATS.inProgress} in progress`} 
          accent={"#0f172a"} 
          icon={<Clock className="w-5 h-5 text-slate-900" />} 
          delay={80} 
        />
        <StatCard 
          label="SLA COMPLIANCE" 
          value={`${STATS.slaCompliance}%`} 
          sub={`${STATS.avgResolution}h avg resolution`} 
          accent={"#0f172a"} 
          icon={<ShieldCheck className="w-5 h-5 text-slate-900" />} 
          delay={160} 
        />
        <StatCard 
          label="ESCALATED / CRITICAL" 
          value={STATS.escalated} 
          sub={`${STATS.critical} critical active`} 
          accent={"#ef4444"} 
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />} 
          delay={240} 
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Recent Critical Issues</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {(grievances || []).filter((g: any) => g.priority === 'critical' || g.priority === 'high').slice(0, 6).map((g: any, i: number) => {
              const Icon = CATEGORY_ICONS[g.category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.other;
              return (
                <div key={g.rawId} onClick={() => setSelected(g)} style={{ 
                  padding: "16px", 
                  border: `1px solid ${border}`, 
                  borderRadius: 12,
                  cursor: "pointer", 
                  display: "flex", 
                  gap: 14,
                  transition: "all 0.2s",
                  background: "rgba(0,0,0,0.01)"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.01)"}>
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-slate-900" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: textSecondary, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.address} · {g.ward}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {(grievances || []).filter((g: any) => g.priority === 'critical' || g.priority === 'high').length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: textSecondary }}>No critical issues found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
