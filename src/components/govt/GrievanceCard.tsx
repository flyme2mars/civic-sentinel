'use client';

import React, { useState, useEffect } from 'react';
import { Pill, PriorityDot, SLARing, SLABar, ScoreRing } from './Atoms';
import { GrievanceType, CAT_ICONS, PRIORITY_MAP, STATUS_MAP } from '@/lib/mock-data';

export function GrievanceCard({ g, dark, onClick, index }: { g: GrievanceType; dark: boolean; onClick: (g: GrievanceType) => void; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [entered, setEntered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setEntered(true), 80 * index + 300); return () => clearTimeout(t); }, [index]);

  const bg = dark ? "#111827" : "#FFFFFF";
  const border = dark ? (hovered ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)") : (hovered ? "rgba(99,102,241,0.3)" : "rgba(0,0,0,0.07)");
  const textPrimary = dark ? "#F9FAFB" : "#111827";
  const textSecondary = dark ? "#6B7280" : "#9CA3AF";
  const breached = g.elapsedHours > g.slaHours;

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
        boxShadow: hovered ? (dark ? "0 8px 30px rgba(0,0,0,0.5)" : "0 8px 30px rgba(0,0,0,0.12)") : (dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)")
      }}>

      {/* Critical pulse strip */}
      {(g.status === "critical" || breached) && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: dark ? "#EF4444" : "#DC2626", animation: "shimmer 2s linear infinite", backgroundSize: "200% 100%", backgroundImage: `linear-gradient(90deg, transparent 0%, ${dark ? "#EF4444" : "#DC2626"} 50%, transparent 100%)` }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{CAT_ICONS[g.category as keyof typeof CAT_ICONS] || "○"}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.07em" }}>{g.id}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary, lineHeight: 1.3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{g.title}</div>
          </div>
        </div>
        <PriorityDot priority={g.priority as keyof typeof PRIORITY_MAP} dark={dark} />
      </div>

      <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{g.description}</p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <Pill status={g.status as keyof typeof STATUS_MAP} dark={dark} />
        {g.rtiGenerated && (
          <span style={{ background: dark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.1)", color: dark ? "#A78BFA" : "#7C3AED", border: `1px solid ${dark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.2)"}`, padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>RTI ✓</span>
        )}
        {g.socialShared && (
          <span style={{ background: dark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)", color: dark ? "#60A5FA" : "#2563EB", border: `1px solid ${dark ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.2)"}`, padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>𝕏 {g.twitterLikes}</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 11, color: textSecondary }}>
        <span>📍</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.address}</span>
        <span style={{ marginLeft: "auto", flexShrink: 0 }}>{g.ward}</span>
      </div>

      {g.aiConfidence && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 10px", background: dark ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.05)", borderRadius: 8, border: `1px solid ${dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"}` }}>
          <span style={{ fontSize: 10, color: dark ? "#818CF8" : "#6366F1", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>AI</span>
          <div style={{ flex: 1, height: 3, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${g.aiConfidence * 100}%`, background: dark ? "#818CF8" : "#6366F1", borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 10, color: dark ? "#818CF8" : "#6366F1", fontFamily: "'DM Mono', monospace" }}>{Math.round(g.aiConfidence * 100)}%</span>
          <span style={{ fontSize: 10, color: textSecondary }}>{g.aiSimilar} similar</span>
          {g.score != null && <ScoreRing score={g.score} dark={dark} size={32} />}
        </div>
      )}

      {/* Bottom: Ring + bar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SLARing reportedAt={g.reportedAt} slaHours={g.slaHours} dark={dark} size={52} />
        <div style={{ flex: 1 }}>
          <SLABar reportedAt={g.reportedAt} slaHours={g.slaHours} dark={dark} />
        </div>
      </div>
    </div>
  );
}
