/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { 
  Building2,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { DEPARTMENTS as ACTUAL_DEPARTMENTS } from '@/lib/departments';

export function Sidebar({ activeNav, setActiveNav, NAV, grievancesCount, onLogout, id }: any) {
  const DEPARTMENTS = [
    { id: 'admin-sentinel', name: 'Sentinel Admin', location: 'System Oversight' },
    ...ACTUAL_DEPARTMENTS.map(d => ({
      id: d.id,
      name: d.name,
      location: d.department
    }))
  ];

  return (
    <aside id={id} className="w-64 h-screen border-r border-gray-100 flex flex-col bg-white select-none sticky top-0">
      {/* Department Switcher */}
      <div className="p-4 border-b border-gray-100">
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-md bg-gray-900 flex items-center justify-center flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div className="text-left overflow-hidden">
              <div className="text-sm font-semibold truncate text-gray-900">{DEPARTMENTS[0].name}</div>
              <div className="text-[10px] text-gray-500 truncate">{DEPARTMENTS[0].location}</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="mb-6">
          <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Workspace
          </button>
          {NAV.map((item: any) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeNav === item.id 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {/* If item.icon is a string (emoji/symbol), wrap it, otherwise it could be a component */}
              {typeof item.icon === 'string' ? (
                <span className={`w-4 h-4 flex items-center justify-center text-sm ${activeNav === item.id ? 'opacity-100' : 'opacity-60 grayscale'}`}>{item.icon}</span>
              ) : (
                <item.icon className={`w-4 h-4 ${activeNav === item.id ? 'text-gray-900' : 'text-gray-400'}`} />
              )}
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "grievances" && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{grievancesCount}</span>
              )}
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
