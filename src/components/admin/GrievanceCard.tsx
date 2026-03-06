'use client';

import React, { useState, useEffect } from 'react';
import { Pill, PriorityDot, SLARing, SLABar, ScoreRing } from './Atoms';
import { GrievanceType, CAT_ICONS, PRIORITY_MAP, STATUS_MAP } from '@/lib/mock-data';

export function GrievanceCard({ g, onClick, index }: { g: GrievanceType; onClick: (g: GrievanceType) => void; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [entered, setEntered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setEntered(true), 80 * index + 300); return () => clearTimeout(t); }, [index]);

  const bg = "#FFFFFF";
  const border = hovered ? "rgba(17,24,39,0.3)" : "rgba(0,0,0,0.07)";
  const textPrimary = "#111827";
  const textSecondary = "#9CA3AF";
  const breached = (g.elapsedHours ?? 0) > g.slaHours;

  return (
    <div
      onClick={() => onClick(g)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "18px 20px",
        cursor: "pointer", position: "relative", overflow: "hidden",
        opacity: entered ? 1 : 0, transform: entered ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
        transition: `opacity 0.4s ease, transform 0.4s ease, border-color 0.2s, box-shadow 0.2s`,
        boxShadow: hovered ? "0 8px 30px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.06)"
      }}>

      {/* Critical pulse strip */}
      {(g.status === "critical" || breached) && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#DC2626", animation: "shimmer 2s linear infinite", backgroundSize: "200% 100%", backgroundImage: `linear-gradient(90deg, transparent 0%, #DC2626 50%, transparent 100%)` }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{CAT_ICONS[g.category as keyof typeof CAT_ICONS] || "○"}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.07em" }}>{g.id}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary, lineHeight: 1.3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{g.title}</div>
          </div>
        </div>
        <PriorityDot priority={g.priority as keyof typeof PRIORITY_MAP} />
      </div>

      <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{g.description}</p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <Pill status={g.status as keyof typeof STATUS_MAP} />
        {g.rtiGenerated && (
          <span style={{ background: "rgba(17,24,39,0.05)", color: "#111827", border: `1px solid rgba(17,24,39,0.1)`, padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700 }}>RTI ✓</span>
        )}
        {g.socialShared && (
          <span style={{ background: "rgba(17,24,39,0.05)", color: "#111827", border: `1px solid rgba(17,24,39,0.1)`, padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700 }}>𝕏 {g.twitterLikes}</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 11, color: textSecondary }}>
        <span>📍</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.address}</span>
        <span style={{ marginLeft: "auto", flexShrink: 0 }}>{g.ward}</span>
      </div>

      {g.aiConfidence && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 10px", background: "rgba(17,24,39,0.05)", borderRadius: 8, border: `1px solid rgba(17,24,39,0.1)` }}>
          <span style={{ fontSize: 10, color: "#111827", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>AI</span>
          <div style={{ flex: 1, height: 3, background: "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${g.aiConfidence * 100}%`, background: "#111827", borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 10, color: "#111827", fontFamily: "'DM Mono', monospace" }}>{Math.round(g.aiConfidence * 100)}%</span>
          <span style={{ fontSize: 10, color: textSecondary }}>{g.aiSimilar} similar</span>
          {g.score != null && <ScoreRing score={g.score} size={32} />}
        </div>
      )}

      {/* Bottom: Ring + bar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SLARing reportedAt={g.reportedAt} slaHours={g.slaHours} size={52} />
        <div style={{ flex: 1 }}>
          <SLABar reportedAt={g.reportedAt} slaHours={g.slaHours} />
        </div>
      </div>
    </div>
  );
}
