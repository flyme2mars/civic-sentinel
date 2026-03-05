/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export function TopNav({ 
  dark, surface, border, textSecondary, textPrimary, 
  sidebarOpen, setSidebarOpen, search, setSearch, notifOpen, setNotifOpen, NOTIFS 
}: any) {
  return (
    <header style={{ background: surface, borderBottom: `1px solid ${border}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0, position: "sticky", top: 0, zIndex: 20 }}>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ 
        background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", 
        border: `1px solid ${border}`, 
        color: textSecondary, cursor: "pointer", 
        display: "flex", alignItems: "center", justifyContent: "center", 
        width: 38, height: 38, borderRadius: 10,
        transition: "background 0.15s, color 0.15s", marginRight: 8
      }}
        onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"; e.currentTarget.style.color = textPrimary; }}
        onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"; e.currentTarget.style.color = textSecondary; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {sidebarOpen ? (
            <>
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
      </button>
      
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>Grievance Control Center</div>
        <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: dark ? "rgba(74,222,128,0.08)" : "rgba(22,163,74,0.07)", border: `1px solid ${dark ? "rgba(74,222,128,0.2)" : "rgba(22,163,74,0.2)"}`, borderRadius: 99, padding: "5px 12px" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dark ? "#4ADE80" : "#16A34A", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: dark ? "#4ADE80" : "#16A34A", fontWeight: 700 }}>LIVE</span>
      </div>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: dark ? "#4B5563" : "#9CA3AF", fontSize: 13, pointerEvents: "none" }}>⊕</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, issue, or location..."
          style={{
            background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            border: `1px solid ${search ? (dark ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.4)") : border}`,
            borderRadius: 10, padding: "9px 14px 9px 34px", color: textPrimary, fontSize: 12, outline: "none",
            width: 280, fontFamily: "'Sora', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: search ? `0 0 0 3px ${dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"}` : "none"
          }} />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: dark ? "#6B7280" : "#9CA3AF", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
        )}
      </div>

      {/* Notif */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${border}`, borderRadius: 10, width: 38, height: 38, cursor: "pointer", color: textSecondary, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          🔔
          <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: dark ? "#EF4444" : "#DC2626", borderRadius: "50%", border: `2px solid ${surface}`, animation: "pulse 2s infinite" }} />
        </button>
        {notifOpen && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 300, background: surface, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden", zIndex: 50, boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(0,0,0,0.15)", animation: "fadeSlideUp 0.2s ease" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", color: textSecondary }}>NOTIFICATIONS</div>
            {NOTIFS.map((n: any, i: number) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, display: "flex", gap: 10, alignItems: "flex-start", background: n.read ? "transparent" : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)") }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: n.color, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: textPrimary }}>{n.msg}</div>
                  <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Commissioner Sharma</div>
          <div style={{ fontSize: 10, color: textSecondary }}>Municipal Corporation</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#F97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>CS</div>
      </div>
    </header>
  );
}
