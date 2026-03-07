/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, LogOut, ChevronDown, User, Shield } from 'lucide-react';

export function TopNav({ 
  search, setSearch, onLogout
}: any) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
          <input 
            type="text" 
            placeholder="Search issues, categories, or IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-1.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 rounded-lg text-sm transition-all outline-none"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        <div 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 pl-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-all border border-transparent hover:border-gray-100 group"
        >
          <div className="flex flex-col items-end mr-2">
            <div className="text-[11px] font-bold text-gray-900 leading-none">System Admin</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-white relative">
            AD
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </div>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
            <div className="p-3 border-b border-gray-50 bg-gray-50/30">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account</div>
              <div className="text-xs font-semibold text-gray-900 truncate">admin@civicsentinel.gov</div>
            </div>
            <div className="p-1">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <User className="w-4 h-4 opacity-70" />
                Profile Settings
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Shield className="w-4 h-4 opacity-70" />
                Security Audit
              </button>
            </div>
            <div className="p-1 border-t border-gray-50">
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout System
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
