'use client';

import React, { useMemo } from 'react';
import { CivicIssue } from '@/lib/types';
import { 
  BarChart3, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Activity,
  ArrowRight
} from 'lucide-react';

export function AnalyticsView({ grievances }: { grievances: CivicIssue[] }) {
  const exportToCSV = () => {
    if (grievances.length === 0) return;
    
    // Define headers
    const headers = ["ID", "Title", "Category", "Status", "Priority", "Ward", "Address", "ReportedAt", "SLACountdown"];
    
    // Map data to rows
    const rows = grievances.map(g => [
      g.id,
      `"${g.title.replace(/"/g, '""')}"`, // Escape quotes
      g.category,
      g.status,
      g.priority,
      `"${g.ward}"`,
      `"${g.address.replace(/"/g, '""')}"`,
      new Date(g.reportedAt).toISOString(),
      g.slaHours
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sentinel_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => {
    const total = grievances.length;
    const resolved = grievances.filter(g => g.status === 'resolved' || g.status === 'verified').length;
    const escalated = grievances.filter(g => g.status === 'escalated').length;

    // Time Series: Grievances per day (last 7 days)
    const now = Date.now();
    const dayMs = 86400000;
    const dailyData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now - (6 - i) * dayMs);
      const label = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const count = grievances.filter(g => {
        const timestamp = g.reportedAt;
        return timestamp >= dayStart && timestamp < dayStart + dayMs;
      }).length;
      return { count, label };
    });

    const categories = grievances.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statuses = grievances.reduce((acc, g) => {
      acc[g.status] = (acc[g.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      resolved,
      escalated,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(0) : 0,
      dailyData,
      categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
      statuses: Object.entries(statuses)
    };
  }, [grievances]);

  return (
    <div className="p-8 h-full overflow-y-auto bg-white animate-in fade-in duration-500 font-sans selection:bg-gray-100">
      <div className="w-full space-y-12">
        
        {/* Header */}
        <div className="flex items-end justify-between border-b border-gray-100 pb-8">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System Analytics</span>
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-gray-900">Performance Intelligence</h2>
          </div>
          <div className="flex gap-12">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total volume</div>
              <div className="text-2xl font-medium tabular-nums">{stats.total}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resolution</div>
              <div className="text-2xl font-medium tabular-nums">{stats.resolutionRate}%</div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Trend Line (7 Days) */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                Report Volume (7D)
              </h3>
              <span className="text-[10px] text-gray-400 font-medium italic">Auto-syncing with DynamoDB</span>
            </div>
            <div className="h-56 w-full border border-gray-100 rounded-xl p-6 flex items-end gap-3 group hover:border-gray-200 transition-colors bg-gray-50/20">
              {stats.dailyData.map(({ count, label }, i) => {
                const max = Math.max(...stats.dailyData.map(d => d.count), 5);
                const height = (count / max) * 100;
                return (
                  <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group/bar relative">
                    {/* Background track for the bar */}
                    <div className="absolute inset-0 bottom-6 bg-gray-100/50 rounded-t-sm" />
                    
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded mb-1 font-mono z-10">
                      {count}
                    </div>
                    
                    {/* The actual bar */}
                    <div 
                      className="w-full bg-gray-300 group-hover/bar:bg-slate-600 transition-all duration-500 rounded-t-sm relative z-0"
                      style={{ height: `calc(${Math.max(height, 2)}% - 24px)` }}
                    />

                    {/* X-Axis Label */}
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1 h-4 flex items-center">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Metrics */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
             <div className="p-6 rounded-xl border border-gray-100 space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">SLA Health</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-light tracking-tighter">{(100 - (stats.escalated / stats.total * 100 || 0)).toFixed(0)}%</div>
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900" style={{ width: `${100 - (stats.escalated / stats.total * 100 || 0)}%` }} />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider">
                  {stats.escalated} out of {stats.total} grievances have breached legal SLA thresholds.
                </p>
             </div>
             
             <button 
                onClick={exportToCSV}
                className="w-full p-6 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all"
             >
                <div className="text-left">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors">Quick Report</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">Export Auditor CSV</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
             </button>
          </div>

          {/* Bottom Row: Category & Status */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Distribution by Category</h3>
            <div className="space-y-3">
              {stats.categories.map(([name, count]) => (
                <div key={name} className="flex items-center gap-4 group">
                  <span className="w-24 text-[10px] font-bold text-gray-400 uppercase truncate">{name}</span>
                  <div className="flex-1 h-8 bg-gray-50 rounded flex items-center px-3 relative overflow-hidden group-hover:bg-gray-100 transition-colors">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gray-100 group-hover:bg-gray-200 transition-colors" 
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                    <span className="relative text-[11px] font-mono font-bold text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-6">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Pipeline Status</h3>
            <div className="grid grid-cols-2 gap-4">
              {stats.statuses.map(([status, count]) => (
                <div key={status} className="p-4 rounded-xl border border-gray-100 flex flex-col gap-1 hover:border-gray-300 transition-colors cursor-default">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{status}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-medium tabular-nums">{count}</span>
                    <span className="text-[10px] text-gray-400 font-mono">({((count/stats.total)*100).toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
