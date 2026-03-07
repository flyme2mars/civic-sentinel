'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { authProvider, CitizenSession } from '@/lib/aws/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Loader2, CheckCircle2, Clock, MapPin, ChevronLeft, Send, Share2, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import RtiEditor from '@/components/citizen/RtiEditor';
import SocialEditor from '@/components/citizen/SocialEditor';

function DoomsdayClock({ deadline, status, large, onExpire }: { deadline: string, status: string, large?: boolean, onExpire?: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const isStopped = status === 'RESOLVED' || status === 'CLOSED' || status === 'VERIFIED';
    
    if (isStopped) {
      setTimeLeft('SLA HALTED');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('SLA BREACHED');
        if (!isExpired) {
          setIsExpired(true);
          if (onExpire) onExpire();
        }
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline, isExpired, onExpire, status]);

  const isStopped = status === 'RESOLVED' || status === 'CLOSED' || status === 'VERIFIED';

  return (
    <div className={cn(
      "flex items-center gap-2 rounded-xl font-black tracking-widest uppercase transition-all duration-500 whitespace-nowrap shrink-0 relative overflow-hidden",
      large ? "px-6 py-4 text-sm shadow-xl min-w-[180px] justify-center" : "px-4 py-2 text-[10px] shadow-sm min-w-[120px] justify-center",
      isStopped 
        ? "bg-slate-50 text-slate-400 border border-slate-200 shadow-none" 
        : isExpired 
          ? "bg-white text-rose-600 border border-rose-200 shadow-[0_0_20px_rgba(225,29,72,0.15)] ring-1 ring-rose-50" 
          : "bg-slate-900 text-white shadow-slate-200"
    )}>
      {isExpired && !isStopped && (
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      )}
      <Clock className={cn(large ? "w-5 h-5" : "w-3 h-3", isExpired && !isStopped ? "text-rose-500" : "")} />
      <span className="font-mono tabular-nums tracking-tighter leading-none relative z-10">{timeLeft}</span>
      {isExpired && !isStopped && (
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ml-1 shrink-0" />
      )}
    </div>
  );
}

