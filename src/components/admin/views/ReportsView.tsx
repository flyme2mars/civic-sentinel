/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export function ReportsView({ dark, surface, border, textSecondary, accent }: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Automated Reports</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { title: "Monthly SLA Compliance Report", type: "PDF", date: "Mar 1, 2026" },
          { title: "Ward-wise Grievance Distribution", type: "CSV", date: "Mar 1, 2026" },
          { title: "Vision Auditor Success Rates", type: "PDF", date: "Feb 28, 2026" },
          { title: "Citizen Verification Logs", type: "CSV", date: "Feb 25, 2026" },
        ].map((r, i) => (
          <div key={i} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", animation: `fadeSlideUp 0.3s ease ${i * 50}ms both` }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: textSecondary, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Generated: {r.date}</div>
            </div>
            <button style={{ background: dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", color: accent, border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
              Download {r.type}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
