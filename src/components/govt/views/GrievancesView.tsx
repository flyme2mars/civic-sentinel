'use client';

import React from 'react';
import { CivicIssue } from '@/lib/types';
import { StatusIcon, PriorityIcon, DoomsdayClock } from '../Atoms';
import { formatDate } from '@/lib/utils';

export function GrievancesView({ 
  issues, 
  onSelect 
}: { 
  issues: CivicIssue[], 
  onSelect: (issue: CivicIssue) => void 
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header / Filter bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">Active Issues</h1>
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
              <th className="px-6 py-3 font-semibold w-12">Priority</th>
              <th className="px-6 py-3 font-semibold">Title</th>
              <th className="px-6 py-3 font-semibold w-32">Status</th>
              <th className="px-6 py-3 font-semibold w-40">Reported Date</th>
              <th className="px-6 py-3 font-semibold w-48 text-right">Doomsday Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr 
                key={issue.id}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
