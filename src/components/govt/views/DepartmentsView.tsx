/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ScoreRing } from '../Atoms';
import { DEPARTMENTS } from '@/lib/mock-data';

export function DepartmentsView({ dark, surface, border, textSecondary, textPrimary }: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Department Performance</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {DEPARTMENTS.map((dept, i) => (
          <div key={dept.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, animation: `fadeSlideUp 0.3s ease ${i * 50}ms both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{dept.id}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{dept.name}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◫</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>ACTIVE</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 4 }}>{dept.active}</div>
              </div>
              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>RESOLVED</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 4 }}>{dept.resolved}</div>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${border}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: textSecondary }}>HOD: <span style={{ color: textPrimary, fontWeight: 600 }}>{dept.head}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ScoreRing score={dept.sla} dark={dark} size={28} />
                <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: textSecondary }}>SLA</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
