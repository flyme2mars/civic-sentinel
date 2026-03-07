'use client';

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopNav } from "@/components/admin/TopNav";
import { OverviewView } from "@/components/admin/views/OverviewView";
import { GrievancesView } from "@/components/admin/views/GrievancesView";
import { DepartmentsView } from "@/components/admin/views/DepartmentsView";
import { WardsView } from "@/components/admin/views/WardsView";
import { AnalyticsView } from "@/components/admin/views/AnalyticsView";
import { ReportsView } from "@/components/admin/views/ReportsView";
import { SettingsView } from "@/components/admin/views/SettingsView";
import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { GrievanceType } from "@/lib/mock-data";
import { 
  LayoutDashboard, 
  Inbox, 
  Building2, 
  Settings, 
  Shield 
} from "lucide-react";

export default function GovernmentDashboard() {
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

  const handleLogout = () => {
    localStorage.removeItem('govt_token');
    setAuthToken(null);
    setIsAuthorized(false);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('govt_token');
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthorized(true);
    }
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
              rawId: dbItem.id,
              title: dbItem.title || "Untitled Grievance",
              description: dbItem.originalDescription || dbItem.summary || "No description provided.",
              category: (dbItem.category || 'other').toLowerCase(),
              status: (dbItem.status || 'pending').toLowerCase(),
              priority: (dbItem.severity || 'medium').toLowerCase(),
              ward: dbItem.location?.area || 'Unknown Ward',
              zone: dbItem.location?.city || 'Unknown Zone',
              address: dbItem.location?.landmark || dbItem.location?.area || 'Unknown Address',
              citizen: dbItem.citizenName || 'Anonymous Citizen',
              phone: dbItem.phoneNumber || 'Not provided',
              reportedAt: new Date(dbItem.createdAt).getTime(),
              slaHours: dbItem.slaHours || 48,
              elapsedHours: (Date.now() - new Date(dbItem.createdAt).getTime()) / 3600000,
              aiConfidence: 0.94,
              aiSimilar: Math.floor(Math.random() * 5),
              urgency: 0.85,
              rtiGenerated: false,
              hasAfter: !!dbItem.afterImageKey,
              assignee: dbItem.targetDepartment || "Unassigned",
              assignedTo: dbItem.assignedTo,
              imageUrl: dbItem.imageUrl,
              evidenceUrls: dbItem.evidenceUrls || [],
              fixedImageUrl: dbItem.fixedImageUrl,
              fixedImageUrls: dbItem.fixedImageUrls || [],
              score: dbItem.score || (dbItem.aiVerificationResult?.confidence ? Math.round(dbItem.aiVerificationResult.confidence * 100) : null),
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

  const bg = "#f8fafc"; // light slate-50
  const surface = "#ffffff"; // pure white
  const border = "#e2e8f0"; // light slate-200
  const textPrimary = "#0f172a"; // slate-900
  const textSecondary = "#64748b"; // slate-500
  const accent = "#0f172a"; // strong slate-900 (like citizen UI buttons)

  // PERFORMANCE: Memoize filtering and sorting logic
  const filtered = React.useMemo(() => {
    return grievances.filter(g => {
      const q = search.toLowerCase();
      const matchSearch = !q || 
        g.title.toLowerCase().includes(q) || 
        g.id.toLowerCase().includes(q) || 
        g.citizen.toLowerCase().includes(q) || 
        g.phone.toLowerCase().includes(q) || 
        g.address.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q);
      
      let matchStatus = true;
      if (filterStatus === "all") {
        matchStatus = true; // Show EVERYTHING including closed and rejected
      } else if (filterStatus === "new") {
        matchStatus = g.status === "pending" || g.status === "critical";
      } else if (filterStatus === "assigned") {
        matchStatus = g.status === "assigned" || g.status === "in-progress";
      } else if (filterStatus === "review") {
        matchStatus = g.status === "verified";
      } else if (filterStatus === "rejected") {
        matchStatus = g.status === "rejected";
      } else {
        matchStatus = g.status === filterStatus;
      }
      
      return matchSearch && matchStatus;
    }).sort((a, b) => {
      if (sortBy === "urgency") {
        const aUrgency = (a.elapsedHours || 0) / (a.slaHours || 48);
        const bUrgency = (b.elapsedHours || 0) / (b.slaHours || 48);
        return bUrgency - aUrgency;
      }
      if (sortBy === "severity") {
        const order = ["critical", "high", "medium", "low"];
        return order.indexOf(a.priority) - order.indexOf(b.priority);
      }
      return b.reportedAt - a.reportedAt;
    });
  }, [grievances, search, filterStatus, sortBy]);

  const NAV = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "grievances", icon: Inbox, label: "Grievances" },
    { id: "departments", icon: Building2, label: "Departments" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const NOTIFS = [
    { msg: "5 new critical issues reported", time: "5 min ago", read: false, color: "#DC2626" },
    { msg: "SLA breach: GRV-2024-003", time: "1 hour ago", read: false, color: "#EA580C" },
    { msg: "Vision audit completed: 3 grievances", time: "2 hours ago", read: true, color: "#16A34A" },
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-2xl border border-gray-100 w-full max-w-md shadow-xl shadow-gray-200/50 text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-500 text-sm mb-8">Secure portal for system administrators.</p>
          
          <input 
            type="password" 
            placeholder="Enter Admin Access Token"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm mb-4 outline-none focus:ring-4 focus:ring-gray-100 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setAuthToken((e.target as HTMLInputElement).value);
                setIsAuthorized(true);
              }
            }}
          />
          <button 
            onClick={(e) => {
              const input = (e.currentTarget.previousSibling as HTMLInputElement);
              setAuthToken(input.value);
              setIsAuthorized(true);
            }}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
          >
            VERIFY IDENTITY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "ui-sans-serif, system-ui, sans-serif", color: textPrimary, display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&display=swap');
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
        activeNav={activeNav} setActiveNav={setActiveNav} 
        NAV={NAV} 
        grievancesCount={grievances.length}
        onLogout={handleLogout}
      />

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopNav 
          search={search} setSearch={setSearch} 
          onLogout={handleLogout}
        />

        {/* CONTENT */}
        <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeNav === "overview" && <OverviewView setSelected={setSelected} border={border} surface={surface} textSecondary={textSecondary} grievances={grievances} />}
          {activeNav === "grievances" && (
            <GrievancesView 
              surface={surface} border={border} 
              textSecondary={textSecondary} textPrimary={textPrimary} accent={accent}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              sortBy={sortBy} setSortBy={setSortBy}
              viewMode={viewMode} setViewMode={setViewMode}
              filtered={filtered} setSelected={setSelected}
            />
          )}
          {activeNav === "departments" && <DepartmentsView surface={surface} border={border} textSecondary={textSecondary} textPrimary={textPrimary} />}
          {activeNav === "settings" && <SettingsView surface={surface} border={border} textSecondary={textSecondary} textPrimary={textPrimary} accent={accent} />}
        </main>
      </div>

      {/* DRAWER */}
      {selected && <DetailDrawer g={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
