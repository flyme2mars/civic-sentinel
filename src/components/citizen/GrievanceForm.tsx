'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Trash2, Send, Loader2, Wand2, MapPin, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function GrievanceForm() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Location logic
  const getGeoLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationLoading(false);
        },
        () => setLocationLoading(false),
        { enableHighAccuracy: true, timeout: 10000 }
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

  const startRecording = async () => {
    try {
      setTranscriptionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        handleTranscribe(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      setTranscriptionError("Microphone access denied. Please check your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionError(null);
    
    try {
      // Direct FormData upload to our Sarvam API
      const formData = new FormData();
      formData.append('audio', blob, 'audio.webm');

      console.log(`[Sarvam] Sending audio for transcription...`);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData // No manual JSON stringifying needed for FormData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sarvam AI failed to process audio");

      console.log(`[Sarvam] Transcription received:`, data.transcript);

      if (data.transcript) {
        setDescription(prev => (prev ? prev + ' ' : '') + data.transcript);
      }
    } catch (err: any) {
      console.error("[Sarvam] Error:", err);
      setTranscriptionError(err.message || "Failed to transcribe audio.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image && !description) return;
    setIsSubmitting(true);
    try {
      // 1. Upload image to S3 (Still using S3 for images)
      let imageKey = null;
      if (image) {
        const urlRes = await fetch('/api/upload-url', { 
          method: 'POST', 
          body: JSON.stringify({ fileName: image.name, fileType: image.type }) 
        });
        const { uploadUrl, key } = await urlRes.json();
        await fetch(uploadUrl, { method: 'PUT', body: image, headers: { 'Content-Type': image.type } });
        imageKey = key;
      }

      // 2. Submit Grievance
      await fetch('/api/grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageKey, description, location }),
      });

      setImage(null); setImagePreview(null); setDescription('');
      alert("Report Sent to Sentinel AI");
    } catch (err: any) { 
      console.error(err);
      alert("Submission failed: " + err.message);
    } 
    finally { setIsSubmitting(false); }
  };

  return (
    <Card className="border-none shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] bg-white/90 backdrop-blur-xl">
      <CardHeader className="pb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tight text-slate-900">New Grievance</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Describe the issue clearly for the AI agent.</CardDescription>
          </div>
          {location ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Verified Location</span>
            </div>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={getGeoLocation} disabled={locationLoading} className="rounded-full h-8 text-[10px] font-bold border-slate-200">
              {locationLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
              {locationLoading ? "Locating..." : "Pin Location"}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {!imagePreview ? (
              <div onClick={() => document.getElementById('imageInput')?.click()} className="group relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer">
                <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform"><Camera className="w-6 h-6 text-slate-900" /></div>
                <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Add Evidence Photo</p>
                <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl group">
                <Image src={imagePreview} alt="Issue" fill className="object-cover" />
                <Button type="button" variant="destructive" size="icon" onClick={() => {setImage(null); setImagePreview(null);}} className="absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></Button>
              </div>
            )}
          </div>

          <div className="space-y-3 relative">
            <div className={cn("relative rounded-2xl border-2 transition-all duration-300", isRecording ? "border-red-500 ring-4 ring-red-50 bg-red-50/10" : "border-slate-100 bg-white", isTranscribing && "opacity-80")}>
              <Textarea placeholder={isRecording ? "Listening to you..." : "Describe what's wrong, or click the mic to speak..."} value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[160px] p-6 border-none focus-visible:ring-0 bg-transparent resize-none leading-relaxed text-slate-800 placeholder:text-slate-300 font-medium" />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                {isTranscribing && (
                  <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full animate-in fade-in">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[8px]">Sarvam AI Transcription</span>
                  </div>
                )}
                <Button type="button" size="icon" variant={isRecording ? "destructive" : "secondary"} className={cn("w-12 h-12 rounded-full shadow-lg transition-all", isRecording && "animate-pulse scale-110")} onClick={isRecording ? stopRecording : startRecording} disabled={isTranscribing}>
                  {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                </Button>
              </div>
            </div>
            {transcriptionError && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100"><AlertCircle className="w-4 h-4" /><span className="text-xs font-bold">{transcriptionError}</span></div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pb-8">
          <Button type="submit" className={cn("w-full h-14 text-lg font-black rounded-2xl transition-all gap-3 shadow-xl", (!image && !description) ? "bg-slate-100 text-slate-300 cursor-not-allowed border-slate-200" : "bg-slate-900 text-white hover:bg-slate-800")} disabled={isSubmitting || isTranscribing || isRecording || (!image && !description)}>
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing Report</> : <><Send className="w-5 h-5" /> Submit to Sentinel AI</>}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
