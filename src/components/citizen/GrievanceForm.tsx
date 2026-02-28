'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Trash2, Send, Loader2, Wand2, MapPin, X, AlertCircle, FileText, CheckCircle2, ShieldCheck, Check, Search } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function GrievanceForm() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [agentDraft, setAgentDraft] = useState<any>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [agentLogs, setAgentLogs] = useState<{msg: string, type: 'search' | 'map' | 'ai' | 'file'}[]>([]);
  const [investigationStep, setInvestigationStep] = useState('');
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const getGeoLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (p) => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocationLoading(false); },
        () => setLocationLoading(false),
        { enableHighAccuracy: true }
      );
    }
  };
  useEffect(() => { getGeoLocation(); }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File | Blob, name: string, type: string) => {
    const res = await fetch('/api/upload-url', { method: 'POST', body: JSON.stringify({ fileName: name, fileType: type }) });
    const { uploadUrl, key } = await res.json();
    await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': type } });
    return key;
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
    setIsDrafting(true);
    setAgentLogs([]);
    
    const addLog = (msg: string, type: 'search' | 'map' | 'ai' | 'file') => {
      setAgentLogs(prev => [...prev, { msg, type }]);
    };

    try {
      let key = imageKey;
      if (!key && image) {
        addLog('Uploading evidence to secure storage...', 'file');
        key = await uploadFile(image, image.name, image.type);
        setImageKey(key);
      }

      addLog('Scanning uploaded image for visual evidence...', 'file');
      setInvestigationStep('Scanning Image...');
      await new Promise(r => setTimeout(r, 1000));

      addLog('Detecting GPS & identifying municipal ward...', 'map');
      setInvestigationStep('Locating GPS...');
      await new Promise(r => setTimeout(r, 800));

      addLog('Fusing map data with local landmarks...', 'map');
      await new Promise(r => setTimeout(r, 600));

      addLog('Searching web for municipal SLAs & laws...', 'search');
      setInvestigationStep('Researching Laws...');
      await new Promise(r => setTimeout(r, 1200));

      addLog('Drafting formal grievance with Sentinel AI...', 'ai');
      setInvestigationStep('Refining Complaint...');

      const res = await fetch('/api/grievance/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageKey: key, description, location }),
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

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/grievance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: agentDraft, imageKey, location, originalDescription: description }),
      });
      const result = await res.json();
      if (result.success) {
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e: any) { alert("Submission failed."); }
    finally { setIsSubmitting(false); }
  };

  if (isSuccess) {
    return (
      <Card className="border-none shadow-2xl bg-white p-12 text-center space-y-6 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
        <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-black tracking-tighter">Submission Successful</CardTitle>
          <CardDescription className="text-slate-500 font-medium text-lg">Your grievance has been officially recorded and sent to the concerned department.</CardDescription>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl px-8">Report Another Issue</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* STEP 1: REPORTING */}
      <Card className="border-none shadow-xl bg-white ring-1 ring-slate-100 max-w-2xl mx-auto">
        <CardHeader className="pb-6 border-b border-slate-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-slate-900">New Report</CardTitle>
            {location && <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest"><MapPin className="w-3 h-3" /> Location Linked</div>}
          </div>
        </CardHeader>
        <form onSubmit={handleDraft}>
          <CardContent className="pt-8 space-y-6">
            {!imagePreview ? (
              <div onClick={() => document.getElementById('imageInput')?.click()} className="group flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white transition-all cursor-pointer">
                <Camera className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform" />
                <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Photo</p>
                <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden aspect-video group shadow-md ring-1 ring-slate-200">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <Button type="button" variant="destructive" size="icon" onClick={() => {setImage(null); setImagePreview(null); setImageKey(null);}} className="absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></Button>
              </div>
            )}
            <div className={cn("relative rounded-2xl border-2 transition-all", isRecording ? "border-red-500 ring-4 ring-red-50" : "border-slate-100 bg-white")}>
              <Textarea placeholder="Describe the issue..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[140px] p-5 border-none focus-visible:ring-0 bg-transparent resize-none text-sm" />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                {isTranscribing && <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /><span className="text-[10px] font-bold uppercase tracking-tighter">Transcribing...</span></div>}
                <Button type="button" size="icon" variant={isRecording ? "destructive" : "secondary"} className="w-10 h-10 rounded-full" onClick={() => isRecording ? (mediaRecorderRef.current?.stop(), setIsRecording(false)) : startRecording()}>{isRecording ? <Square className="w-4 h-4 fill-current text-white" /> : <Mic className="w-4 h-4" />}</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-8">
            <div className="space-y-3">
              <Button type="submit" disabled={isDrafting || (!image && !description)} className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold gap-2 relative overflow-hidden group">
                {isDrafting ? (
                  <div className="flex items-center gap-2 animate-in fade-in duration-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="uppercase tracking-widest text-[10px]">{investigationStep}</span>
                  </div>
                ) : (
                  <><FileText className="w-4 h-4" /> Review Draft</>
                )}
              </Button>
              
              {isDrafting && agentLogs.length > 0 && (
                <div className="flex items-center justify-center gap-2 py-1 px-2 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-top-1 duration-500">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {agentLogs[agentLogs.length - 1].type === 'search' && <Search className="w-3 h-3 text-blue-500 animate-pulse" />}
                    {agentLogs[agentLogs.length - 1].type === 'map' && <MapPin className="w-3 h-3 text-emerald-500 animate-pulse" />}
                    {agentLogs[agentLogs.length - 1].type === 'ai' && <Wand2 className="w-3 h-3 text-purple-500 animate-pulse" />}
                    {agentLogs[agentLogs.length - 1].type === 'file' && <Camera className="w-3 h-3 text-slate-500 animate-pulse" />}
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[250px]">
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
        <Card className="border-none shadow-2xl bg-white ring-1 ring-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
          <div className="bg-slate-900 px-8 py-4 text-white text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Official Report Verification</span>
          </div>

          <CardContent className="space-y-10 pt-10 px-10">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Complaint Title</Label>
              <Textarea 
                value={agentDraft.title} 
                onChange={(e) => setAgentDraft({...agentDraft, title: e.target.value})} 
                className="min-h-[60px] text-xl font-bold tracking-tight border-none bg-slate-50 p-4 rounded-xl focus-visible:ring-1 focus-visible:ring-slate-900 resize-none" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Target Department</Label>
                  <Input value={agentDraft.target_department} onChange={(e) => setAgentDraft({...agentDraft, target_department: e.target.value})} className="h-12 text-sm font-bold border-none bg-slate-50 px-4 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Severity</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
                      <button key={lvl} type="button" onClick={() => setAgentDraft({...agentDraft, severity: lvl})} className={cn("h-10 text-[10px] font-bold rounded-lg border transition-all", agentDraft.severity === lvl ? "bg-slate-900 text-white" : "bg-white text-slate-400 border-slate-100")}>{lvl}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Evidence Preview</Label>
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-100"><Image src={imagePreview!} alt="Evidence" fill className="object-cover" /></div>
                </div>
              </div>

              <div className="space-y-6">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Location Details</Label>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nearby Landmark</span>
                    <Input value={agentDraft.location.landmark} onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, landmark: e.target.value}})} className="h-10 text-sm font-bold border-none bg-white shadow-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Area / Ward</span>
                      <Input value={agentDraft.location.area} onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, area: e.target.value}})} className="h-10 text-xs font-bold border-none bg-white shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pincode</span>
                      <Input value={agentDraft.location.pincode} onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, pincode: e.target.value}})} className="h-10 text-xs font-bold border-none bg-white shadow-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">City / Town</span>
                    <Input 
                      value={agentDraft.location.city} 
                      onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, city: e.target.value}})} 
                      className="h-10 text-xs font-bold border-none bg-white shadow-sm" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">District</span>
                      <Input 
                        value={agentDraft.location.district} 
                        onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, district: e.target.value}})} 
                        className="h-10 text-xs font-bold border-none bg-white shadow-sm" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">State</span>
                      <Input 
                        value={agentDraft.location.state} 
                        onChange={(e) => setAgentDraft({...agentDraft, location: {...agentDraft.location, state: e.target.value}})} 
                        className="h-10 text-xs font-bold border-none bg-white shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Resolution Requirements</Label>
              <div className="space-y-3">
                {agentDraft.success_criteria.map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="bg-slate-900 p-1 rounded-full mt-1"><Check className="w-3 h-3 text-white" /></div>
                    <Textarea 
                      value={point} 
                      onChange={(e) => {
                        const nc = [...agentDraft.success_criteria]; nc[i] = e.target.value;
                        setAgentDraft({...agentDraft, success_criteria: nc});
                      }}
                      className="text-sm font-medium text-slate-700 border-none bg-transparent h-auto p-0 min-h-[40px] focus-visible:ring-0 resize-none" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="pb-12 pt-10 px-10 border-t border-slate-50 flex flex-col gap-4">
            <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-lg gap-2 shadow-xl">
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Send className="w-5 h-5" /> Submit Official Complaint</>}
            </Button>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center italic">This report will be logged as an official record for department action.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
