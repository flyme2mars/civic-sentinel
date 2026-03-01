'use client';

import React, { useState, useEffect } from 'react';
import GrievanceForm from '@/components/citizen/GrievanceForm';
import { authProvider, CitizenSession } from '@/lib/aws/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2, CheckCircle2, Clock, MapPin, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function DoomsdayClock({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('SLA BREACHED');
        setIsExpired(true);
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all duration-500 shadow-sm whitespace-nowrap shrink-0",
      isExpired ? "bg-red-50 text-red-600 animate-pulse border border-red-100" : "bg-slate-900 text-white shadow-slate-200"
    )}>
      <Clock className="w-3.5 h-3.5" />
      <span className="font-mono tabular-nums tracking-tighter">{timeLeft}</span>
    </div>
  );
}

export default function CitizenPage() {
  const [session, setSession] = useState<CitizenSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [authStage, setAuthStage] = useState<'phone' | 'otp'>('phone');
  const [authLoading, setAuthLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [myGrievances, setMyGrievances] = useState<any[]>([]);
  const [fetchingGrievances, setFetchingGrievances] = useState(false);

  useEffect(() => {
    const s = authProvider.getSession();
    setSession(s);
    setLoading(false);
  }, []);

  const fetchMyGrievances = async (citizenId: string) => {
    setFetchingGrievances(true);
    try {
      const res = await fetch(`/api/grievance/mine?citizenId=${citizenId}`);
      const data = await res.json();
      if (data.success) setMyGrievances(data.grievances);
    } catch (e) { console.error(e); }
    finally { setFetchingGrievances(false); }
  };

  useEffect(() => {
    if (session) fetchMyGrievances(session.citizenId);
  }, [session]);

  const handleStart = async () => {
    setAuthLoading(true);
    try {
      await authProvider.signIn(phoneNumber);
      setAuthStage('otp');
    } catch (e) { alert("Failed to send OTP"); }
    finally { setAuthLoading(false); }
  };

  const handleVerify = async () => {
    setAuthLoading(true);
    try {
      const s = await authProvider.verifyOtp(phoneNumber, otp, "session");
      setSession(s);
    } catch (e: any) { alert(e.message); }
    finally { setAuthLoading(false); }
  };

  const handleDemoAccess = async () => {
    setAuthLoading(true);
    try {
      setPhoneNumber('+911234567890');
      setOtp('123456');
      const { sessionId } = await authProvider.signIn('+911234567890');
      await new Promise(r => setTimeout(r, 800));
      const s = await authProvider.verifyOtp('+911234567890', '123456', sessionId);
      setSession(s);
    } catch (e: any) { alert(e.message); }
    finally { setAuthLoading(false); }
  };

  if (loading) return null;

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="mx-auto w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-slate-900" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Grievance <span className="text-slate-400 font-medium">Lodged</span></h1>
            <p className="text-slate-500 font-medium leading-relaxed px-4">Your report has been officially recorded in the Sentinel network. The doomsday clock has started for the respective department.</p>
          </div>
          <div className="pt-4">
            <Button onClick={() => window.location.reload()} className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:scale-105 transition-transform active:scale-95">
              Report Another Issue
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <header className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Sentinel <span className="text-slate-400 font-medium">Passport</span></h1>
            <p className="text-slate-400 text-sm font-medium tracking-tight">Verify identity to access civil oversight tools.</p>
          </header>

          <div className="space-y-8">
            {authStage === 'phone' ? (
              <div className="space-y-4">
                <div className="relative group">
                  <Input 
                    type="tel" 
                    placeholder="Mobile Number" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-14 text-center text-lg font-bold tracking-tight bg-white border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-900 transition-all"
                  />
                </div>
                <Button onClick={handleStart} disabled={authLoading || !phoneNumber} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Access"}
                </Button>
                
                <div className="pt-8 flex flex-col items-center gap-4">
                  <div className="w-full h-px bg-slate-200 flex items-center justify-center">
                    <span className="bg-white px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Evaluation Mode</span>
                  </div>
                  <button 
                    onClick={handleDemoAccess} 
                    disabled={authLoading}
                    className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-100 border-2 border-slate-200 hover:bg-slate-900 hover:border-slate-900 transition-all duration-300 w-full justify-center shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    <span className="text-[11px] text-slate-900 group-hover:text-white font-black uppercase tracking-[0.1em]">Judge / Demo Access</span>
                  </button>
                  <p className="text-[9px] text-slate-400 font-medium italic">Instant bypass for hackathon judging.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <Input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-20 text-center text-4xl font-black tracking-[0.4em] bg-white border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-2">Verification code sent to {phoneNumber}</p>
                </div>
                <Button onClick={handleVerify} disabled={authLoading || otp.length < 6} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-200">
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                </Button>
                <button onClick={() => setAuthStage('phone')} className="w-full text-[10px] text-slate-300 font-bold uppercase tracking-widest hover:text-slate-900 transition-colors">Change Number</button>
              </div>
            )}
          </div>

          <footer className="text-center">
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">AI for Bharat • AWS Sentinel System</p>
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white py-16 px-4 animate-in fade-in duration-700">
      <div className="max-w-xl mx-auto space-y-10">
        <header className="space-y-4 text-center">
          <div className="flex justify-between items-center px-4 py-2 bg-white rounded-full mb-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified Citizen</span>
            </div>
            <button onClick={() => {authProvider.logout(); window.location.reload();}} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Logout</button>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase italic">
              CIVIC <span className="text-slate-500">SENTINEL</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg tracking-tight">
              Transparent governance through AI verification.
            </p>
          </div>
        </header>

        <GrievanceForm onSuccess={() => {
          setIsSuccess(true);
          if (session) fetchMyGrievances(session.citizenId);
        }} />

        {/* Status Preview / Doomsday Clock Panel */}
        <section className="pt-10 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Personal Oversight Panel</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Network</span>
            </div>
          </div>

          <div className="space-y-4">
            {fetchingGrievances ? (
              <div className="h-32 flex items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Loader2 className="w-5 h-5 text-slate-200 animate-spin" />
              </div>
            ) : myGrievances.length === 0 ? (
              <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-4 group overflow-hidden relative transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                  <ShieldCheck className="w-32 h-32 text-slate-900" />
                </div>
                <div className="mx-auto w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 transition-colors duration-500">
                  <Clock className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">No active oversight</h3>
                  <p className="text-xs text-slate-400 font-medium max-w-[200px] mx-auto leading-relaxed">Your reported issues will appear here with an active countdown.</p>
                </div>
              </div>
            ) : (
              myGrievances.map((g) => (
                <div key={g.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 space-y-6 relative overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                          g.status === 'OPEN' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {g.status}
                        </span>
                        <span className="text-[10px] text-slate-300 font-medium font-mono">{g.id.split('-')[0]}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 tracking-tight leading-tight group-hover:text-slate-600 transition-colors">{g.title}</h4>
                    </div>
                    <DoomsdayClock deadline={g.deadline} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 group-hover:border-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      {g.imageUrl && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100 ring-4 ring-slate-50 transition-all group-hover:scale-110 group-hover:ring-slate-100 duration-500">
                          <img src={g.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500">{g.location?.city || "Unknown Location"}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(g.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-900 hover:text-white text-slate-300 transition-all duration-500">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
