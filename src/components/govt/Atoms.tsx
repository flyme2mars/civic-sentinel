'use client';

import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { 
  Circle, 
  CircleDashed, 
  CircleDot, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  AlertTriangle,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  MoreHorizontal
} from 'lucide-react';
import { Status, Priority } from '@/lib/types';

export function StatusIcon({ status, className = "w-4 h-4" }: { status: Status, className?: string }) {
  switch (status) {
    case 'pending':
      return <Circle className={`${className} text-gray-400`} />;
    case 'in-progress':
      return <CircleDot className={`${className} text-blue-500`} />;
    case 'resolved':
      return <CheckCircle2 className={`${className} text-green-500`} />;
    case 'escalated':
      return <AlertTriangle className={`${className} text-orange-500`} />;
    case 'critical':
      return <AlertCircle className={`${className} text-red-500`} />;
    case 'verified':
      return <CheckCircle2 className={`${className} text-purple-500`} />;
    default:
      return <CircleDashed className={`${className} text-gray-300`} />;
  }
}

export function PriorityIcon({ priority, className = "w-4 h-4" }: { priority: Priority, className?: string }) {
  switch (priority) {
    case 'critical':
      return <AlertCircle className={`${className} text-red-600`} />;
    case 'high':
      return <ArrowUpCircle className={`${className} text-orange-500`} />;
    case 'medium':
      return <ArrowRightCircle className={`${className} text-yellow-500`} />;
    case 'low':
      return <ArrowDownCircle className={`${className} text-blue-400`} />;
    default:
      return <MoreHorizontal className={`${className} text-gray-400`} />;
  }
}

export function DoomsdayClock({ reportedAt, slaHours, status }: { reportedAt: number, slaHours: number, status: Status }) {
  const { breached, h, m, pct } = useCountdown(reportedAt, slaHours);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (status === 'pending') {
    return (
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
        Pending Audit
      </span>
    );
  }

  if (status === 'resolved' || status === 'verified') {
    return (
      <span className="text-[11px] font-medium text-green-600 uppercase tracking-wider">
        Completed
      </span>
    );
  }

  if (!isMounted) {
    return <div className="h-5" />; // Placeholder to avoid layout shift
  }

  return (
    <div className="flex items-center gap-3">
      <span className={`font-mono text-sm font-bold tracking-tighter ${breached ? 'text-red-600' : 'text-gray-900'}`}>
        {breached ? '-' : ''}{String(Math.abs(h)).padStart(2, '0')}:{String(Math.abs(m)).padStart(2, '0')}:00
      </span>
      <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${breached ? 'bg-red-500' : 'bg-gray-400'}`}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'outline' | 'secondary' }) {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    outline: "border border-gray-200 text-gray-600",
    secondary: "bg-blue-50 text-blue-700 border border-blue-100"
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-tight ${styles[variant]}`}>
      {children}
    </span>
  );
}
