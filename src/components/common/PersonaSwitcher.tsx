'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, Shield, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PersonaSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const personas = [
    { id: 'citizen', label: 'Citizen View', path: '/citizen', icon: User },
    { id: 'admin', label: 'Admin Portal', path: '/admin/dashboard', icon: Shield },
    { id: 'govt', label: 'Dept. Inbox', path: '/govt/dashboard', icon: Building2 },
  ];

  const activePersona = pathname.includes('/admin') 
    ? 'admin' 
    : pathname.includes('/govt') 
      ? 'govt' 
      : pathname.includes('/citizen')
        ? 'citizen'
        : 'none';

  if (pathname === '/' || activePersona === 'none') return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-[100] flex justify-center pointer-events-none">
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-1 flex items-center gap-1 ring-1 ring-black/5 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {personas.map((p) => {
          const isActive = activePersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => router.push(p.path)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                isActive 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <p.icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-slate-300")} />
              <span className="hidden md:inline">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
