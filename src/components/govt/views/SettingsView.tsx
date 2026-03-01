/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export function SettingsView({ dark, surface, border, textSecondary, textPrimary, accent }: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease", maxWidth: 600 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>System Settings</h2>
      
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, borderBottom: `1px solid ${border}`, paddingBottom: 12 }}>Escalation Thresholds</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Auto-Generate RTI</div>
            <div style={{ fontSize: 11, color: textSecondary }}>When SLA breaches by specified hours</div>
          </div>
          <select style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${border}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}>
            <option>+24 Hours</option>
            <option>+48 Hours</option>
            <option>+72 Hours</option>
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Social Media Pressure</div>
            <div style={{ fontSize: 11, color: textSecondary }}>Auto-tweet when cluster exceeds threshold</div>
          </div>
          <select style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${border}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}>
            <option>10 Issues / km²</option>
            <option>20 Issues / km²</option>
            <option>50 Issues / km²</option>
          </select>
        </div>
      </div>

      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, borderBottom: `1px solid ${border}`, paddingBottom: 12 }}>Vision Auditor</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Strict FOV Matching</div>
            <div style={{ fontSize: 11, color: textSecondary }}>Require 100% landmark matching for resolution</div>
          </div>
          <div style={{ width: 44, height: 24, background: accent, borderRadius: 12, position: "relative", cursor: "pointer" }}>
            <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, right: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
