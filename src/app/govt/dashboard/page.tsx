'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/govt/Sidebar';
import { GrievancesView } from '@/components/govt/views/GrievancesView';
import { DetailDrawer } from '@/components/govt/DetailDrawer';
import { CivicIssue } from '@/lib/types';
import { Search } from 'lucide-react';

export default function GovtDashboard() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [grievances, setGrievances] = useState<CivicIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // SECURITY: Basic Token-based Authorization for Hackathon
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
      setIsLoading(true);
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
          console.log("[Dashboard] Raw grievances from API:", data.grievances);
          setIsAuthorized(true);
          localStorage.setItem('govt_token', authToken!);
          
          const formatted: CivicIssue[] = data.grievances.map((dbItem: any) => {
            console.log("[Dashboard] Mapping item:", dbItem.id);
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
  }, [authToken]);

  const filteredIssues = useMemo(() => {
    return grievances.filter(issue => {
      if (activeTab === 'inbox') return issue.status === 'pending' || issue.status === 'in-progress' || issue.status === 'escalated';
      if (activeTab === 'active') return issue.status !== 'resolved' && issue.status !== 'verified';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-inter">
        <div className="bg-white p-10 rounded-2xl border border-gray-100 w-full max-w-md shadow-xl shadow-gray-200/50 text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl">🛡️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Government Access</h1>
          <p className="text-gray-500 text-sm mb-8">Secure portal for authorized civil auditors.</p>
          
          <input 
            type="password" 
            placeholder="Enter Government Access Token"
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
    <div className="flex h-screen bg-white text-gray-900 font-inter selection:bg-blue-100 selection:text-blue-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <GrievancesView 
            issues={filteredIssues} 
            onSelect={setSelectedIssue} 
          />
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
            onClose={() => setSelectedIssue(null)} 
          />
        </>
      )}
    </div>
  );
}
