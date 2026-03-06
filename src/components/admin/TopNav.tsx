/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Search } from 'lucide-react'; // Import Search icon

export function TopNav({ 
  surface, border, textSecondary, textPrimary, 
  sidebarOpen, setSidebarOpen, search, setSearch 
}: any) {
  return (
    <header style={{ background: surface, borderBottom: `1px solid ${border}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0, position: "sticky", top: 0, zIndex: 20 }}>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ 
        background: "rgba(0,0,0,0.03)", 
        border: `1px solid ${border}`, 
        color: textSecondary, cursor: "pointer", 
        display: "flex", alignItems: "center", justifyContent: "center", 
        width: 38, height: 38, borderRadius: 10,
        transition: "background 0.15s, color 0.15s", marginRight: 8
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.08)"; e.currentTarget.style.color = textPrimary; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; e.currentTarget.style.color = textSecondary; }}
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

      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textSecondary, width: 16, height: 16 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search issues, tags, or IDs..."
          style={{
            background: "rgba(0,0,0,0.03)",
            border: `1px solid ${search ? "#111827" : border}`,
            borderRadius: 10, padding: "9px 14px 9px 38px", color: textPrimary, fontSize: 13, outline: "none",
            width: "100%", transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: search ? `0 0 0 3px rgba(17,24,39,0.1)` : "none"
          }} />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
        )}
      </div>

      <div style={{ flex: 1 }} /> {/* This pushes the user section to the right */}

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>System Admin</div>
          <div style={{ fontSize: 10, color: textSecondary }}>Superuser</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#111827", flexShrink: 0, border: `1px solid ${border}` }}>AD</div>
      </div>
    </header>
  );
}
