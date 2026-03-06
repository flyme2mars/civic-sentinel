/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Search } from 'lucide-react';

export function TopNav({ 
  search, setSearch 
}: any) {
  return (
    <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
          <input 
            type="text" 
            placeholder="Search issues, tags, or IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 rounded-lg text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex flex-col items-end mr-2">
            <div className="text-[11px] font-bold text-gray-900 leading-none">System Admin</div>
            <div className="text-[9px] text-gray-500 mt-1 uppercase tracking-tighter">Superuser</div>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
