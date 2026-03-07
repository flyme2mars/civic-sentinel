'use client';

import React, { useState, useEffect } from 'react';
import { Pill, PriorityDot, SLARing, SLABar, ScoreRing } from './Atoms';
import { GrievanceType, PRIORITY_MAP, STATUS_MAP } from '@/lib/mock-data';
import { X, ZoomIn, Camera, Check, User, Phone, MapPin, Info, Layout, Clock, Activity, ShieldCheck, Zap, Building2, Send, AlertCircle } from 'lucide-react';
import { ImageModal } from '../ui/ImageModal';
import { DEPARTMENTS } from '@/lib/departments';
import { useToast } from '@/hooks/use-toast';

export function DetailDrawer({ g, onClose }: { g: GrievanceType; onClose: () => void }) {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [visible, setVisible] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  
  // Pre-select branch based on existing assignment or AI recommendation
  useEffect(() => {
    if ((g as any).assignedTo) {
      setSelectedBranch((g as any).assignedTo);
    } else {
      const recommended = (g as any).recommendedDepartment;
      if (recommended) {
        const dept = DEPARTMENTS.find(d => d.department === recommended || d.name === recommended || d.id === recommended);
        if (dept) setSelectedBranch(dept.id);
      }
    }
  }, [g]);

  const handleUpdate = async (status: string, assignedBranchId?: string, note?: string) => {
    setIsAssigning(true);
    try {
      // Check which token key is used in this environment
      const token = localStorage.getItem('govt_token') || localStorage.getItem('admin_token');
      
      const res = await fetch('/api/grievance/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-govt-token': token || ''
        },
        body: JSON.stringify({
          id: (g as any).rawId || g.id,
          status,
          assignedTo: assignedBranchId,
          note: note || `Grievance status changed to ${status.toUpperCase()}`
        })
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Action Successful",
          description: `Status changed to ${status.toUpperCase()}`,
          variant: "success",
        });
        onClose();
        // Trigger a custom event to tell the dashboard to refetch
        window.dispatchEvent(new CustomEvent('grievanceUpdated'));
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Update failed. Check permissions.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Network Error",
        description: "Could not connect to API.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const [modalState, setModalState] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: '',
    alt: ''
  });
  
  useEffect(() => { 
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const openModal = (src: string, alt: string) => {
    setModalState({ isOpen: true, src, alt });
  };

  const textSecondary = "text-gray-500";
  const textPrimary = "text-gray-900";
  const bgSurface = "bg-white";
  const borderColor = "border-gray-100";

  return (
    <>
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-5 md:p-10 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      >
        <div 
          className={`w-full max-w-4xl h-full max-h-[90vh] ${bgSurface} border ${borderColor} rounded-2xl overflow-hidden flex flex-col transition-transform duration-500 cubic-bezier(0.16,1,0.3,1) shadow-2xl ${visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-[0.98]'}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-5 md:p-6 border-b ${borderColor} flex-shrink-0`}>
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-[10px] font-mono tracking-[0.1em] uppercase mb-1 ${textSecondary}`}>
                  {g.id} · {g.ward}
                </div>
                <h2 className={`text-xl md:text-2xl font-extrabold leading-tight ${textPrimary}`}>
                  {g.title}
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 text-gray-500`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Pill status={g.status as keyof typeof STATUS_MAP} />
              <div 
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-transparent"
                style={{ color: PRIORITY_MAP[g.priority as keyof typeof PRIORITY_MAP]?.light }}
              >
                <PriorityDot priority={g.priority as keyof typeof PRIORITY_MAP} />
                <span className="text-[11px] font-mono font-bold uppercase">{g.priority}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${borderColor} flex-shrink-0 bg-black/5`}>
            {[
              { id: "overview", label: "Overview", icon: Info },
              { id: "timeline", label: "Timeline", icon: Clock },
              { id: "actions", label: "Actions", icon: Zap }
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id)} 
                className={`
                  flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold font-mono uppercase tracking-wider transition-all border-b-2
                  ${tab === t.id 
                    ? `border-gray-900 text-gray-900` 
                    : `border-transparent ${textSecondary} hover:text-gray-700`}
                `}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {tab === "overview" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <SLARing reportedAt={g.reportedAt} slaHours={g.slaHours} size={80} />
                  <div className="flex-1 w-full">
                    <SLABar reportedAt={g.reportedAt} slaHours={g.slaHours} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Citizen", value: g.citizen, icon: User },
                    { label: "Phone", value: g.phone, icon: Phone },
                    { label: "Zone", value: g.zone, icon: Layout },
                    { label: "Category", value: g.category, icon: Activity }
                  ].map((item) => (
                    <div key={item.label} className={`p-4 rounded-xl border ${borderColor} bg-gray-50`}>
                      <div className={`text-[9px] font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5 ${textSecondary}`}>
                        <item.icon className="w-3 h-3" />
                        {item.label}
                      </div>
                      <div className={`text-sm font-semibold truncate ${textPrimary}`}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${borderColor} bg-gray-50`}>
                    <div className={`text-[9px] font-mono font-bold tracking-widest uppercase mb-2 ${textSecondary}`}>Citizen Original Report</div>
                    <p className={`text-sm leading-relaxed text-gray-600 italic`}>"{(g as any).originalDescription || g.description}"</p>
                  </div>

                  {(g as any).summary && (
                    <div className={`p-4 rounded-xl border border-slate-900/10 bg-slate-900/[0.02]`}>
                      <div className={`text-[9px] font-mono font-bold tracking-widest uppercase mb-2 text-slate-900 flex items-center gap-2`}>
                        <Zap className="w-3 h-3" /> Sentinel AI Summary
                      </div>
                      <p className={`text-sm leading-relaxed text-gray-900 font-medium`}>{(g as any).summary}</p>
                    </div>
                  )}
                </div>

                {/* Success Criteria */}
                {((g as any).successCriteria && (g as any).successCriteria.length > 0) && (
                  <div>
                    <div className={`text-[9px] font-mono font-bold tracking-widest uppercase mb-3 flex items-center gap-2 ${textSecondary}`}>
                      <Check className="w-3 h-3" /> Resolution Success Criteria
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                      {(g as any).successCriteria.map((criterion: string, idx: number) => (
                        <div key={idx} className="flex gap-3 items-start group">
                          <div className="mt-1 w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center group-hover:border-gray-900 transition-colors">
                            <div className="w-1.5 h-1.5 bg-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <span className="text-xs text-gray-600 leading-tight">{criterion}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2 italic px-1">※ Admin must verify these criteria are met before final closure.</p>
                  </div>
                )}

                <div>
                  <div className={`text-[9px] font-mono font-bold tracking-widest uppercase mb-4 ${textSecondary}`}>Photo Evidence</div>
                  
                  {/* Before Images */}
                  <div className="mb-6">
                    <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-tight">Before (Reported Evidence)</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(g as any).evidenceUrls && (g as any).evidenceUrls.length > 0 ? (
                        (g as any).evidenceUrls.map((url: string, idx: number) => (
                          <div key={`before-${idx}`} className="group relative aspect-video rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                            <img 
                              src={url} 
                              alt={`Before ${idx + 1}`} 
                              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-110" 
                              onClick={() => openModal(url, `Before Evidence ${idx + 1}`)} 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <ZoomIn className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        ))
                      ) : (g as any).imageUrl ? (
                        <div className="group relative aspect-video rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                          <img 
                            src={(g as any).imageUrl} 
                            alt="Before" 
                            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-110" 
                            onClick={() => openModal((g as any).imageUrl, `Before Evidence`)} 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ZoomIn className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-2 bg-gray-50 opacity-50">
                          <Camera className="w-6 h-6 text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-400">NO BEFORE PHOTO</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* After Images */}
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-tight">After (Resolution Proof)</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(g as any).fixedImageUrls && (g as any).fixedImageUrls.length > 0 ? (
                        (g as any).fixedImageUrls.map((url: string, idx: number) => (
                          <div key={`after-${idx}`} className="group relative aspect-video rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                            <img 
                              src={url} 
                              alt={`After ${idx + 1}`} 
                              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-110" 
                              onClick={() => openModal(url, `After Evidence ${idx + 1}`)} 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <ZoomIn className="w-5 h-5 text-white" />
                            </div>
                            {idx === 0 && g.status.toLowerCase() === 'verified' && (
                              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 rounded text-[8px] font-black text-white flex items-center gap-1 shadow-lg">
                                <Check className="w-2 h-2" /> VERIFIED
                              </div>
                            )}
                          </div>
                        ))
                      ) : (g as any).fixedImageUrl ? (
                        <div className="group relative aspect-video rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                          <img 
                            src={(g as any).fixedImageUrl} 
                            alt="After" 
                            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-110" 
                            onClick={() => openModal((g as any).fixedImageUrl, `After Evidence`)} 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ZoomIn className="w-5 h-5 text-white" />
                          </div>
                          {g.status.toLowerCase() === 'verified' && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 rounded text-[8px] font-black text-white flex items-center gap-1 shadow-lg">
                              <Check className="w-2 h-2" /> VERIFIED
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-2 bg-gray-50 opacity-50">
                          <Camera className="w-6 h-6 text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-400">NO AFTER PHOTO</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Resolution Quality Audit Result */}
                {g.score != null && (
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className={`p-4 rounded-2xl border ${borderColor} flex items-center gap-5 bg-gray-50`}>
                      <ScoreRing score={g.score} size={60} />
                      <div>
                        <div className={`text-[10px] font-mono font-bold tracking-widest uppercase ${textSecondary}`}>AI Quality Score</div>
                        <div className={`text-lg font-bold mt-1 ${g.score >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                          {g.score >= 80 ? "Resolution Verified" : "Audit Flagged"}
                        </div>
                      </div>
                    </div>
                    {/* @ts-ignore */}
                    {g.aiVerificationResult && !g.aiVerificationResult.verified && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-amber-900 mb-1">AI Audit Observation</div>
                          {/* @ts-ignore */}
                          <p className="text-xs text-amber-800 leading-relaxed font-medium">{g.aiVerificationResult.reasoning}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {g.assignee && (
                  <div className={`p-4 rounded-xl border ${borderColor} flex items-center gap-4 bg-gray-50`}>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-900 border border-gray-200 uppercase">
                      {g.assignee === "Unassigned" ? "?" : g.assignee.split(" ").filter((n: string) => n).map((n: string) => n[0]).join("").substring(0, 2)}
                    </div>
                    <div>
                      <div className={`text-[9px] font-mono font-bold tracking-widest uppercase ${textSecondary}`}>
                        {g.assignee === "Unassigned" ? "Target Department (AI)" : "Assigned Branch"}
                      </div>
                      <div className={`text-sm font-bold mt-0.5 ${textPrimary}`}>
                        {g.assignee === "Unassigned" ? ((g as any).recommendedDepartment || "Unclassified") : g.assignee}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "timeline" && (() => {
              const historyItems = (g as any).history || [];
              
              if (historyItems.length > 0) {
                return (
                  <div className="space-y-0 pl-3">
                    {historyItems.map((item: any, i: number) => (
                      <div key={i} className="flex gap-6 relative group">
                        {i < historyItems.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-900" />
                        )}
                        <div className="relative flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900 bg-gray-900 scale-100 shadow-[0_0_10px_rgba(17,24,39,0.1)] transition-all duration-500">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div className="pb-8">
                          <div className="text-[10px] font-mono font-bold uppercase mb-1 text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm font-bold text-gray-900">
                            {item.action}
                          </div>
                          <div className="text-xs mt-1 text-gray-500">
                            {item.note}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // Fallback to static steps if no history
              const stepMap: Record<string, number> = {
                pending: 0, "in-progress": 1, escalated: 1, critical: 0,
                resolved: 2, verified: 3, 
                fixed: 2, open: 0
              };
              const currentStep = stepMap[g.status.toLowerCase()] ?? 0;

              const steps = [
                { label: "AI Triage Completed", detail: "Issue categorized and severity assessed", time: "Day 0", status: "completed" },
                { label: "Official Assigned", detail: `${g.assignee} notified via portal`, time: "Day 0", status: currentStep >= 1 ? "completed" : "active" },
                { label: "Evidence Uploaded", detail: "Official submitted resolution proof", time: currentStep >= 2 ? "Day 1" : "Pending", status: currentStep === 1 ? "active" : currentStep >= 2 ? "completed" : "pending" },
                { label: "Vision Audit", detail: "AI verified resolution image", time: currentStep >= 3 ? "Day 1" : "Pending", status: currentStep === 2 ? "active" : currentStep >= 3 ? "completed" : "pending" },
                { label: "Final Resolution", detail: "Ticket closed and citizen notified", time: g.status === "verified" ? "Day 2" : "Pending", status: g.status === "verified" ? "completed" : currentStep === 3 ? "active" : "pending" }
              ];

              return (
                <div className="space-y-0 pl-3">
                  {steps.map((step, i) => {
                    const isCompleted = step.status === "completed";
                    const isActive = step.status === "active";
                    
                    return (
                      <div key={i} className="flex gap-6 relative group">
                        {i < steps.length - 1 && (
                          <div className={`absolute left-[11px] top-6 bottom-0 w-[2px] ${isCompleted ? 'bg-gray-900' : 'bg-gray-700/30'}`} />
                        )}
                        <div className="relative flex-shrink-0 mt-1">
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500
                            ${isCompleted ? 'bg-gray-900 border-gray-900 scale-100 shadow-[0_0_10px_rgba(17,24,39,0.2)]' : 
                              isActive ? 'bg-gray-900/20 border-gray-900 scale-110 animate-pulse' : 
                              'bg-transparent border-gray-700 scale-90'}
                          `}>
                            {isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
                            {isActive && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                          </div>
                        </div>
                        <div className="pb-8">
                          <div className={`text-[10px] font-mono font-bold uppercase mb-1 ${isActive ? 'text-gray-900' : textSecondary}`}>
                            {step.time}
                          </div>
                          <div className={`text-sm font-bold ${isActive ? 'text-gray-800' : textPrimary}`}>
                            {step.label}
                          </div>
                          <div className={`text-xs mt-1 ${textSecondary}`}>
                            {step.detail}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {tab === "actions" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Official Verification Section */}
                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="text-[10px] font-mono font-bold tracking-widest uppercase mb-4 flex items-center gap-2 text-gray-500">
                    <ShieldCheck className="w-4 h-4" /> Administrative Control
                  </div>

                  {/* Initial Triage: Verify or Reject */}
                  {(g.status === "pending" || g.status === "critical" || g.status === "OPEN") ? (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-slate-900" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">AI Recommendation</div>
                          <div className="text-xs font-bold text-slate-900">{(g as any).recommendedDepartment || "No Recommendation"}</div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">Step 1: Validate the report and assign to a branch for resolution.</p>

                      <div className="space-y-2">
                        <label className="text-[9px] font-mono font-bold uppercase text-gray-400">Target Department Branch</label>
                        <select 
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-200 transition-all appearance-none"
                        >
                          <option value="">Choose a branch...</option>
                          {DEPARTMENTS.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.department})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          disabled={!selectedBranch || isAssigning}
                          onClick={() => handleUpdate("ASSIGNED", selectedBranch)}
                          className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" /> {isAssigning ? "Processing..." : "Verify & Assign"}
                        </button>
                        <button 
                          disabled={isAssigning}
                          onClick={() => handleUpdate("REJECTED")}
                          className="flex-1 bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" /> Reject as Fake
                        </button>
                      </div>
                      {!selectedBranch && <p className="text-[9px] text-amber-600 font-mono text-center">※ Department branch selection required to verify issue</p>}
                    </div>
                  ) : (g.status === "ASSIGNED" || g.status === "assigned") ? (
                    /* Active Assignment: Allow Re-dispatch if needed */
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-xs text-slate-600 font-medium italic">This issue is currently being resolved by the assigned department.</p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Re-route Assignment</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">If the current department is incorrect, you may re-dispatch this grievance to a different branch.</p>
                        
                        <div className="space-y-2">
                          <select 
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-100 transition-all"
                          >
                            <option value="">Select New Branch...</option>
                            {DEPARTMENTS.map(dept => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                          
                          <button 
                            disabled={!selectedBranch || isAssigning || selectedBranch === (g as any).assignedTo}
                            onClick={() => handleUpdate("ASSIGNED", selectedBranch, `Re-dispatched to ${DEPARTMENTS.find(d => d.id === selectedBranch)?.name}`)}
                            className="w-full bg-white border border-gray-900 text-gray-900 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                          >
                            <Send className="w-3 h-3" /> Re-Dispatch / Update
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (g.status === "verified" || g.status === "VERIFIED") ? (
                    /* Final Audit: Approve or Re-assign */
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-50/50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ShieldCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">Final Quality Audit</h4>
                        <p className="text-xs text-gray-500 mt-1">AI Vision has verified the fix. Grant final approval to notify the citizen for closure.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <button 
                          disabled={isAssigning}
                          onClick={() => handleUpdate("RESOLVED", undefined, "Final administrative approval granted. Citizen notified for final closure.")}
                          className="w-full bg-green-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                        >
                          <Check className="w-5 h-5" /> Grant Final Approval
                        </button>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-100"></div>
                          </div>
                          <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
                            <span className="bg-white px-2">Or if fix is unsatisfactory</span>
                          </div>
                        </div>

                        <button 
                          disabled={isAssigning}
                          onClick={() => handleUpdate("ASSIGNED", (g as any).assignedTo, "Repair rejected by admin. Sent back for re-resolution.")}
                          className="w-full bg-white text-amber-600 border border-amber-200 py-4 rounded-xl text-sm font-bold hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Send className="w-5 h-5" /> Send Back to Department
                        </button>
                      </div>
                      <p className="text-[9px] text-gray-400 text-center italic">※ Final approval transitions ticket to 'RESOLVED' state. Final closure is handled by the citizen.</p>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 italic">Ticket is currently in {g.status.toUpperCase()} state. No pending administrative actions.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        imageSrc={modalState.src}
        altText={modalState.alt}
      />
    </>
  );
}
