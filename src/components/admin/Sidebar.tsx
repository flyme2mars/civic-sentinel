/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export function Sidebar({ sidebarOpen, activeNav, setActiveNav, NAV, surface, border, textSecondary, accent, grievancesCount }: any) {
  return (
    <aside style={{
      width: sidebarOpen ? 220 : 68, flexShrink: 0, background: surface, borderRight: `1px solid ${border}`,
      display: "flex", flexDirection: "column", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", height: "100vh", position: "sticky", top: 0, userSelect: "none"
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        {sidebarOpen && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>CivicSentinel</div>
            <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>ADMIN PORTAL</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
        {NAV.map((n: any) => {
          const isActive = activeNav === n.id;
          return (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "10px 12px" : "10px", borderRadius: 8,
              background: isActive ? "#f3f4f6" : "transparent",
              border: `1px solid transparent`,
              color: isActive ? "#111827" : textSecondary, cursor: "pointer",
              transition: "all 0.15s", fontSize: 13, fontWeight: 500,
              justifyContent: sidebarOpen ? "flex-start" : "center", overflow: "hidden", whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && <span>{n.label}</span>}
              {n.id === "grievances" && sidebarOpen && (
                <span style={{ marginLeft: "auto", background: "#f3f4f6", color: "#111827", fontSize: 10, fontWeight: 600, borderRadius: 99, padding: "1px 6px" }}>{grievancesCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${border}`, display: "flex", flexDirection: "column", gap: 6 }}>
      </div>
    </aside>
  );
}
