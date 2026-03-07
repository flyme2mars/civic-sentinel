/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { GrievanceCard } from '../GrievanceCard';
import { Pill, PriorityDot, SLARing, SLABar, ScoreRing } from '../Atoms';
import { STATUS_MAP, PRIORITY_MAP } from '@/lib/mock-data';
import { LayoutGrid, List, Camera } from 'lucide-react';

export function GrievancesView({ 
  surface, border, textSecondary, textPrimary, accent, 
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
          {[
            { id: "all", label: "Full History" },
            { id: "new", label: "New" },
            { id: "assigned", label: "In Progress" },
            { id: "review", label: "Awaiting Review" },
            { id: "rejected", label: "Rejected" },
            { id: "closed", label: "Closed" }
          ].map(s => (
            <button key={s.id} onClick={() => setFilterStatus(s.id)} style={{
              background: filterStatus === s.id ? "#111827" : "transparent",
              border: `1px solid ${filterStatus === s.id ? "#111827" : border}`,
              color: filterStatus === s.id ? "#fff" : textSecondary,
              borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.04em", transition: "all 0.15s",
              textTransform: "capitalize"
            }}>{s.label}</button>
          ))}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: 8, padding: "7px 12px", color: textSecondary, fontSize: 11, cursor: "pointer", outline: "none" }}>
          <option value="urgency">Sort: Urgency</option>
          <option value="severity">Sort: Severity</option>
          <option value="recent">Sort: Recent</option>
        </select>

        <div style={{ display: "flex", gap: 4 }}>
          {[["grid", LayoutGrid], ["list", List]].map(([m, Icon]: any) => (
            <button key={m} onClick={() => setViewMode(m)} style={{ 
              background: viewMode === m ? "#111827" : "transparent", 
              border: `1px solid ${viewMode === m ? "#111827" : border}`, 
              color: viewMode === m ? "#fff" : textSecondary, 
              borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" 
            }}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map((g: any, i: number) => (
            <GrievanceCard key={g.rawId} g={g} onClick={setSelected} index={i} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: textSecondary, fontSize: 14 }}>No grievances match your filter.</div>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "minmax(200px, 1fr) 140px 120px 140px 110px", 
            gap: 16, 
            padding: "12px 20px", 
            borderBottom: `1px solid ${border}`,
            background: "rgba(0,0,0,0.01)"
          }}>
            {["ISSUE", "STATUS", "WARD", "SLA STATUS", "PRIORITY"].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {filtered.map((g: any, i: number) => (
            <div key={g.rawId} onClick={() => setSelected(g)} style={{
              display: "grid", 
              gridTemplateColumns: "minmax(200px, 1fr) 140px 120px 140px 110px", 
              gap: 16,
              padding: "14px 20px", 
              borderBottom: `1px solid ${border}`, 
              cursor: "pointer",
              transition: "background 0.15s", 
              alignItems: "center",
              animation: `fadeSlideUp 0.3s ease ${i * 50}ms both`
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.025)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>{g.id}</div>
                  {(g.evidenceUrls?.length > 0 || g.imageUrl) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 2, background: "rgba(0,0,0,0.05)", padding: "1px 4px", borderRadius: 4 }}>
                      <Camera className="w-2.5 h-2.5 text-gray-400" />
                      <span style={{ fontSize: 9, fontWeight: 700, color: textSecondary }}>{g.evidenceUrls?.length || 1}</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</div>
              </div>
              <div style={{ display: "flex" }}>
                <Pill status={g.status as keyof typeof STATUS_MAP} />
              </div>
              <span style={{ fontSize: 12, color: textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.ward}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SLARing reportedAt={g.reportedAt} slaHours={g.slaHours} size={40} />
                <SLABar reportedAt={g.reportedAt} slaHours={g.slaHours} compact />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PriorityDot priority={g.priority as keyof typeof PRIORITY_MAP} />
                <span style={{ fontSize: 11, color: PRIORITY_MAP[g.priority as keyof typeof PRIORITY_MAP]?.light, fontFamily: "'DM Mono', monospace", textTransform: "capitalize", fontWeight: 600 }}>{g.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
