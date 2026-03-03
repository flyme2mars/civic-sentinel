'use client';

import React, { useState, useEffect } from 'react';

export function StatCard({ label, value, sub, accent, icon, dark, delay = 0 }: { label: string; value: number | string; sub?: string; accent: string; icon: React.ReactNode; dark: boolean; delay?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);
  const target = typeof value === "number" ? value : parseInt(value as string) || 0;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setDisplayed(target); clearInterval(t); }
      else setDisplayed(start);
    }, 20);
    return () => clearInterval(t);
  }, [visible, target]);

  // Simulate occasional live updates
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 4000 + Math.random() * 8000);
    return () => clearInterval(t);
  }, []);

  const bg = dark ? "#111827" : "#FFFFFF";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textSecondary = dark ? "#6B7280" : "#9CA3AF";

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "20px 22px",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      position: "relative", overflow: "hidden",
      boxShadow: dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.08)"
    }}>
      {/* Accent glow */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "50%", background: `${accent}15`, filter: "blur(30px)", pointerEvents: "none" }} />
      {/* Live pulse ring */}
      {pulse && <div style={{ position: "absolute", inset: 0, border: `1px solid ${accent}40`, borderRadius: 16, animation: "ringPulse 0.6s ease-out forwards", pointerEvents: "none" }} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: accent, fontFamily: "'Sora', sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {typeof value === "number" ? displayed.toLocaleString() : displayed.toLocaleString() + "%"}
          </div>
          {sub && <div style={{ fontSize: 11, color: textSecondary, marginTop: 5 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
      </div>
    </div>
  );
}
