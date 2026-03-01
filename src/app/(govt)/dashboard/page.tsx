'use client';

import React, { useState } from "react";
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
import { GRIEVANCES, GrievanceType } from "@/lib/mock-data";

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
  const [grievances, setGrievances] = useState<GrievanceType[]>(GRIEVANCES);

  useEffect(() => {
    async function fetchGrievances() {
      try {
        const res = await fetch('/api/grievance/list');
        const data = await res.json();
        if (data.success && data.grievances && data.grievances.length > 0) {
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
          // Replace mocks entirely or prepend. Let's prepend so we still have lots of data to show.
          setGrievances([...formatted, ...GRIEVANCES]);
        }
      } catch (e) {
        console.error("Failed to fetch grievances", e);
      }
    }
    fetchGrievances();
  }, []);

  const bg = dark ? "#0B0F1A" : "#F1F5F9";
  const surface = dark ? "#111827" : "#FFFFFF";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textPrimary = dark ? "#F9FAFB" : "#111827";
  const textSecondary = dark ? "#6B7280" : "#9CA3AF";
  const accent = dark ? "#818CF8" : "#6366F1";

  const filtered = grievances.filter(g => {
    const q = search.toLowerCase();
    const matchSearch = !q || g.title.toLowerCase().includes(q) || g.id.toLowerCase().includes(q) || g.citizen.toLowerCase().includes(q) || g.address.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    if (sortBy === "urgency") return (b.elapsedHours / b.slaHours) - (a.elapsedHours / a.slaHours);
    if (sortBy === "severity") return ["critical","high","medium","low"].indexOf(a.priority) - ["critical","high","medium","low"].indexOf(b.priority);
    return b.reportedAt - a.reportedAt;
  });

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
          {activeNav === "overview" && <OverviewView dark={dark} setSelected={setSelected} border={border} surface={surface} textSecondary={textSecondary} />}
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
