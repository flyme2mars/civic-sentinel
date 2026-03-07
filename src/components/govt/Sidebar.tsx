'use client';

import React from 'react';
import { 
  Inbox, 
  CheckCircle2, 
  BarChart3, 
  ChevronDown,
  Building2,
  Search,
  LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'resolved', label: 'Resolved', icon: CheckCircle2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ 
  activeTab, 
  setActiveTab,
  onLogout
}: { 
  activeTab: string, 
  setActiveTab: (id: string) => void,
  onLogout?: () => void
}) {
  return (
    <aside className="w-64 h-screen border-r border-gray-100 flex flex-col bg-white select-none">
      {/* Department Switcher */}
      <div className="p-4 border-b border-gray-100">
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-md bg-gray-900 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="text-left overflow-hidden">
              <div className="text-sm font-semibold truncate text-gray-900 tracking-tight">Sentinel Govt</div>
              <div className="text-[10px] text-gray-500 truncate uppercase font-bold tracking-widest opacity-60">Department Portal</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="mb-6">
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pointer-events-none">
            Workspace
          </button>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-gray-900' : 'text-gray-400'}`} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* User / Bottom */}
      <div className="p-4 border-t border-gray-100">
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
