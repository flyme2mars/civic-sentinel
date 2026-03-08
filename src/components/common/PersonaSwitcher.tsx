'use client';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, Shield, Building2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DemoGuide } from './DemoGuide';

export function PersonaSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [showGuide, setShowGuide] = useState(false);

  const personas = [
    { id: 'citizen', label: 'Citizen View', path: '/citizen', icon: User },
    { id: 'admin', label: 'Admin Portal', path: '/admin/dashboard', icon: Shield },
    { id: 'govt', label: 'Dept. Inbox', path: '/govt/dashboard', icon: Building2 },
  ];

  const TOUR_STEPS: Record<string, any[]> = {
    citizen: [
      { targetId: 'tour-scenarios', title: 'Demo Scenarios', content: 'Use these pre-set reports to quickly test the AI drafting and departmental routing without needing a real issue.' },
      { targetId: 'fileInput', title: 'Evidence Vault', content: 'Upload up to 4 photos or videos. AI Vision uses these to identify the exact coordinates and verify the validity of the report.' },
      { targetId: 'tour-ai-review', title: 'AI Assistant', content: 'The Bedrock Agent will analyze your evidence, draft a formal summary, and predict the correct responsible department.' }
    ],
    admin: [
      { targetId: 'tour-nav', title: 'System Oversight', content: 'Access real-time analytics, manage departmental performance, and monitor SLA compliance across all municipal wards.' },
      { targetId: 'tour-nav', title: 'Triage Queue', content: 'Review incoming grievances, verify AI predictions, and officially assign them to local department branches.' }
    ],
    govt: [
      { targetId: 'tour-tabs', title: 'Branch Inbox', content: 'Official portal for municipal officers. View and prioritize assigned grievances within your specific jurisdiction.' },
      { targetId: 'tour-tabs', title: 'Vision Auditor', content: 'Run the AI Vision Auditor on your resolution proof to provide transparent, mathematical evidence of repair quality.' }
    ]
  };

  // Determine active persona based on current path
  const activePersona = pathname.includes('/admin') 
    ? 'admin' 
    : pathname.includes('/govt') 
      ? 'govt' 
      : pathname.includes('/citizen')
        ? 'citizen'
        : 'none';

  if (pathname === '/' || activePersona === 'none') return null;

  return (
    <>
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

          <div className="w-px h-4 bg-slate-200 mx-1" />

          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
            title="Open Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showGuide && (
        <DemoGuide 
          steps={TOUR_STEPS[activePersona]} 
          onClose={() => setShowGuide(false)} 
        />
      )}
    </>
  );
}
