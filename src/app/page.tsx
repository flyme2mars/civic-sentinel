'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Zap,
  Lock,
  Clock,
  Eye,
  Menu,
  X,
  Globe,
  Cpu,
  Inbox,
  Search,
  LogOut,
  Calendar,
  ChevronRight
} from 'lucide-react';

const CustomLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 20L175 50V110C175 155 140 180 100 190C60 180 25 155 25 110V50L100 20Z" 
          stroke="currentColor" 
          strokeWidth="16" 
          strokeLinejoin="round"/>
    <path d="M60 95H140" 
          stroke="currentColor" 
          strokeWidth="16" 
          strokeLinecap="round"/>
    <path d="M100 20V55" 
          stroke="currentColor" 
          strokeWidth="12" 
          strokeLinecap="round"/>
  </svg>
);

const MockGovtSidebar = () => (
  <aside className="w-48 h-full border-r border-gray-100 flex flex-col bg-white select-none hidden md:flex">
    <div className="p-5 border-b border-gray-100 mb-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center p-1 text-white">
          <CustomLogo className="w-full h-full" />
        </div>
        <div>
          <div className="text-[9px] font-black text-gray-900 uppercase tracking-tighter leading-tight">Govt Sentinel</div>
          <div className="text-[7px] text-gray-400 font-bold uppercase tracking-widest leading-tight">Node v4.2</div>
        </div>
      </div>
    </div>
    
    <nav className="flex-1 px-3 space-y-1">
      <div className="px-3 py-2 text-[8px] font-black text-gray-300 uppercase tracking-widest">Intelligence</div>
      {[
        { id: 'analytics', icon: Activity, label: "Analytics", active: true },
        { id: 'inbox', icon: Inbox, label: "Active Feed", active: false },
        { id: 'resolved', icon: CheckCircle2, label: "Audit Log", active: false },
      ].map((item, i) => (
        <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${item.active ? 'bg-gray-900 text-white' : 'text-gray-400'}`}>
          <item.icon className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-widest flex-1">{item.label}</span>
        </div>
      ))}
    </nav>
    
    <div className="p-5 border-t border-gray-100">
      <div className="flex items-center gap-3 px-3 py-2 text-gray-300 font-black text-[8px] uppercase tracking-widest">
        <LogOut className="w-3.5 h-3.5" />
        <span>Deauthorize</span>
      </div>
    </div>
  </aside>
);

const MockGovtTopNav = () => (
  <header className="h-12 border-b border-gray-100 bg-white flex items-center justify-between px-5 shrink-0">
    <div className="flex items-center gap-4 flex-1">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" />
        <div className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-transparent rounded-md text-[9px] text-gray-400">
          Search analytics node...
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-[9px] font-black text-gray-900 uppercase tracking-tighter leading-tight">Public Works Dept</p>
        <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest leading-tight">Kalamassery Division</p>
      </div>
      <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center p-1 text-white">
        <CustomLogo className="w-full h-full" />
      </div>
    </div>
  </header>
);

const MockAnalyticsContent = () => {
  const dailyData = [
    { count: 12, label: "01 MAR" },
    { count: 18, label: "02 MAR" },
    { count: 15, label: "03 MAR" },
    { count: 24, label: "04 MAR" },
    { count: 21, label: "05 MAR" },
    { count: 29, label: "06 MAR" },
    { count: 34, label: "07 MAR" },
  ];

  return (
    <div className="p-6 h-full bg-white font-sans overflow-hidden">
      <div className="w-full space-y-8">
        <div className="flex items-end justify-between border-b border-gray-50 pb-6">
          <div>
            <div className="flex items-center gap-2 text-gray-300 mb-1">
              <Activity className="w-3 h-3" />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Analytics</span>
            </div>
            <h2 className="text-xl font-medium tracking-tight text-gray-900 italic">Performance Intelligence</h2>
          </div>
          <div className="flex gap-8">
            <div>
              <div className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">Volume</div>
              <div className="text-lg font-medium tabular-nums">1,248</div>
            </div>
            <div>
              <div className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">Resolution</div>
              <div className="text-lg font-medium tabular-nums">94%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[8px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-2.5 h-2.5 text-gray-300" />
                Report Volume (7D)
              </h3>
            </div>
            <div className="h-40 w-full border border-gray-50 rounded-lg p-4 flex items-end gap-2 bg-gray-50/10">
              {dailyData.map(({ count, label }, i) => {
                const height = (count / 40) * 100;
                return (
                  <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 relative">
                    <div className="absolute inset-0 bottom-4 bg-gray-100/20 rounded-t-[1px]" />
                    <div 
                      className={`w-full rounded-t-[1px] relative z-0 ${i === 6 ? 'bg-gray-900' : 'bg-gray-200'}`}
                      style={{ height: `calc(${height}% - 16px)` }}
                    />
                    <div className="text-[7px] font-bold text-gray-300 uppercase tracking-tighter h-3 flex items-center">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
             <div className="p-4 rounded-lg border border-gray-50 space-y-2">
                <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">SLA Health</h3>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-light tracking-tighter">98%</div>
                  <div className="flex-1 h-0.5 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900" style={{ width: `98%` }} />
                  </div>
                </div>
                <p className="text-[7px] text-gray-300 leading-relaxed uppercase tracking-widest">
                  2 breaches reported in current cycle.
                </p>
             </div>
             
             <div className="w-full p-4 rounded-lg bg-gray-50/50 border border-gray-50 flex items-center justify-between">
                <div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Auditor Access</div>
                  <div className="text-[10px] font-medium text-gray-900 mt-0.5">Export System CSV</div>
                </div>
                <ArrowRight className="w-3 h-3 text-gray-300" />
             </div>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-4">
            <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Priority Distribution</h3>
            <div className="space-y-2">
              {[
                { name: 'Critical', count: 42 },
                { name: 'High', count: 156 },
                { name: 'Medium', count: 642 },
                { name: 'Low', count: 408 },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-16 text-[8px] font-bold text-gray-300 uppercase">{p.name}</span>
                  <div className="flex-1 h-6 bg-gray-50 rounded flex items-center px-2 relative overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gray-200 opacity-50" 
                      style={{ width: `${(p.count / 1248) * 400}%` }}
                    />
                    <span className="relative text-[9px] font-mono font-bold text-gray-900">{p.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-4">
            <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Pipeline Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { status: 'Pending', count: 86 },
                { status: 'Assigned', count: 142 },
                { status: 'Resolved', count: 954 },
                { status: 'Verified', count: 66 },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-50 flex flex-col gap-0.5">
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">{s.status}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-medium tabular-nums">{s.count}</span>
                    <span className="text-[8px] text-gray-300 font-mono">({Math.round((s.count/1248)*100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MockGovtAnalytics = () => (
  <div className="w-full h-full flex bg-white text-gray-900 font-sans pointer-events-none select-none">
    <MockGovtSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <MockGovtTopNav />
      <div className="flex-1">
        <MockAnalyticsContent />
      </div>
    </div>
  </div>
);

const ProtocolStepper = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Multimodal Capture",
      desc: "Sentinel processes natural speech, raw audio, and high-res imagery. Advanced STT (Speech-to-Text) captures nuances that traditional text forms miss.",
      icon: <Eye className="w-5 h-5" />,
      viz: (
        <div className="relative w-48 h-48 border border-white/5 rounded-2xl flex flex-col items-center justify-center bg-white/[0.01]">
          <div className="flex gap-1 items-end h-12 mb-4">
            {[0.4, 0.7, 0.2, 0.9, 0.5, 0.8, 0.3].map((h, i) => (
              <div key={i} className="w-1.5 bg-white/20 rounded-full animate-pulse" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div className="text-[8px] font-mono text-white/20 tracking-[0.3em]">AUDIO_STREAM_DETECTED</div>
        </div>
      )
    },
    {
      title: "Sentinel AI Synthesis",
      desc: "Our proprietary Sentinel AI classifies issues across departments and generates a high-fidelity formal complaint, mapping multimodal evidence into structured legal data.",
      icon: <Cpu className="w-5 h-5" />,
      viz: (
        <div className="relative w-48 h-48 border border-white/5 rounded-2xl p-4 bg-white/[0.01] overflow-hidden">
          <div className="space-y-2 opacity-20 font-mono text-[7px] text-white">
            <div className="text-indigo-400">{">>"} ANALYZING_VECTORS...</div>
            <div>CATEGORY: INFRASTRUCTURE</div>
            <div>SEVERITY: CRITICAL [0.98]</div>
            <div>DEPT_TARGET: PWD_ROADS</div>
            <div className="h-px bg-white/10 my-2" />
            <div className="animate-pulse">GENERATING_FORMAL_SUMMARY...</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )
    },
    {
      title: "Doomsday Hard-Lock",
      desc: "Sentinel AI hard-codes a legal SLA deadline into the grievance hash. This 'Doomsday Clock' ensures the municipal branch is held to a non-negotiable resolution window.",
      icon: <Clock className="w-5 h-5" />,
      viz: (
        <div className="relative w-48 h-48 border border-white/5 rounded-full flex flex-col items-center justify-center bg-white/[0.01]">
          <div className="text-4xl font-light tracking-tighter text-white/80 tabular-nums">47:59:59</div>
          <div className="text-[7px] font-black text-white/10 uppercase tracking-[0.4em] mt-2">SLA_TICKING</div>
        </div>
      )
    },
    {
      title: "Vision AI Auditing",
      desc: "Upon repair, vision models execute a structural audit by comparing before/after imagery. We verify the resolution pixel-by-pixel to ensure it meets engineering standards.",
      icon: <ShieldCheck className="w-5 h-5" />,
      viz: (
        <div className="relative w-48 h-48 border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-white/[0.02] border-r border-white/5" />
            <div className="flex-1 bg-white/[0.01]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-20 border border-white/10 rounded bg-black/60 backdrop-blur-md flex items-center justify-center">
              <span className="text-[8px] font-mono text-white/40">MATCH_CONFIDENCE: 99.4%</span>
            </div>
          </div>
          <div className="absolute h-full w-px bg-white/40 animate-[move_4s_linear_infinite]" />
        </div>
      )
    },
    {
      title: "RTI Automation",
      desc: "If the Doomsday Clock expires, Sentinel AI automatically constructs a formal RTI PDF using the audit trail, ready for legal submission without human intervention.",
      icon: <AlertCircle className="w-5 h-5" />,
      viz: (
        <div className="relative w-48 h-48 border border-white/5 rounded-2xl flex items-center justify-center bg-white/[0.01]">
          <div className="w-24 h-32 bg-white/5 border border-white/10 rounded p-3 flex flex-col gap-2 relative">
            <div className="w-full h-1.5 bg-white/20 rounded-full" />
            <div className="w-2/3 h-1 bg-white/10 rounded-full" />
            <div className="mt-auto flex justify-between items-center">
              <div className="w-8 h-8 rounded-full border border-white/10" />
              <div className="w-10 h-3 bg-indigo-500/20 rounded" />
            </div>
            <div className="absolute -top-2 -right-2 px-2 py-1 bg-white text-black text-[7px] font-black rounded uppercase">RTI_BUILDER</div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => setActiveStep((prev) => (prev + 1) % steps.length);
  const prevStep = () => setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 no-scrollbar">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            className={`flex-1 min-w-[140px] group relative py-4 transition-all ${i === activeStep ? 'opacity-100' : 'opacity-20 hover:opacity-40'}`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${i === activeStep ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-white/5 border-white/5 text-white/40'}`}>
                {s.icon}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-center px-2">{s.title}</div>
            </div>
            {i === activeStep && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white/40" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-[#080808] border border-white/5 rounded-[32px] p-8 md:p-16 relative">
        <button onClick={prevStep} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/10 hover:text-white transition-all z-20">
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <button onClick={nextStep} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/10 hover:text-white transition-all z-20">
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex justify-center animate-in fade-in duration-700" key={`viz-${activeStep}`}>
          {steps[activeStep].viz}
        </div>

        <div className="space-y-6 animate-in fade-in duration-700" key={`txt-${activeStep}`}>
          <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
            Protocol_Step_0{activeStep + 1}
          </div>
          <h3 className="text-2xl font-medium tracking-tight text-white italic uppercase">
            {steps[activeStep].title}
          </h3>
          <p className="text-neutral-500 leading-relaxed text-base font-normal max-w-md">
            {steps[activeStep].desc}
          </p>
          <div className="pt-4 flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-0.5 rounded-full transition-all duration-500 ${i === activeStep ? 'w-8 bg-white/60' : 'w-2 bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-white/30 selection:text-white font-sans overflow-x-hidden">
      {/* Linear Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-black/60 backdrop-blur-xl border-white/5 py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center p-1 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-110">
              <CustomLogo className="w-full h-full" />
            </div>
            <span className="font-semibold text-lg tracking-tight">CivicSentinel</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-xs font-medium text-white/40 hover:text-white transition-colors uppercase tracking-widest">PRODUCT</Link>
            <Link href="#dashboard" className="text-xs font-medium text-white/40 hover:text-white transition-colors uppercase tracking-widest">ENGINE</Link>
            <Link href="/govt/dashboard" className="text-xs font-medium text-white/40 hover:text-white transition-colors uppercase tracking-widest">GOVERNANCE</Link>
            <Link href="/citizen" className="h-9 px-5 bg-white text-black rounded-full font-bold text-xs flex items-center transition-all hover:bg-neutral-200 active:scale-95 uppercase">
              GET STARTED
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 z-10 text-center space-y-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Real-time Civic Accountability
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic tracking-tighter uppercase">
              Governance <br /> Built for Transparency.
            </h1>
            <p className="text-base md:text-xl text-neutral-500 font-normal max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              The professional standard for infrastructure redressal. AI-powered verification, radical transparency, and citizen-first design.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 pt-4">
            <Link href="/citizen" className="w-full sm:w-auto h-12 px-8 bg-white text-black rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] uppercase">
              REGISTER PORTAL <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/govt/dashboard" className="w-full sm:w-auto h-12 px-8 bg-black border border-white/10 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]">
              BRANCH ACCESS
            </Link>
          </div>
        </div>

        {/* Static 1:1 GOVT Analytics Preview with Glass Frame and Professional Slide Up */}
        <div id="dashboard" className="max-w-5xl mx-auto mt-36 md:mt-56 relative animate-in slide-in-from-bottom-20 fade-in duration-1000 delay-500 h-[620px] text-left group">
          <div className="absolute -inset-4 bg-white/[0.02] blur-3xl rounded-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative h-full p-3 md:p-6 bg-white/[0.04] backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
            <div className="relative h-full bg-white rounded-xl overflow-hidden shadow-2xl border border-black/5 pointer-events-none">
              <MockGovtAnalytics />
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Nodes / Trusted By Section */}
      <section className="py-16 border-y border-white/5 bg-white/[0.01] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-10">
            <div className="text-center">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Integration Nodes</div>
              <div className="text-sm font-bold text-white tracking-[0.2em] uppercase">Verified Authority Channels</div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              {/* PWD Logo */}
              <div className="h-10 md:h-12 w-auto flex items-center justify-center">
                <img src="/pwd.webp" alt="PWD" className="h-full w-auto object-contain" />
              </div>

              {/* KSEB Logo */}
              <div className="h-10 md:h-12 w-auto flex items-center justify-center">
                <img src="/kseb.png" alt="KSEB" className="h-full w-auto object-contain" />
              </div>

              {/* NHAI Logo */}
              <div className="h-8 md:h-10 w-auto flex items-center justify-center">
                <img src="/nhai.png" alt="NHAI" className="h-full w-auto object-contain" />
              </div>

              {/* KWA Logo */}
              <div className="h-10 md:h-14 w-auto flex items-center justify-center">
                <img src="/KWA.png" alt="KWA" className="h-full w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-24 md:py-48 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-tight italic uppercase tracking-tighter">Engineered for <br /> Radical Accountability.</h2>
            <p className="text-neutral-500 leading-relaxed font-normal">Every line of code in CivicSentinel is designed to minimize the friction between reporting an issue and its ultimate resolution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* AI Vision Card */}
            <div className="md:col-span-8 group relative overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-12 flex flex-col justify-between h-[500px]">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
              <div className="absolute right-[-20px] top-[10%] w-[340px] h-[340px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000 hidden lg:block">
                <div className="relative w-full h-full border border-white/10 rounded-full animate-[spin_20s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]" />
                </div>
                <div className="absolute inset-8 border border-white/5 rounded-full border-dashed" />
                <div className="absolute inset-16 border border-white/10 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-full bg-gradient-to-b from-transparent via-white/40 to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
              <div className="relative z-10 max-w-sm space-y-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white/60" />
                </div>
                <h3 className="text-lg font-medium italic uppercase tracking-tighter">AI-Native Verification</h3>
                <p className="text-neutral-500 font-normal leading-relaxed text-sm md:text-base">
                  Automatic computer vision models analyze repair imagery to confirm work quality. We don't just trust a status update; we verify the outcome.
                </p>
              </div>
              <div className="relative z-10 flex gap-4 mt-8">
                <div className="flex-1 h-36 bg-neutral-900 border border-white/5 rounded-xl overflow-hidden relative group/img">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_100%)] opacity-40" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/20 rounded-[4px] text-[7px] font-black z-20 uppercase tracking-widest">System_Capture_01</div>
                  
                  {/* AI Bounding Box Mockup */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 border-2 border-red-500/40 rounded-sm animate-pulse">
                    <div className="absolute -top-4 -left-1 text-[6px] font-black text-red-500 bg-black/80 px-1 py-0.5 whitespace-nowrap">92.4%_ANOMALY_DETECTED</div>
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-500" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-500" />
                  </div>

                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20">
                    <div className="w-16 h-1.5 bg-red-500/40 rounded-full" />
                    <div className="w-12 h-1.5 bg-red-500/20 rounded-full ml-4" />
                  </div>
                </div>

                <div className="flex-1 h-36 bg-neutral-900 border border-white/5 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_100%)] opacity-40" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-[4px] text-[7px] font-black z-20 uppercase tracking-widest">Verification_Final</div>
                  
                  {/* Verification Success UI */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-emerald-500/40 flex items-center justify-center bg-emerald-500/5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-[6px] font-black text-emerald-500 tracking-[0.2em] bg-black/80 px-2 py-1 rounded">VERIFIED_SLA_COMPLIANT</div>
                    </div>
                  </div>

                  {/* Scan Line Effect */}
                  <div className="absolute inset-x-0 h-[1px] bg-emerald-400/40 top-0 animate-[scan_3s_linear_infinite] z-30 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </div>

            {/* Small Card: Real-time / Global Mapping */}
            <div className="md:col-span-4 bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 flex flex-col justify-between group overflow-hidden relative min-h-[350px]">
              <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-48 h-48 opacity-20 group-hover:opacity-40 transition-opacity duration-1000">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 border border-white/20 rounded-full shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]" />
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 border-x border-white/10 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-0 border-x border-white/10 animate-[spin_15s_linear_infinite] opacity-50" style={{ transform: 'rotate(45deg)' }} />
                    <div className="absolute inset-y-1/2 inset-x-0 border-t border-white/10" />
                  </div>
                  <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                  <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white/60 rounded-full animate-pulse shadow-[0_0_8px_white]" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" style={{ animationDelay: '2.5s' }} />
                  <div className="absolute -inset-4 bg-white/[0.02] blur-xl rounded-full" />
                </div>
              </div>
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center relative z-10">
                <Globe className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-3 relative z-10">
                <h3 className="text-lg font-medium italic uppercase tracking-tighter">Global Mapping</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Every grievance is geo-tagged and hashed onto a public record, creating a permanent audit trail.
                </p>
              </div>
            </div>

            {/* Small Card: Analytics / Department APIs */}
            <div className="md:col-span-4 bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 flex flex-col justify-between group overflow-hidden relative min-h-[350px]">
              <div className="relative z-10 space-y-3">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Cpu className="w-5 h-5 text-white/60 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium italic uppercase tracking-tighter">Department APIs</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    Direct integration with municipal backend systems for automated work-order generation.
                  </p>
                </div>
              </div>
              <div className="absolute bottom-[-20px] right-[-20px] w-[280px] h-[200px] bg-white rounded-tl-2xl border-t border-l border-white/10 shadow-2xl transition-transform duration-700 group-hover:translate-x-[-10px] group-hover:translate-y-[-10px] rotate-[-2deg] hidden md:block">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <div className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">Issues List</div>
                  <div className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[8px] font-bold">24</div>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { id: 'CIV-8902', title: 'Pothole Risk', ward: 'Ward 4' },
                    { id: 'CIV-8901', title: 'Water Leakage', ward: 'Ward 12' },
                    { id: 'CIV-8899', title: 'Street Light', ward: 'Ward 8' }
                  ].map((issue, i) => (
                    <div key={i} className="flex flex-col gap-1 border-b border-gray-50 pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-gray-300 uppercase">{issue.id}</span>
                        <span className="text-[10px] font-semibold text-gray-900">{issue.title}</span>
                      </div>
                      <div className="text-[8px] text-gray-400 uppercase tracking-widest">{issue.ward}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-all" />
            </div>

            {/* Large Card: Security */}
            <div className="md:col-span-8 group relative overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center min-h-[400px]">
              <div className="flex-1 space-y-4 relative z-10">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white/60" />
                </div>
                <h3 className="text-lg font-medium italic uppercase tracking-tighter">Privacy-First Architecture</h3>
                <p className="text-neutral-500 font-normal leading-relaxed text-sm md:text-base">
                  Reporting sensitive issues shouldn't expose you. We use enterprise-grade encryption to protect reporter identities while maintaining the validity of the data.
                </p>
              </div>
              <div className="w-full md:w-1/2 h-48 bg-black border border-white/5 rounded-xl p-4 font-mono text-[9px] text-white/20 overflow-hidden relative group-hover:border-white/10 transition-colors">
                <div className="flex items-center gap-1.5 mb-3 opacity-40">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
                <div className="space-y-1">
                  <div className="text-white/40">$ sentinel --encrypt --identity</div>
                  <div className="text-indigo-400/40">&gt; Generating ephemeral session key...</div>
                  <div className="text-indigo-400/40">&gt; Identity sharded across 12 nodes</div>
                  <div className="truncate">f5d8e7b9c1a0d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w...</div>
                  <div className="text-emerald-400/40">&gt; HASH_LOCK_SECURED_ACTIVE</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Lifecycle Stepper */}
      <section className="py-24 md:py-48 px-6 relative overflow-hidden bg-white/[0.01]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Operational Flow</div>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white italic uppercase tracking-tighter">The Sentinel Protocol</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-sm">A systematic approach to municipal accountability, enforced by AI and legal frameworks.</p>
          </div>

          <ProtocolStepper />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-64 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-white/[0.03] blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          <h2 className="text-4xl md:text-7xl font-medium tracking-tighter italic uppercase tracking-tighter">
            Governance, <br />
            <span className="text-neutral-500">streamlined.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/citizen" className="w-full sm:w-auto h-14 px-10 bg-white text-black rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-neutral-200 transition-all active:scale-95">
              PORTAL ACCESS <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/govt/dashboard" className="text-white/40 hover:text-white font-medium uppercase tracking-widest text-[11px] transition-colors border border-white/10 px-6 py-4 rounded-lg">
              OFFICIAL DASHBOARD
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-6">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center p-1 font-bold">
                <CustomLogo className="w-full h-full" />
              </div>
              <span className="font-semibold text-sm tracking-widest uppercase">CivicSentinel</span>
            </div>
            <p className="text-neutral-600 text-[11px] font-medium max-w-xs uppercase tracking-widest leading-loose">
              Automating infrastructure accountability through advanced vision systems.
            </p>
          </div>
          
          <div className="flex gap-16 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">
            <div className="flex flex-col gap-4">
              <div className="text-white/40 italic uppercase">Product</div>
              <Link href="#" className="hover:text-white transition-colors uppercase">Features</Link>
              <Link href="#" className="hover:text-white transition-colors uppercase">Integrations</Link>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-white/40 italic uppercase">Legal</div>
              <Link href="#" className="hover:text-white transition-colors uppercase">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors uppercase">Terms</Link>
            </div>
          </div>

          <div className="text-[10px] font-semibold text-neutral-800 uppercase tracking-[0.4em] italic">
            BUILD_2026.03.07_STABLE
          </div>
        </div>
      </footer>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black p-8 flex flex-col gap-12 md:hidden animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center p-1 font-bold">
              <CustomLogo className="w-full h-full" />
            </div>
            <button onClick={() => setIsMenuOpen(false)}><X /></button>
          </div>
          <div className="flex flex-col gap-8">
            <Link href="#features" onClick={() => setIsMenuOpen(false)} className="text-3xl font-medium tracking-tight italic uppercase tracking-tighter">PRODUCT</Link>
            <Link href="#dashboard" onClick={() => setIsMenuOpen(false)} className="text-3xl font-medium tracking-tight italic uppercase tracking-tighter">ENGINE</Link>
            <Link href="/govt/dashboard" onClick={() => setIsMenuOpen(false)} className="text-3xl font-medium tracking-tight italic text-white/30 uppercase tracking-tighter">GOVERNANCE</Link>
          </div>
          <Link href="/citizen" onClick={() => setIsMenuOpen(false)} className="mt-auto h-16 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xs uppercase tracking-[0.2em]">
            GET STARTED
          </Link>
        </div>
      )}
    </div>
  );
}
