'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Trash2, Send, Loader2, Wand2, MapPin, X, AlertCircle, FileText, CheckCircle2, ShieldCheck, Check, Search, Upload, Play, Film } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { authProvider, CitizenSession } from '@/lib/aws/auth';

interface Evidence {
  file: File;
  type: 'image' | 'video';
  preview: string;
}

export default function GrievanceForm({ onSuccess }: { onSuccess?: () => void }) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [agentDraft, setAgentDraft] = useState<any>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [agentLogs, setAgentLogs] = useState<{msg: string, type: 'search' | 'map' | 'ai' | 'file'}[]>([]);
  const [investigationStep, setInvestigationStep] = useState('');
  const [evidenceKeys, setEvidenceKeys] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // AUTH STATE
  const [session, setSession] = useState<CitizenSession | null>(null);
  const [authStage, setAuthStage] = useState<'idle' | 'phone' | 'otp'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setSession(authProvider.getSession());
    getGeoLocation();
  }, []);

  const getGeoLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); },
        () => console.warn("Location access denied"),
        { enableHighAccuracy: true }
      );
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) { alert("Camera access denied"); setIsCameraOpen(false); }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        addEvidence(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const addEvidence = (file: File) => {
    const type = file.type.startsWith('video') ? 'video' : 'image';
    const preview = URL.createObjectURL(file);
    setEvidence(prev => [...prev, { file, type, preview }]);
  };

  const removeEvidence = (index: number) => {
    setEvidence(prev => {
      const news = [...prev];
      URL.revokeObjectURL(news[index].preview);
      news.splice(index, 1);
      return news;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(addEvidence);
  };

  const uploadFiles = async () => {
    const keys = await Promise.all(evidence.map(async (ev) => {
      const res = await fetch('/api/upload-url', { 
        method: 'POST', 
        body: JSON.stringify({ fileName: ev.file.name, fileType: ev.file.type }) 
      });
      const { uploadUrl, key } = await res.json();
      await fetch(uploadUrl, { method: 'PUT', body: ev.file, headers: { 'Content-Type': ev.file.type } });
      return key;
    }));
    return keys;
  };

  const handleTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'audio.webm');
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.transcript) setDescription(prev => (prev ? prev + ' ' : '') + data.transcript);
    } catch (e) { console.error(e); } 
    finally { setIsTranscribing(false); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => handleTranscribe(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) { alert("Microphone access required"); }
  };

  const handleDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasImage = evidence.some(ev => ev.type === 'image');
    if (!hasImage) {
      alert("AI requires at least one photo to analyze the ward standards.");
      return;
    }

    setIsDrafting(true);
    setAgentLogs([]);
    const addLog = (msg: string, type: 'search' | 'map' | 'ai' | 'file') => {
      setAgentLogs(prev => [...prev, { msg, type }]);
    };

    try {
      addLog('Uploading evidence vault to secure storage...', 'file');
      const keys = await uploadFiles();
      setEvidenceKeys(keys);

      addLog('Bedrock scanning multiple visual perspectives...', 'file');
      setInvestigationStep('Scanning Images...');
      await new Promise(r => setTimeout(r, 1000));

      addLog('Detecting GPS & identifying municipal ward...', 'map');
      setInvestigationStep('Locating GPS...');
      await new Promise(r => setTimeout(r, 800));

      addLog('Researching municipal SLAs & laws...', 'search');
      setInvestigationStep('Researching Laws...');
      await new Promise(r => setTimeout(r, 1200));

      addLog('Drafting formal grievance with Sentinel AI...', 'ai');
      setInvestigationStep('Refining Complaint...');

      // Only send images to the drafting agent
      const imageKeys = keys.filter((k, i) => evidence[i].type === 'image');

      const res = await fetch('/api/grievance/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageKeys, description, location }),
      });
      const result = await res.json();
      if (result.success) {
        setAgentDraft(result.data.draft);
        addLog('Draft finalized by Sentinel Agent.', 'ai');
      }
    } catch (e: any) { 
      alert("Failed to generate draft."); 
      addLog('Agent encountered an error.', 'ai');
    }
    finally { 
      setTimeout(() => setIsDrafting(false), 500); 
    }
  };

  const handleAuthStart = async () => {
    if (!phoneNumber) return;
    setAuthLoading(true);
    try {
      const { sessionId } = await authProvider.signIn(phoneNumber);
      setOtpSessionId(sessionId);
      setAuthStage('otp');
    } catch (e) { alert("Auth failed"); }
    finally { setAuthLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setAuthLoading(true);
    try {
      const s = await authProvider.verifyOtp(phoneNumber, otp, otpSessionId);
      setSession(s);
      setAuthStage('idle');
    } catch (e: any) { alert(e.message); }
    finally { setAuthLoading(false); }
  };

  const handleFinalSubmit = async () => {
    if (!session) {
      setAuthStage('phone');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/grievance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          draft: agentDraft, 
          evidenceKeys, 
          location, 
          originalDescription: description,
          citizenId: session.citizenId,
          phoneNumber: session.phoneNumber
        }),
      });
      const result = await res.json();
      if (result.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e: any) { alert("Submission failed."); }
    finally { setIsSubmitting(false); }
  };

  if (authStage !== 'idle') {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
        <Card className="w-full max-w-sm border-none shadow-2xl bg-white overflow-hidden animate-in zoom-in-95 duration-300">
          <CardHeader className="bg-slate-900 text-white p-8 text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2"><ShieldCheck className="w-6 h-6 text-white" /></div>
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Sentinel Identity</CardTitle>
            <CardDescription className="text-slate-400 text-xs font-medium">Verify your civic identity to continue.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {authStage === 'phone' ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Mobile Number</Label>
                  <Input 
                    type="tel" 
                    placeholder="+91 XXXXX XXXXX" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 text-lg font-bold tracking-tight bg-slate-50 border-none focus-visible:ring-slate-900"
                  />
                </div>
                <Button 
                  onClick={handleAuthStart} 
                  disabled={authLoading || !phoneNumber}
                  className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold gap-2"
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Verification Code"}
                </Button>
                <button onClick={() => {setPhoneNumber('+911234567890'); setOtp('123456');}} className="w-full text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">Use Demo Mode (Judges)</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5 text-center">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Enter 6-Digit Code</Label>
                  <Input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-16 text-3xl text-center font-black tracking-[0.3em] bg-slate-50 border-none focus-visible:ring-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 font-medium pt-2">Code sent to {phoneNumber}</p>
                </div>
                <Button 
                  onClick={handleVerifyOtp} 
                  disabled={authLoading || otp.length < 6}
                  className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold gap-2"
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
                </Button>
                <button onClick={() => setAuthStage('phone')} className="w-full text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">Change Number</button>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => setAuthStage('idle')} className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* CAMERA PORTAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[120] flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md aspect-[3/4] bg-black rounded-[2.5rem] overflow-hidden relative shadow-2xl ring-1 ring-white/20">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
            
            {/* Viewfinder elements */}
            <div className="absolute top-8 inset-x-8 flex justify-between items-center text-white/60">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Viewfinder</span>
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-white rounded-full animate-pulse" />)}
              </div>
            </div>

            {/* Shutter Button */}
            <div className="absolute bottom-10 inset-x-0 flex items-center justify-center gap-12">
              <button onClick={stopCamera} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <X className="w-5 h-5 text-white" />
              </button>
              <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white p-1 group">
                <div className="w-full h-full bg-white rounded-full transition-transform group-active:scale-90" />
              </button>
              <div className="w-12" /> {/* spacer */}
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: REPORTING */}
      <Card className="border-none shadow-xl bg-white ring-1 ring-slate-100 max-w-2xl mx-auto overflow-hidden">
        <CardHeader className="pb-6 border-b border-slate-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-black text-slate-900 uppercase italic">New Report</CardTitle>
            {location && <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest"><MapPin className="w-3 h-3" /> Location Linked</div>}
          </div>
        </CardHeader>
        <form onSubmit={handleDraft}>
          <CardContent className="pt-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Evidence Vault</Label>
                <span className="text-[10px] font-bold text-slate-300 uppercase">{evidence.length} Items</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={startCamera} className="flex flex-col items-center justify-center h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 hover:bg-white hover:border-slate-900 transition-all group">
                  <Camera className="w-6 h-6 text-slate-400 group-hover:text-slate-900 group-hover:scale-110 transition-all" />
                  <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Take Photo</span>
                </button>
                <button type="button" onClick={() => document.getElementById('fileInput')?.click()} className="flex flex-col items-center justify-center h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 hover:bg-white hover:border-slate-900 transition-all group">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-slate-900 group-hover:scale-110 transition-all" />
                  <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Upload Files</span>
                  <input id="fileInput" type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                </button>
              </div>

              {evidence.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar">
                  {evidence.map((ev, i) => (
                    <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden group shadow-sm ring-1 ring-slate-100">
                      {ev.type === 'image' ? (
                        <img src={ev.preview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                          <Film className="w-6 h-6 text-white/40" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-current" />
                          </div>
                        </div>
                      )}
                      <button type="button" onClick={() => removeEvidence(i)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={cn("relative rounded-2xl border-2 transition-all overflow-hidden", isRecording ? "border-red-500 ring-4 ring-red-50" : "border-slate-100 bg-white")}>
              <Textarea placeholder="Describe the civic issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[160px] p-6 border-none focus-visible:ring-0 bg-transparent resize-none text-sm font-medium leading-relaxed" />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                {isTranscribing && <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /><span className="text-[9px] font-bold uppercase tracking-widest">AI Listening</span></div>}
                <Button type="button" size="icon" variant={isRecording ? "destructive" : "secondary"} className="w-12 h-12 rounded-full shadow-sm" onClick={() => isRecording ? (mediaRecorderRef.current?.stop(), setIsRecording(false)) : startRecording()}>{isRecording ? <Square className="w-4 h-4 fill-current text-white" /> : <Mic className="w-5 h-5 text-slate-600" />}</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-10">
            <div className="w-full space-y-4">
              <Button type="submit" disabled={isDrafting || evidence.length === 0} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] relative overflow-hidden group shadow-xl shadow-slate-200">
                {isDrafting ? (
                  <div className="flex items-center gap-2 animate-in fade-in duration-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="uppercase tracking-widest text-[10px]">{investigationStep}</span>
                  </div>
                ) : (
                  <><Wand2 className="w-4 h-4" /> Analyze with Sentinel AI</>
                )}
              </Button>
              
              {isDrafting && agentLogs.length > 0 && (
                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-top-1 duration-500">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {agentLogs[agentLogs.length - 1].type === 'search' && <Search className="w-3 h-3 text-blue-500 animate-pulse" />}
                    {agentLogs[agentLogs.length - 1].type === 'map' && <MapPin className="w-3 h-3 text-emerald-500 animate-pulse" />}
                    {agentLogs[agentLogs.length - 1].type === 'ai' && <Wand2 className="w-3 h-3 text-purple-500 animate-pulse" />}
                    {agentLogs[agentLogs.length - 1].type === 'file' && <Camera className="w-3 h-3 text-slate-500 animate-pulse" />}
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[300px]">
                      {agentLogs[agentLogs.length - 1].msg}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* STEP 2: VERIFICATION */}
      {agentDraft && (
        <Card className="border-none shadow-2xl bg-white ring-1 ring-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden max-w-2xl mx-auto">
          <div className="bg-slate-900 px-8 py-4 text-white text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Official Report Verification</span>
          </div>

          <CardContent className="space-y-10 pt-10 px-10">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Complaint Title</Label>
              <Textarea 
                value={agentDraft.title} 
                onChange={(e) => setAgentDraft({...agentDraft, title: e.target.value})} 
                className="min-h-[60px] text-xl font-black tracking-tight border-none bg-slate-50 p-4 rounded-xl focus-visible:ring-1 focus-visible:ring-slate-900 resize-none" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Target Department</Label>
                  <Input value={agentDraft.target_department} onChange={(e) => setAgentDraft({...agentDraft, target_department: e.target.value})} className="h-12 text-sm font-bold border-none bg-slate-50 px-4 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Severity</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
                      <button key={lvl} type="button" onClick={() => setAgentDraft({...agentDraft, severity: lvl})} className={cn("h-10 text-[10px] font-bold rounded-lg border transition-all", agentDraft.severity === lvl ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 border-slate-100")}>{lvl}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Primary Evidence</Label>
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md ring-1 ring-slate-100 bg-slate-50">
                    <img src={evidence.find(ev => ev.type === 'image')?.preview} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Location Details</Label>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 shadow-sm">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nearby Landmark</span>
                    <Input value={agentDraft.location.landmark} onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, landmark: e.target.value}})} className="h-10 text-sm font-bold border-none bg-white shadow-sm rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Area / Ward</span>
                      <Input value={agentDraft.location.area} onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, area: e.target.value}})} className="h-10 text-xs font-bold border-none bg-white shadow-sm rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pincode</span>
                      <Input value={agentDraft.location.pincode} onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, pincode: e.target.value}})} className="h-10 text-xs font-bold border-none bg-white shadow-sm rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">City / Town</span>
                    <Input value={agentDraft.location.city} onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, city: e.target.value}})} className="h-10 text-xs font-bold border-none bg-white shadow-sm rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">District</span>
                      <Input value={agentDraft.location.district} onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, district: e.target.value}})} className="h-10 text-xs font-bold border-none bg-white shadow-sm rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">State</span>
                      <Input value={agentDraft.location.state} onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, state: e.target.value}})} className="h-10 text-xs font-bold border-none bg-white shadow-sm rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Resolution Requirements</Label>
              <div className="space-y-3">
                {agentDraft.success_criteria.map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm group hover:border-slate-900 transition-all">
                    <div className="bg-slate-900 p-1.5 rounded-full mt-0.5"><Check className="w-3 h-3 text-white" /></div>
                    <Textarea 
                      value={point} 
                      onChange={(e) => {
                        const nc = [...agentDraft.success_criteria]; nc[i] = e.target.value;
                        setAgentDraft({...agentDraft, success_criteria: nc});
                      }}
                      className="text-sm font-bold text-slate-700 border-none bg-transparent h-auto p-0 min-h-[40px] focus-visible:ring-0 resize-none" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="pb-12 pt-10 px-10 border-t border-slate-50 flex flex-col gap-4">
            <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full h-16 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black text-sm uppercase tracking-widest gap-2 shadow-2xl shadow-slate-200 transition-all active:scale-95">
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><ShieldCheck className="w-5 h-5" /> Lodge Official Grievance</>}
            </Button>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center opacity-50">Authorized by Sentinel Oversight Protocol</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
