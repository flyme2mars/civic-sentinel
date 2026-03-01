/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { WARDS } from '@/lib/mock-data';

export function WardsView({ dark, surface, border, textSecondary }: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Ward Monitoring</h2>
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 150px 100px 100px", gap: 16, padding: "14px 20px", borderBottom: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          {["WARD", "ZONE", "COUNCILLOR", "ISSUES", "CRITICAL"].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{h}</div>
          ))}
        </div>
        {WARDS.map((w, i) => (
          <div key={w.id} style={{ display: "grid", gridTemplateColumns: "1fr 150px 150px 100px 100px", gap: 16, padding: "16px 20px", borderBottom: `1px solid ${border}`, alignItems: "center", animation: `fadeSlideUp 0.3s ease ${i * 50}ms both` }}>
            <div>
              <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>{w.id}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{w.name}</div>
            </div>
            <div style={{ fontSize: 13 }}>{w.zone}</div>
            <div style={{ fontSize: 13, color: textSecondary }}>{w.councillor}</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{w.issues}</div>
            <div>
              <span style={{ background: w.critical > 5 ? (dark ? "#4C0519" : "#FFF1F2") : (dark ? "rgba(255,255,255,0.05)" : "#F3F4F6"), color: w.critical > 5 ? (dark ? "#FB7185" : "#E11D48") : textSecondary, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace", border: `1px solid ${w.critical > 5 ? (dark ? "#881337" : "#FECDD3") : border}` }}>
                {w.critical}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
