/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StatCard } from '../StatCard';
import { STATS, GRIEVANCES, CAT_ICONS } from '@/lib/mock-data';

export function OverviewView({ dark, setSelected, border, surface, textSecondary }: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Overview Dashboard</h2>
      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="TOTAL GRIEVANCES" value={STATS.total} sub={`+${STATS.todayNew} today`} accent={dark ? "#818CF8" : "#6366F1"} icon="◈" dark={dark} delay={0} />
        <StatCard label="PENDING" value={STATS.pending} sub={`${STATS.inProgress} in progress`} accent={dark ? "#FBBF24" : "#D97706"} icon="⏳" dark={dark} delay={80} />
        <StatCard label="SLA COMPLIANCE" value={`${STATS.slaCompliance}%`} sub={`${STATS.avgResolution}h avg resolution`} accent={dark ? "#4ADE80" : "#16A34A"} icon="◎" dark={dark} delay={160} />
        <StatCard label="ESCALATED / CRITICAL" value={STATS.escalated} sub={`${STATS.critical} critical active`} accent={dark ? "#EF4444" : "#DC2626"} icon="⚡" dark={dark} delay={240} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Recent Critical Issues</h3>
          {GRIEVANCES.filter(g => g.priority === 'critical' || g.priority === 'high').slice(0, 3).map((g, i) => (
            <div key={g.id} onClick={() => setSelected(g)} style={{ padding: "12px 0", borderBottom: i < 2 ? `1px solid ${border}` : 'none', cursor: "pointer", display: "flex", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{CAT_ICONS[g.category as keyof typeof CAT_ICONS]}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{g.title}</div>
                <div style={{ fontSize: 11, color: textSecondary, marginTop: 4 }}>{g.address} · {g.ward}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>System Health</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}><span>Vision Auditor Uptime</span><span style={{color: dark ? "#4ADE80" : "#16A34A"}}>99.9%</span></div>
              <div style={{ height: 4, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderRadius: 2 }}><div style={{ width: "99.9%", height: "100%", background: dark ? "#4ADE80" : "#16A34A", borderRadius: 2 }}></div></div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}><span>Bedrock Triage Latency</span><span style={{color: dark ? "#FBBF24" : "#D97706"}}>1.2s</span></div>
              <div style={{ height: 4, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderRadius: 2 }}><div style={{ width: "70%", height: "100%", background: dark ? "#FBBF24" : "#D97706", borderRadius: 2 }}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
