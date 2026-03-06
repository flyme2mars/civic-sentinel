/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { WARDS } from '@/lib/mock-data';

export function WardsView({ surface, border, textSecondary }: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Ward Monitoring</h2>
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 150px 100px 100px", gap: 16, padding: "14px 20px", borderBottom: `1px solid ${border}`, background: "#f3f4f6" }}>
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
              <span style={{ background: w.critical > 5 ? "rgba(17,24,39,0.05)" : "#F3F4F6", color: w.critical > 5 ? "#111827" : textSecondary, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, border: `1px solid ${w.critical > 5 ? "rgba(17,24,39,0.1)" : border}` }}>
                {w.critical}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