export default function GrievanceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [g, setGrievance] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<CitizenSession | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const s = authProvider.getSession();
    if (!s) {
      router.push('/');
      return;
    }
    setSession(s);
    fetchGrievance(s.citizenId);
  }, [id, router]);

  const fetchGrievance = async (citizenId: string) => {
    try {
      const res = await fetch(`/api/grievance/mine?citizenId=${citizenId}`);
      const data = await res.json();
      if (data.success) {
        const found = data.grievances.find((item: any) => item.id === id);
        if (found) setGrievance(found);
        else router.push('/');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCitizenAction = async (action: 'CLOSED' | 'ESCALATED') => {
    if (!session) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/grievance/citizen-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, citizenId: session.citizenId, action })
      });
      const data = await res.json();
      if (data.success) {
        setGrievance((prev: any) => ({ ...prev, status: data.updatedStatus }));
      } else {
        alert(data.error || 'Failed to update grievance.');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
    </div>
  );

  if (!g) return null;

  const media = g.evidenceUrls || [];
  const isAlreadyExpired = new Date().getTime() > new Date(g.deadline).getTime();
  const isStopped = g.status === 'RESOLVED' || g.status === 'CLOSED' || g.status === 'VERIFIED';
  const showEscalation = (isAlreadyExpired || isExpired) && !isStopped;

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* NAVIGATION HEADER */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 md:px-12 py-4 md:py-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="group flex items-center gap-2 md:gap-3 text-slate-500 hover:text-slate-900 transition-all"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.1em]">Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4 text-right">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full" />
            <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-slate-900">Reference ID: {g.id.split('-')[0]}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-12 space-y-8 md:space-y-12 pb-24">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* LEFT COLUMN: EVIDENCE & INFO (8 Cols) */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
              <div className="aspect-square md:aspect-[16/9] relative bg-white flex items-center justify-center group">
                {media.length > 0 ? (
                  <img
                    src={media[activeIndex]}
                    className="w-full h-full object-contain animate-in fade-in duration-700"
                    alt="Evidence"
                  />
                ) : (
                  <div className="text-slate-200 uppercase font-bold tracking-widest text-xs">No media provided</div>
                )}

                {media.length > 1 && (
                  <div className="absolute inset-x-4 flex justify-between items-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setActiveIndex(prev => (prev > 0 ? prev - 1 : media.length - 1))} className="w-10 h-10 bg-white/90 text-slate-900 rounded-full flex items-center justify-center shadow-md border border-slate-100">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActiveIndex(prev => (prev < media.length - 1 ? prev + 1 : 0))} className="w-10 h-10 bg-white/90 text-slate-900 rounded-full flex items-center justify-center shadow-md border border-slate-100">
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                )}
              </div>

              {media.length > 1 && (
                <div className="p-4 flex gap-2 md:gap-3 justify-center border-t border-slate-50 bg-slate-50/30 overflow-x-auto no-scrollbar">
                  {media.map((url: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={cn(
                        "w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                        activeIndex === i ? "border-slate-900 scale-105" : "border-transparent opacity-50 hover:opacity-100"
                      )}
                    >
                      <img src={url} className="w-full h-full object-cover" alt="Thumb" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <div className="p-6 md:p-10 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-6 md:space-y-8">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Grievance Summary</span>
                <p className="text-base md:text-lg text-slate-700 font-medium leading-relaxed italic">"{g.summary || "Summary processing..."}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Location</span>
                  <div className="flex items-start gap-2 text-slate-900">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-tight">{g.location?.landmark}</p>
                      <p className="text-xs text-slate-500 font-medium">{g.location?.area}, {g.location?.city}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 md:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Report Date</span>
                  <p className="text-sm font-bold text-slate-900">{new Date(g.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">{new Date(g.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            {/* RESOLUTION REVIEW PANEL */}
            {(g.status === 'RESOLVED' || g.status === 'CLOSED' || g.status === 'VERIFIED') && g.fixedImageUrl && (
              <div className="p-6 md:p-10 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-slate-900" />
                    <h3 className="text-lg md:text-xl font-bold uppercase tracking-tighter text-slate-900">Department Resolution</h3>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                    The department has reported this issue as resolved. Please review the evidence provided.
                  </p>
                </div>

                <div className="aspect-video relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group shadow-sm">
                  <img src={g.fixedImageUrl} alt="Resolution Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full border border-slate-200 text-[9px] font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> Post-Repair
                  </div>
                </div>

                {g.aiVerificationResult && (
                  <div className={cn(
                    "p-4 rounded-xl border flex items-start gap-3",
                    g.aiVerificationResult.verified 
                      ? "bg-emerald-50 border-emerald-100" 
                      : "bg-amber-50 border-amber-200"
                  )}>
                    {g.aiVerificationResult.verified ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className={cn(
                        "text-xs font-bold uppercase tracking-widest",
                        g.aiVerificationResult.verified ? "text-emerald-900" : "text-amber-900"
                      )}>
                        AI Quality Audit: {g.aiVerificationResult.verified ? "Verified" : "Warning - Flagged"}
                      </p>
                      <p className={cn(
                        "text-xs leading-relaxed font-medium",
                        g.aiVerificationResult.verified ? "text-emerald-700" : "text-amber-800"
                      )}>
                        {g.aiVerificationResult.reasoning || "The AI system reviewed the post-repair image."}
                      </p>
                    </div>
                  </div>
                )}

                {g.status !== 'CLOSED' ? (
                  <div className="pt-4 border-t border-slate-50 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Final Verification Required</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => handleCitizenAction('CLOSED')}
                        disabled={actionLoading}
                        className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-[0.1em] gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Confirm Resolution
                      </Button>
                      <Button 
                        onClick={() => handleCitizenAction('ESCALATED')}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex-1 h-14 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-[0.1em] gap-2 transition-all active:scale-95 shadow-sm"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        Dispute Verification
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-50 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                      <CheckCircle2 className="w-6 h-6 text-slate-900" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Issue Officially Closed</p>
                    <p className="text-[10px] text-slate-500 font-medium">You have confirmed the resolution of this grievance.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: STATUS & CLOCK (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-2">Resolution Countdown</span>
              <div className="p-6 md:p-8 bg-white rounded-2xl shadow-md border border-slate-100 flex flex-col items-center gap-4 md:gap-6">
                <DoomsdayClock deadline={g.deadline} status={g.status} large onExpire={() => setIsExpired(true)} />
                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed max-w-[200px]">Estimated timeframe for department resolution</p>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-2xl border border-slate-100 space-y-4 md:space-y-6 shadow-sm relative overflow-hidden group">
              <div className="relative z-10 space-y-3 md:space-y-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Responsible Department</span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-tight text-slate-900">{g.targetDepartment || "Unassigned"}</h4>
                  <p className="text-xs text-slate-500 font-medium">{g.officialDesignation || "Pending Assignment"}</p>
                </div>
                <div className="pt-4 flex items-center gap-2 border-t border-slate-50 mt-4">
                  {g.status === 'CLOSED' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-600">Case Closed</span>
                    </>
                  ) : g.status === 'RESOLVED' || g.status === 'VERIFIED' ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-600">Pending Citizen Approval</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-amber-600">Awaiting Resolution</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: CASE ACTION CENTER (Full Width) */}
        <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
          <div className="p-6 md:p-12 lg:p-16 space-y-10 md:space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6 md:pb-8">
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tighter text-slate-900">Case Action Center</h3>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Legal escalation and public awareness tools</p>
              </div>
              <div className={cn("inline-flex self-start px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]", showEscalation ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-400")}>
                {showEscalation ? "Protocol Active" : "Locked / Monitoring"}
              </div>
            </div>

            {!showEscalation ? (
              <div className="py-16 md:py-20 text-center space-y-4 md:space-y-6 opacity-60">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                  <Clock className="w-6 h-6 text-slate-200" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-widest">Monitoring SLA Compliance</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-loose text-center px-4">
                    Escalation tools will be enabled automatically if the department fails to resolve the issue within the legal timeframe.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 animate-in fade-in slide-in-from-top-4 duration-1000">
                {/* Channel 01: Social Media Section */}
                {/* Channel 01: Social Media Section */}
                <div className="space-y-6 p-6 md:p-10 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-900">
                    <Share2 className="w-5 h-5" />
                    <h4 className="text-sm font-bold uppercase tracking-widest">Channel 01: Public Awareness</h4>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Generate an AI post for social media to bring public attention to this unresolved grievance.
                  </p>

                  {/* Drop the new component here! */}
                  <SocialEditor grievance={g} citizenId={session?.citizenId || ''} />
                </div>

                {/* Channel 02: Legal RTI Section */}
                <div className="space-y-6 p-6 md:p-10 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-900">
                    <FileText className="w-5 h-5" />
                    <h4 className="text-sm font-bold uppercase tracking-widest">Channel 02: Legal Request (RTI)</h4>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Review, edit, and generate a formal Right to Information (RTI) application to legally compel the department for an explanation.
                  </p>

                  {/* Drop in the new editor and pass the full grievance object */}
                  <RtiEditor grievance={g} citizenId={session?.citizenId || ''} />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
