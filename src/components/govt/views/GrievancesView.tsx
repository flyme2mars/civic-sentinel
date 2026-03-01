/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { GrievanceCard } from '../GrievanceCard';
import { Pill, PriorityDot, SLARing, SLABar, ScoreRing } from '../Atoms';
import { STATUS_MAP, PRIORITY_MAP } from '@/lib/mock-data';

export function GrievancesView({ 
  dark, surface, border, textSecondary, textPrimary, accent, 
  filterStatus, setFilterStatus, sortBy, setSortBy, viewMode, setViewMode, 
  filtered, setSelected 
}: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>All Grievances</h2>
      </div>
      {/* TOOLBAR */}
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {["all", "pending", "in-progress", "critical", "escalated", "resolved"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              background: filterStatus === s ? (dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)") : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
              border: `1px solid ${filterStatus === s ? (dark ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.3)") : border}`,
              color: filterStatus === s ? accent : textSecondary,
              borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700,
              fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", transition: "all 0.15s",
              textTransform: "capitalize"
            }}>{s === "all" ? "All" : s}</button>
          ))}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${border}`, borderRadius: 8, padding: "7px 12px", color: textSecondary, fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono', monospace", outline: "none" }}>
          <option value="urgency">Sort: Urgency</option>
          <option value="severity">Sort: Severity</option>
          <option value="recent">Sort: Recent</option>
        </select>

        <div style={{ display: "flex", gap: 4 }}>
          {[["grid", "⊞"], ["list", "☰"]].map(([m, icon]) => (
            <button key={m} onClick={() => setViewMode(m)} style={{ background: viewMode === m ? (dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)") : "transparent", border: `1px solid ${viewMode === m ? (dark ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.3)") : border}`, color: viewMode === m ? accent : textSecondary, borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>{icon}</button>
          ))}
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map((g: any, i: number) => (
            <GrievanceCard key={g.id} g={g} dark={dark} onClick={setSelected} index={i} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: textSecondary, fontSize: 14 }}>No grievances match your filter.</div>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 120px 130px 110px 80px", gap: 16, padding: "10px 18px", borderBottom: `1px solid ${border}` }}>
            {["ISSUE", "STATUS", "WARD", "SLA", "PRIORITY", "SCORE"].map(h => (
              <div key={h} style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{h}</div>
            ))}
          </div>
          {filtered.map((g: any, i: number) => (
            <div key={g.id} onClick={() => setSelected(g)} style={{
              display: "grid", gridTemplateColumns: "1fr 130px 120px 130px 110px 80px", gap: 16,
              padding: "14px 18px", borderBottom: `1px solid ${border}`, cursor: "pointer",
              transition: "background 0.15s", alignItems: "center",
              animation: `fadeSlideUp 0.3s ease ${i * 50}ms both`
            }}
              onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <div>
                <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>{g.id}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</div>
              </div>
              <Pill status={g.status as keyof typeof STATUS_MAP} dark={dark} />
              <span style={{ fontSize: 12, color: textSecondary }}>{g.ward}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SLARing reportedAt={g.reportedAt} slaHours={g.slaHours} dark={dark} size={44} />
                <SLABar reportedAt={g.reportedAt} slaHours={g.slaHours} compact dark={dark} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <PriorityDot priority={g.priority as keyof typeof PRIORITY_MAP} dark={dark} />
                <span style={{ fontSize: 11, color: PRIORITY_MAP[g.priority as keyof typeof PRIORITY_MAP]?.[dark ? "dark" : "light"], fontFamily: "'DM Mono', monospace", textTransform: "capitalize" }}>{g.priority}</span>
              </div>
              {g.score != null ? <ScoreRing score={g.score} dark={dark} size={36} /> : <span style={{ color: dark ? "#374151" : "#E5E7EB", fontSize: 12 }}>—</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
