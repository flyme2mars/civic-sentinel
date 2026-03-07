'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Building2, User } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Simple Header */}
      <nav className="px-6 md:px-12 py-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-black uppercase tracking-tighter text-xl italic">CivicSentinel</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/citizen" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">Portal Access</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto text-center space-y-12">
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-in fade-in slide-in-from-bottom-2 duration-700">
            Next-Gen Grievance Redressal
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100 text-slate-900">
            Accountability <br />
            <span className="text-slate-300">Driven by AI</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Bridging the gap between citizens and governance through transparent tracking and automated verification.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 pt-4">
          <Link href="/citizen" className="w-full sm:w-auto h-16 px-10 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:scale-105 transition-all active:scale-95">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/admin/dashboard" className="w-full sm:w-auto h-16 px-10 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95">
            Admin Portal
          </Link>
        </div>
      </section>

      {/* Feature Grid Placeholder */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto border-t border-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: User, title: "Citizen First", desc: "Report issues with GPS and visual evidence in seconds." },
            { icon: ShieldCheck, title: "AI Verified", desc: "Vision models confirm the quality of every government repair." },
            { icon: Building2, title: "Dept. Insights", desc: "Real-time analytics for faster municipal response times." }
          ].map((f, i) => (
            <div key={i} className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <f.icon className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="font-black uppercase tracking-tight text-lg">{f.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 border-t border-slate-50 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          Built for Bharat · Powered by AWS
        </p>
      </footer>
    </main>
  );
}
