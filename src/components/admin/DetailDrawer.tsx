'use client';

import React, { useState, useEffect } from 'react';
import { Pill, PriorityDot, SLARing, SLABar, ScoreRing } from './Atoms';
import { GrievanceType, PRIORITY_MAP, STATUS_MAP } from '@/lib/mock-data';

export function DetailDrawer({ g, dark, onClose }: { g: GrievanceType; dark: boolean; onClose: () => void }) {
  const [tab, setTab] = useState("overview");
  const [visible, setVisible] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const bg = dark ? "#0F172A" : "#FFFFFF";
  const border = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textPrimary = dark ? "#F9FAFB" : "#111827";
  const textSecondary = dark ? "#6B7280" : "#9CA3AF";

  return (
    <>
    <div style={{
      position: "fixed", inset: 0, zIndex: 50, display: "flex",
      alignItems: "center", justifyContent: "center", padding: "40px 20px",
      background: dark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)",
      backdropFilter: "blur(2px)",
      opacity: visible ? 1 : 0, transition: "opacity 0.25s ease"
    }} onClick={onClose}>
      <div style={{ width: 900, maxWidth: "100%", maxHeight: "100%", background: bg, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: dark ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "0 25px 50px -12px rgba(0,0,0,0.25)"
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>{g.id} · {g.ward}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: textPrimary, fontFamily: "'Sora', sans-serif", lineHeight: 1.3 }}>{g.title}</div>
            </div>
            <button onClick={onClose} style={{ background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: textSecondary, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Pill status={g.status as keyof typeof STATUS_MAP} dark={dark} />
            <span style={{ fontSize: 11, color: PRIORITY_MAP[g.priority as keyof typeof PRIORITY_MAP]?.[dark ? "dark" : "light"], fontFamily: "'DM Mono', monospace", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <PriorityDot priority={g.priority as keyof typeof PRIORITY_MAP} dark={dark} /> {g.priority.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          {["overview", "timeline", "ai audit", "actions"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "11px 0", background: "none", border: "none",
              borderBottom: tab === t ? `2px solid ${dark ? "#818CF8" : "#6366F1"}` : "2px solid transparent",
              color: tab === t ? (dark ? "#818CF8" : "#6366F1") : textSecondary,
              fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
              textTransform: "uppercase", cursor: "pointer", transition: "color 0.15s"
            }}>{t}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <SLARing reportedAt={g.reportedAt} slaHours={g.slaHours} dark={dark} size={64} />
                <div style={{ flex: 1 }}>
                  <SLABar reportedAt={g.reportedAt} slaHours={g.slaHours} dark={dark} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Citizen", g.citizen], ["Phone", g.phone], ["Zone", g.zone], ["Category", g.category]].map(([k, v]) => (
                  <div key={k} style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${border}` }}>
                    <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>{k.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: textPrimary, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${border}` }}>
                <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 6 }}>DESCRIPTION</div>
                <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.7 }}>{g.description}</p>
              </div>

              <div>
                <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 10 }}>PHOTO EVIDENCE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {["BEFORE", "AFTER"].map(label => (
                    <div key={label} style={{ aspectRatio: "4/3", borderRadius: 10, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px dashed ${border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, overflow: "hidden", position: "relative" }}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(label === "BEFORE" && (g as any).imageUrl) ? (
                        <>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any, @next/next/no-img-element */}
                          <img src={(g as any).imageUrl} alt="Before" style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} onClick={() => setZoomedImage((g as any).imageUrl)} />
                          <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 8px", borderRadius: 6, fontSize: 10, pointerEvents: "none", display: "flex", alignItems: "center", gap: 4 }}>
                            🔍 Zoom
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 22, opacity: 0.2 }}>📷</div>
                          <div style={{ fontSize: 9, color: dark ? "#374151" : "#D1D5DB", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{label}</div>
                          {label === "AFTER" && g.hasAfter && <div style={{ fontSize: 9, color: dark ? "#4ADE80" : "#16A34A", fontFamily: "'DM Mono', monospace" }}>✓ UPLOADED</div>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {g.assignee && (
                <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: dark ? "#818CF8" : "#6366F1", flexShrink: 0 }}>
                    {g.assignee.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>ASSIGNED TO</div>
                    <div style={{ fontSize: 13, color: textPrimary, fontWeight: 600, marginTop: 2 }}>{g.assignee}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "ai audit" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: dark ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.05)", border: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 9, color: dark ? "#818CF8" : "#6366F1", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 10 }}>BEDROCK AI ANALYSIS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[["Confidence", `${Math.round(g.aiConfidence * 100)}%`], ["Urgency Score", `${Math.round(g.urgency * 100)}%`], ["Similar Issues Nearby", `${g.aiSimilar} in 5km`]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: textSecondary }}>{k}</span>
                      <span style={{ fontSize: 12, color: textPrimary, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: 16, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 10 }}>VISION AUDIT CRITERIA</div>
                {["Before photo FOV must match After photo exactly", `All detected issues must be resolved in After photo`, "No zoomed-in or partial frame submissions", "Citizen must verify resolution within 24h"].map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ color: dark ? "#818CF8" : "#6366F1", fontSize: 10, marginTop: 2, flexShrink: 0 }}>◆</span>
                    <span style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6 }}>{c}</span>
                  </div>
                ))}
              </div>
              {g.score != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 16, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "14px 16px", border: `1px solid ${border}` }}>
                  <ScoreRing score={g.score} dark={dark} size={52} />
                  <div>
                    <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>RESOLUTION QUALITY</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: g.score >= 80 ? (dark ? "#4ADE80" : "#16A34A") : (dark ? "#FBBF24" : "#D97706"), marginTop: 4 }}>{g.score >= 80 ? "Full repair verified" : "Partial repair"}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "timeline" && (() => {
            // Derive step states from grievance status
            const stepMap: Record<string, number> = {
              pending: 0, "in-progress": 1, escalated: 1,
              resolved: 2, verified: 3, critical: 0,
              PENDING: 0, RESOLUTION_SUBMITTED: 1, PENDING_CITIZEN_VERIFICATION: 2,
              RESOLVED: 3, ESCALATED_DECEPTIVE: 1,
            };
            const currentStep = stepMap[g.status] ?? 0;

            const steps = [
              {
                label: "AI triage completed",
                detail: `${g.aiSimilar > 0 ? g.aiSimilar : 4} issues identified, SLA clock started`,
                time: "Just now",
                state: "done", // always done
              },
              {
                label: "Official repair & upload",
                detail: "Upload After photo to trigger Vision Auditor",
                time: currentStep >= 1 ? "In progress" : "Pending",
                state: currentStep === 1 ? "active" : currentStep > 1 ? "done" : "pending",
              },
              {
                label: "Vision Auditor check",
                detail: "Bedrock compares Before vs After",
                time: currentStep >= 2 ? "In progress" : "Pending",
                state: currentStep === 2 ? "active" : currentStep > 2 ? "done" : "pending",
              },
              {
                label: "Citizen verification",
                detail: "Citizen confirms or disputes resolution",
                time: currentStep >= 3 ? "In progress" : "Pending",
                state: currentStep === 3 ? "active" : currentStep > 3 ? "done" : "pending",
              },
              {
                label: "Ticket closed",
                detail: "Status → RESOLVED",
                time: g.status === "resolved" || g.status === "RESOLVED" ? "Completed" : "Pending",
                state: g.status === "resolved" || g.status === "RESOLVED" ? "done" : "pending",
              },
            ];

            return (
              <div style={{ display: "flex", flexDirection: "column", paddingTop: 4 }}>
                {/* Inline keyframes for ring pulse */}
                <style>{`
                  @keyframes tlRingExpand {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(2.2); opacity: 0; }
                  }
                  @keyframes tlDotPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                  }
                `}</style>
                {steps.map((step, i) => {
                  const isActive = step.state === "active" || (i === 0); // first is always "just done" = active style
                  const isDone = step.state === "done";
                  const isPending = step.state === "pending";

                  // Colors
                  const dotFill = isDone
                    ? (dark ? "#4ADE80" : "#16A34A")
                    : isActive
                    ? (dark ? "#60A5FA" : "#3B82F6")
                    : "transparent";
                  const dotBorder = isDone
                    ? (dark ? "#4ADE80" : "#16A34A")
                    : isActive
                    ? (dark ? "#60A5FA" : "#3B82F6")
                    : (dark ? "#374151" : "#D1D5DB");
                  const lineColor = isDone || i < currentStep
                    ? (dark ? "#4ADE80" : "#16A34A")
                    : (dark ? "#1F2937" : "#E5E7EB");

                  return (
                    <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < steps.length - 1 ? 0 : 0 }}>
                      {/* Left: dot + connector line */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                        {/* Dot with optional pulse ring */}
                        <div style={{ position: "relative", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                          {/* Pulsing outer ring for active steps */}
                          {(isActive) && (
                            <div style={{
                              position: "absolute", width: 16, height: 16, borderRadius: "50%",
                              border: `2px solid ${dotBorder}`,
                              animation: "tlRingExpand 1.8s ease-out infinite",
                              pointerEvents: "none"
                            }} />
                          )}
                          {/* Second ring offset */}
                          {isActive && (
                            <div style={{
                              position: "absolute", width: 16, height: 16, borderRadius: "50%",
                              border: `2px solid ${dotBorder}`,
                              animation: "tlRingExpand 1.8s ease-out 0.6s infinite",
                              pointerEvents: "none"
                            }} />
                          )}
                          {/* Core dot */}
                          <div style={{
                            width: isDone ? 10 : isActive ? 12 : 8,
                            height: isDone ? 10 : isActive ? 12 : 8,
                            borderRadius: "50%",
                            background: dotFill,
                            border: `2px solid ${dotBorder}`,
                            transition: "all 0.3s ease",
                            animation: isActive ? "tlDotPulse 2s ease-in-out infinite" : "none",
                            boxShadow: isActive ? `0 0 8px ${dotBorder}80` : isDone ? `0 0 6px ${dotFill}60` : "none",
                            zIndex: 1,
                          }} />
                          {/* Checkmark for done */}
                          {isDone && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                                <path d="M1 3.5L2.8 5.5L6 1.5" stroke={dark ? "#0B0F1A" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Connector line */}
                        {i < steps.length - 1 && (
                          <div style={{ width: 2, flex: 1, minHeight: 36, marginTop: 4, marginBottom: 4, background: lineColor, borderRadius: 1, transition: "background 0.3s" }} />
                        )}
                      </div>

                      {/* Right: text */}
                      <div style={{ paddingBottom: i < steps.length - 1 ? 24 : 4, flex: 1 }}>
                        <div style={{ fontSize: 9, color: isActive ? (dark ? "#60A5FA" : "#3B82F6") : isDone ? (dark ? "#4ADE80" : "#16A34A") : textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: 3, textTransform: "uppercase" }}>
                          {step.time}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isPending ? (dark ? "#4B5563" : "#9CA3AF") : textPrimary, marginBottom: 3 }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 11, color: isPending ? (dark ? "#374151" : "#D1D5DB") : textSecondary, lineHeight: 1.5 }}>
                          {step.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {tab === "actions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Upload Repair Proof", icon: "↑", desc: "Submit After photo for Vision Auditor", accent: dark ? "#818CF8" : "#6366F1", primary: true },
                { label: "Generate RTI Request", icon: "📄", desc: "Auto-draft RTI under Section 2(j)(i)", accent: dark ? "#4ADE80" : "#16A34A", primary: false },
                { label: "Share to X (Twitter)", icon: "𝕏", desc: "Post with evidence graphic + SLA breach tag", accent: dark ? "#60A5FA" : "#2563EB", primary: false },
                { label: "Escalate to Commissioner", icon: "!", desc: "Flag as deceptive or unresolved", accent: dark ? "#EF4444" : "#DC2626", danger: true },
              ].map(a => (
                <button key={a.label} style={{
                  background: a.danger ? (dark ? "rgba(239,68,68,0.08)" : "rgba(220,38,38,0.05)") : a.primary ? (dark ? "rgba(129,140,248,0.15)" : "rgba(99,102,241,0.1)") : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  border: `1px solid ${a.danger ? (dark ? "rgba(239,68,68,0.25)" : "rgba(220,38,38,0.2)") : a.primary ? (dark ? "rgba(129,140,248,0.3)" : "rgba(99,102,241,0.25)") : border}`,
                  borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left", width: "100%",
                  display: "flex", gap: 12, alignItems: "center", transition: "all 0.15s"
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: a.accent, fontFamily: "'Sora', sans-serif" }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)"
        }} onClick={() => setZoomedImage(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoomedImage} alt="Zoomed" style={{ maxWidth: "95%", maxHeight: "95%", objectFit: "contain", borderRadius: 8 }} />
          <button style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
      )}
    </>
  );
}
