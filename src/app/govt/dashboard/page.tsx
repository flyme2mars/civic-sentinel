'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/govt/Sidebar';
import { GrievancesView } from '@/components/govt/views/GrievancesView';
import { AnalyticsView } from '@/components/govt/views/AnalyticsView';
import { DetailDrawer } from '@/components/govt/DetailDrawer';
import { CivicIssue } from '@/lib/types';
import { Search, ShieldAlert, Lock, User as UserIcon } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/departments';

export default function GovtDashboard() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [grievances, setGrievances] = useState<CivicIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // LOGIN STATE
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [branchId, setBranchId] = useState<string | null>(null);

  // For the API call, we still need the actual token from env (hardcoded for hackathon demo if needed)
  const GOVT_TOKEN = "sentinel2026"; // Matches process.env.GOVT_API_TOKEN in dev

  useEffect(() => {
    const savedBranch = localStorage.getItem('govt_branch_id');
    const authStatus = localStorage.getItem('govt_authorized');
    if (savedBranch && authStatus === 'true') {
      setBranchId(savedBranch);
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const dept = DEPARTMENTS.find(d => d.id.toUpperCase() === username.toUpperCase());
    
    if (!dept) {
      setError('Invalid Branch ID. Please check your credentials.');
      return;
    }

    if (password !== '123456') {
      setError('Incorrect password. Access denied.');
      return;
    }

    // Success
    localStorage.setItem('govt_branch_id', dept.id);
    localStorage.setItem('govt_authorized', 'true');
    setBranchId(dept.id);
    setIsAuthorized(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('govt_branch_id');
    localStorage.removeItem('govt_authorized');
    setIsAuthorized(false);
    setBranchId(null);
  };

  useEffect(() => {
    if (!isAuthorized || !branchId) return;

    async function fetchGrievances() {
      setIsLoading(true);
      try {
        // Pass the branch ID to filter the grievances
        const res = await fetch(`/api/grievance/list?branch=${branchId}`, {
          headers: { 'x-govt-token': GOVT_TOKEN }
        });
        const data = await res.json();
        
        if (res.status === 401) {
          handleLogout();
          return;
        }

        if (data.success && data.grievances) {
          const formatted: CivicIssue[] = data.grievances.map((dbItem: any) => {
            const reportedAt = dbItem.createdAt ? new Date(dbItem.createdAt).getTime() : Date.now();
            const slaHours = dbItem.slaHours || 48;
            return {
              id: dbItem.id.includes('-') ? "CIV-" + dbItem.id.split('-')[0].toUpperCase() : dbItem.id,
              rawId: dbItem.id,
              title: dbItem.title || "Untitled Grievance",
              description: dbItem.summary || dbItem.originalDescription || "No description provided.",
              category: (dbItem.category || 'other').toLowerCase(),
              status: dbItem.status === 'OPEN' ? 'pending' : 
                      dbItem.status === 'IN_PROGRESS' ? 'in-progress' : 
                      dbItem.status === 'FIXED' ? 'resolved' : 
                      dbItem.status === 'VERIFIED' ? 'verified' : 
                      dbItem.status === 'REJECTED' || dbItem.status === 'ESCALATED' ? 'escalated' : 'pending',
              priority: (dbItem.severity || 'medium').toLowerCase() as any,
              ward: dbItem.location?.area || 'Unknown Ward',
              zone: dbItem.location?.city || 'Unknown Zone',
              address: dbItem.location?.landmark || dbItem.location?.area || 'Unknown Address',
              citizen: 'Anonymous Citizen',
              phone: 'Not provided',
              reportedAt: reportedAt,
              deadline: reportedAt + (slaHours * 3600000),
              isEscalated: dbItem.isEscalated || false,
              slaHours: slaHours,
              aiConfidence: 0.94,
              imageUrl: dbItem.imageUrl,
              fixedImageUrl: dbItem.fixedImageUrl,
              evidenceUrls: dbItem.evidenceUrls || [],
              evidenceKeys: dbItem.evidenceKeys || [],
              assignee: dbItem.targetDepartment || "Unassigned",
            };
          });
          setGrievances(formatted);
        }
      } catch (e) {
        console.error("Failed to fetch grievances", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGrievances();
  }, [isAuthorized, branchId]);

  const filteredIssues = useMemo(() => {
    return grievances.filter(issue => {
      if (activeTab === 'inbox') return issue.status === 'pending' || issue.status === 'in-progress' || issue.status === 'escalated';
      if (activeTab === 'resolved') return issue.status === 'resolved' || issue.status === 'verified';
      return true;
    })
    .filter(issue => 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      issue.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [grievances, activeTab, searchQuery]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-inter">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 w-full max-w-md shadow-2xl shadow-gray-200/50">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-900/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Govt Sentinel</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Branch Authorization Protocol</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch Identity ID</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. PWD_KALAMASSERY"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Credentials</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Passcode"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-[11px] text-red-600 font-bold leading-tight uppercase tracking-tighter">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-[0.98] mt-4"
            >
              Authorize Access
            </button>
          </form>

          <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center opacity-50">
            Encrypted End-to-End Civil Oversight
          </p>
        </div>
      </div>
    );
  }

  const currentDept = DEPARTMENTS.find(d => d.id === branchId);

  return (
    <div className="flex h-screen bg-white text-gray-900 font-inter selection:bg-blue-100 selection:text-blue-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
              <input 
                type="text" 
                placeholder="Search issues, tags, or IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 rounded-lg text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{currentDept?.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{currentDept?.department}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-gray-200">
              {branchId?.substring(0, 2)}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'analytics' ? (
            <AnalyticsView grievances={grievances} />
          ) : (
            <GrievancesView 
              issues={filteredIssues} 
              onSelect={setSelectedIssue} 
            />
          )}
        </main>
      </div>

      {/* Detail Drawer */}
      {selectedIssue && (
        <>
          <div 
            className="fixed inset-0 bg-black/5 z-40 backdrop-blur-[1px]" 
            onClick={() => setSelectedIssue(null)}
          />
          <DetailDrawer 
            issue={selectedIssue} 
            authToken={GOVT_TOKEN}
            onClose={() => setSelectedIssue(null)} 
          />
        </>
      )}
    </div>
  );
}
