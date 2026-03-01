/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export function Sidebar({ dark, setDark, sidebarOpen, activeNav, setActiveNav, NAV, surface, border, textSecondary, accent }: any) {
  return (
    <aside style={{
      width: sidebarOpen ? 220 : 68, flexShrink: 0, background: surface, borderRight: `1px solid ${border}`,
      display: "flex", flexDirection: "column", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", height: "100vh", position: "sticky", top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#F97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🛡</div>
        {sidebarOpen && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>CivicSentinel</div>
            <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>GOV PORTAL</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
        {NAV.map((n: any) => {
          const isActive = activeNav === n.id;
          return (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "10px 12px" : "10px", borderRadius: 10,
              background: isActive ? (dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)") : "transparent",
              border: `1px solid ${isActive ? (dark ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.2)") : "transparent"}`,
              color: isActive ? accent : textSecondary, cursor: "pointer",
              transition: "all 0.15s", fontSize: 12, fontWeight: isActive ? 700 : 500,
              justifyContent: sidebarOpen ? "flex-start" : "center", overflow: "hidden", whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && <span>{n.label}</span>}
              {n.id === "grievances" && sidebarOpen && (
                <span style={{ marginLeft: "auto", background: dark ? "rgba(239,68,68,0.2)" : "rgba(220,38,38,0.1)", color: dark ? "#EF4444" : "#DC2626", fontSize: 9, fontWeight: 700, borderRadius: 99, padding: "1px 6px", fontFamily: "'DM Mono', monospace" }}>23</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${border}`, display: "flex", flexDirection: "column", gap: 6 }}>
        <button onClick={() => setDark(!dark)} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
          background: "transparent", border: "none", color: textSecondary, cursor: "pointer",
          transition: "all 0.15s", fontSize: 12, justifyContent: sidebarOpen ? "flex-start" : "center", overflow: "hidden", whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 16 }}>{dark ? "☀️" : "🌙"}</span>
          {sidebarOpen && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
      </div>
    </aside>
  );
}
