'use client';

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/govt/Sidebar";
import { TopNav } from "@/components/govt/TopNav";
import { OverviewView } from "@/components/govt/views/OverviewView";
import { GrievancesView } from "@/components/govt/views/GrievancesView";
import { DepartmentsView } from "@/components/govt/views/DepartmentsView";
import { WardsView } from "@/components/govt/views/WardsView";
import { AnalyticsView } from "@/components/govt/views/AnalyticsView";
import { ReportsView } from "@/components/govt/views/ReportsView";
import { SettingsView } from "@/components/govt/views/SettingsView";
import { DetailDrawer } from "@/components/govt/DetailDrawer";
import { GrievanceType } from "@/lib/mock-data";

export default function GovernmentDashboard() {
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("grievances");
  const [selected, setSelected] = useState<GrievanceType | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("urgency");
  const [viewMode, setViewMode] = useState("grid");
  const [notifOpen, setNotifOpen] = useState(false);
  const [grievances, setGrievances] = useState<GrievanceType[]>([]);
  
  // SECURITY: Basic Token-based Authorization for Hackathon
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('govt_token');
    if (savedToken) setAuthToken(savedToken);
  }, []);

  useEffect(() => {
    if (!authToken) return;

    async function fetchGrievances() {
      try {
        const res = await fetch('/api/grievance/list', {
          headers: { 'x-govt-token': authToken! }
        });
        const data = await res.json();
        
        if (res.status === 401) {
          setIsAuthorized(false);
          localStorage.removeItem('govt_token');
          return;
        }

        if (data.success && data.grievances) {
          setIsAuthorized(true);
          localStorage.setItem('govt_token', authToken!);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formatted = data.grievances.map((dbItem: any) => {
            return {
              id: "CIV-" + dbItem.id.split('-')[0].toUpperCase(),
              title: dbItem.title || "Untitled Grievance",
              description: dbItem.summary || dbItem.originalDescription || "",
              category: (dbItem.category || 'other').toLowerCase(),
              status: dbItem.status === 'OPEN' ? 'pending' : dbItem.status === 'IN_PROGRESS' ? 'in-progress' : dbItem.status === 'FIXED' ? 'resolved' : dbItem.status === 'VERIFIED' ? 'verified' : 'pending',
              priority: (dbItem.severity || 'medium').toLowerCase(),
              ward: dbItem.location?.area || 'Unknown Ward',
              zone: dbItem.location?.city || 'Unknown Zone',
              address: dbItem.location?.landmark || dbItem.location?.area || 'Unknown Address',
              citizen: 'Anonymous Citizen',
              phone: 'Not provided',
              reportedAt: new Date(dbItem.createdAt).getTime(),
              slaHours: dbItem.slaHours || 48,
              elapsedHours: (Date.now() - new Date(dbItem.createdAt).getTime()) / 3600000,
              aiConfidence: 0.94,
              aiSimilar: Math.floor(Math.random() * 5),
              urgency: 0.85,
              rtiGenerated: false,
              hasAfter: !!dbItem.afterImageKey,
              assignee: dbItem.targetDepartment || "Unassigned",
              imageUrl: dbItem.imageUrl,
            };
          });
          setGrievances(formatted);
        }
      } catch (e) {
        console.error("Failed to fetch grievances", e);
      }
    }
    fetchGrievances();
  }, [authToken]);

  const bg = dark ? "#0B0F1A" : "#f8fafc"; // dark navy vs light slate-50
  const surface = dark ? "#111827" : "#ffffff"; // dark surface vs pure white
  const border = dark ? "rgba(255,255,255,0.07)" : "#e2e8f0"; // dark border vs light slate-200
  const textPrimary = dark ? "#F9FAFB" : "#0f172a"; // dark text vs slate-900
  const textSecondary = dark ? "#9CA3AF" : "#64748b"; // dark muted vs slate-500
  const accent = dark ? "#818CF8" : "#0f172a"; // indigo accent vs strong slate-900 (like citizen UI buttons)

  // PERFORMANCE: Memoize filtering and sorting logic
  const filtered = React.useMemo(() => {
    return grievances.filter(g => {
      const q = search.toLowerCase();
      const matchSearch = !q || g.title.toLowerCase().includes(q) || g.id.toLowerCase().includes(q) || g.citizen.toLowerCase().includes(q) || g.address.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || g.status === filterStatus;
      return matchSearch && matchStatus;
    }).sort((a, b) => {
      if (sortBy === "urgency") return (b.elapsedHours / b.slaHours) - (a.elapsedHours / a.slaHours);
      if (sortBy === "severity") {
        const order = ["critical", "high", "medium", "low"];
        return order.indexOf(a.priority) - order.indexOf(b.priority);
      }
      return b.reportedAt - a.reportedAt;
    });
  }, [grievances, search, filterStatus, sortBy]);

  const NAV = [
    { id: "overview", icon: "⬡", label: "Overview" },
    { id: "grievances", icon: "◈", label: "Grievances" },
    { id: "departments", icon: "◫", label: "Departments" },
    { id: "wards", icon: "📍", label: "Wards" },
    { id: "analytics", icon: "◎", label: "Analytics" },
    { id: "reports", icon: "◆", label: "Reports" },
    { id: "settings", icon: "⊕", label: "Settings" },
  ];

  const NOTIFS = [
    { msg: "5 new critical issues reported", time: "5 min ago", read: false, color: dark ? "#EF4444" : "#DC2626" },
    { msg: "SLA breach: GRV-2024-003", time: "1 hour ago", read: false, color: dark ? "#F97316" : "#EA580C" },
    { msg: "Vision audit completed: 3 grievances", time: "2 hours ago", read: true, color: dark ? "#4ADE80" : "#16A34A" },
  ];

  if (!isAuthorized) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0F1A", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Sora', sans-serif" }}>
        <div style={{ background: "#111827", padding: 40, borderRadius: 24, border: "1px solid rgba(255,255,255,0.07)", width: "100%", maxWidth: 400, textAlign: "center", spaceY: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🛡️</div>
          <h1 style={{ color: "#F9FAFB", fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>GOVERNMENT ACCESS</h1>
          <p style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 32 }}>Secure portal for authorized civil auditors.</p>
          
          <input 
            type="password" 
            placeholder="Enter Government Access Token"
            style={{ width: "100%", padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, marginBottom: 16, outline: "none" }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAuthToken((e.target as HTMLInputElement).value);
            }}
          />
          <button 
            onClick={(e) => {
              const input = (e.currentTarget.previousSibling as HTMLInputElement);
              setAuthToken(input.value);
            }}
            style={{ width: "100%", padding: "16px", background: "#F9FAFB", color: "#0B0F1A", borderRadius: 12, fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer" }}
          >
            VERIFY IDENTITY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Sora', sans-serif", color: textPrimary, display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes ringPulse { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.04)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input::placeholder { color: ${textSecondary}; }
        select option { background: ${surface}; color: ${textPrimary}; }
        button:active { transform: scale(0.97); }
      `}</style>

      <Sidebar 
        dark={dark} setDark={setDark} 
        sidebarOpen={sidebarOpen} 
        activeNav={activeNav} setActiveNav={setActiveNav} 
        NAV={NAV} 
        surface={surface} border={border} 
        textSecondary={textSecondary} accent={accent} 
        grievancesCount={grievances.length}
      />

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopNav 
          dark={dark} surface={surface} border={border} 
          textSecondary={textSecondary} textPrimary={textPrimary} 
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} 
          search={search} setSearch={setSearch} 
          notifOpen={notifOpen} setNotifOpen={setNotifOpen} 
          NOTIFS={NOTIFS} 
        />

        {/* CONTENT */}
        <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeNav === "overview" && <OverviewView dark={dark} setSelected={setSelected} border={border} surface={surface} textSecondary={textSecondary} grievances={grievances} />}
          {activeNav === "grievances" && (
            <GrievancesView 
              dark={dark} surface={surface} border={border} 
              textSecondary={textSecondary} textPrimary={textPrimary} accent={accent}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              sortBy={sortBy} setSortBy={setSortBy}
              viewMode={viewMode} setViewMode={setViewMode}
              filtered={filtered} setSelected={setSelected}
            />
          )}
          {activeNav === "departments" && <DepartmentsView dark={dark} surface={surface} border={border} textSecondary={textSecondary} textPrimary={textPrimary} />}
          {activeNav === "wards" && <WardsView dark={dark} surface={surface} border={border} textSecondary={textSecondary} />}
          {activeNav === "analytics" && <AnalyticsView textSecondary={textSecondary} />}
          {activeNav === "reports" && <ReportsView dark={dark} surface={surface} border={border} textSecondary={textSecondary} accent={accent} />}
          {activeNav === "settings" && <SettingsView dark={dark} surface={surface} border={border} textSecondary={textSecondary} textPrimary={textPrimary} accent={accent} />}
        </main>
      </div>

      {/* DRAWER */}
      {selected && <DetailDrawer g={selected} dark={dark} onClose={() => setSelected(null)} />}
    </div>
  );
}
