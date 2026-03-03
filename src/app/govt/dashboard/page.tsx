'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/govt/Sidebar';
import { GrievancesView } from '@/components/govt/views/GrievancesView';
import { DetailDrawer } from '@/components/govt/DetailDrawer';
import { GRIEVANCES } from '@/lib/mock-data';
import { CivicIssue } from '@/lib/types';
import { Search, Bell, HelpCircle } from 'lucide-react';

export default function GovtDashboard() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIssues = GRIEVANCES.filter(issue => {
    if (activeTab === 'inbox') return issue.status === 'pending' || issue.status === 'in-progress';
    if (activeTab === 'active') return issue.status !== 'resolved' && issue.status !== 'verified';
    if (activeTab === 'resolved') return issue.status === 'resolved' || issue.status === 'verified';
    return true;
  }).filter(issue => 
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    issue.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-gray-100 mx-2" />
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
