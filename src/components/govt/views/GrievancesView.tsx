'use client';

import React, { useState, useMemo } from 'react';
import { CivicIssue } from '@/lib/types';
import { StatusIcon, PriorityIcon, DoomsdayClock } from '../Atoms';
import { formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export function GrievancesView({ 
  issues, 
  onSelect 
}: { 
  issues: CivicIssue[], 
  onSelect: (issue: CivicIssue) => void 
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(issues.length / ITEMS_PER_PAGE);
  
  const paginatedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return issues.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [issues, currentPage]);

  // Reset to page 1 when issues change (e.g., during search or tab switch)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [issues.length]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header / Filter bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">Issues List</h1>
          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            {issues.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm">
            View Settings
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">
              <th className="px-6 py-3 font-semibold w-12 text-center">Priority</th>
              <th className="px-6 py-3 font-semibold">Title</th>
              <th className="px-6 py-3 font-semibold w-32">Status</th>
              <th className="px-6 py-3 font-semibold w-40">Reported Date</th>
              <th className="px-6 py-3 font-semibold w-48 text-right">Doomsday Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedIssues.length > 0 ? (
              paginatedIssues.map((issue) => (
                <tr 
                  key={issue.rawId || issue.id}
                  onClick={() => onSelect(issue)}
                  className="group border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer select-none"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <PriorityIcon priority={issue.priority} className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400 uppercase">{issue.id}</span>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-md">
                          {issue.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span>{issue.ward}</span>
                        <span>•</span>
                        <span>{issue.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={issue.status} />
                      <span className="text-xs text-gray-600 capitalize">{issue.status.replace('-', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">
                      {formatDate(issue.reportedAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DoomsdayClock reportedAt={issue.reportedAt} slaHours={issue.slaHours} status={issue.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      ?
                    </div>
                    <p className="text-sm font-medium text-gray-900">No issues found</p>
                    <p className="text-xs text-gray-500">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, issues.length)}</span> of <span className="font-semibold text-gray-900">{issues.length}</span> issues
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 mx-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
