'use client';

import React, { useState, useEffect } from 'react';
import { Pill, PriorityDot, SLARing, SLABar, ScoreRing } from './Atoms';
import { GrievanceType, PRIORITY_MAP, STATUS_MAP } from '@/lib/mock-data';
import { X, ZoomIn, Camera, Check, User, Phone, MapPin, Info, Layout, Clock, Activity, ShieldCheck, Zap } from 'lucide-react';
import { ImageModal } from '../ui/ImageModal';

export function DetailDrawer({ g, onClose }: { g: GrievanceType; onClose: () => void }) {
  const [tab, setTab] = useState("overview");
  const [visible, setVisible] = useState(false);
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
              { id: "ai audit", label: "AI Audit", icon: ShieldCheck },
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

                <div className={`p-4 rounded-xl border ${borderColor} bg-gray-50`}>
                  <div className={`text-[9px] font-mono font-bold tracking-widest uppercase mb-2 ${textSecondary}`}>Description</div>
                  <p className={`text-sm leading-relaxed text-gray-600`}>{g.description}</p>
                </div>

                <div>
                  <div className={`text-[9px] font-mono font-bold tracking-widest uppercase mb-4 ${textSecondary}`}>Photo Evidence</div>
                  <div className="grid grid-cols-2 gap-4">
                    {["BEFORE", "AFTER"].map(label => {
                      const isBefore = label === "BEFORE";
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const hasImage = isBefore ? !!(g as any).imageUrl : g.hasAfter;
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const imgSrc = isBefore ? (g as any).imageUrl : null;
                      
                      return (
                        <div key={label} className="group flex flex-col gap-2">
                          <div className={`aspect-video rounded-xl border ${borderColor} relative overflow-hidden flex flex-col items-center justify-center gap-2 bg-gray-50`}>
                            {hasImage && isBefore ? (
                              <>
                                <img 
                                  src={imgSrc} 
                                  alt={label} 
                                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-110" 
                                  onClick={() => openModal(imgSrc, `${label} Evidence`)} 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <ZoomIn className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[9px] font-bold text-white flex items-center gap-1">
                                  {label}
                                </div>
                              </>
                            ) : (
                              <>
                                <Camera className={`w-8 h-8 opacity-20 ${textPrimary}`} />
                                <div className={`text-[10px] font-mono font-bold tracking-widest uppercase opacity-40 ${textPrimary}`}>{label}</div>
                                {label === "AFTER" && g.hasAfter && (
                                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-green-500 font-bold font-mono">
                                    <Check className="w-3 h-3" /> VERIFIED
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {g.assignee && (
                  <div className={`p-4 rounded-xl border ${borderColor} flex items-center gap-4 bg-gray-50`}>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-900 border border-gray-200">
                      {g.assignee.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <div className={`text-[9px] font-mono font-bold tracking-widest uppercase ${textSecondary}`}>Assigned To</div>
                      <div className={`text-sm font-bold mt-0.5 ${textPrimary}`}>{g.assignee}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "ai audit" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-[10px] font-mono font-bold tracking-widest text-gray-900 uppercase mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Bedrock AI Analysis
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Confidence Score", value: `${Math.round(g.aiConfidence * 100)}%` },
                      { label: "Urgency Rating", value: `${Math.round((g.urgency || 0) * 100)}%` },
                      { label: "Detected Anomalies", value: "None" },
                      { label: "Spatial Comparison", value: "98% Match" }
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className={`text-xs ${textSecondary}`}>{item.label}</span>
                        <span className={`text-xs font-bold font-mono ${textPrimary}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${borderColor} bg-gray-50`}>
                  <div className={`text-[10px] font-mono font-bold tracking-widest uppercase mb-4 ${textSecondary}`}>Audit Logic</div>
                  <div className="space-y-3">
                    {[
                      "Image overlap analysis using Claude Vision",
                      "Detection of repair artifacts (new asphalt, cleaned site)",
                      "Verification against historical street view data",
                      "Citizen cross-check mandatory for final closure"
                    ].map((text, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
                        <span className={`text-xs leading-relaxed ${textSecondary}`}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {g.score != null && (
                  <div className={`p-4 rounded-2xl border ${borderColor} flex items-center gap-5 bg-gray-100`}>
                    <ScoreRing score={g.score} size={60} />
                    <div>
                      <div className={`text-[10px] font-mono font-bold tracking-widest uppercase ${textSecondary}`}>Resolution Quality</div>
                      <div className={`text-lg font-bold mt-1 ${g.score >= 80 ? 'text-green-500' : 'text-amber-500'}`}>
                        {g.score >= 80 ? "Superior Repair" : "Incomplete Resolution"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "timeline" && (() => {
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
                <div className="p-5 rounded-2xl bg-gray-900 text-white shadow-xl">
                  <div className="text-[10px] font-mono font-bold tracking-widest uppercase mb-4 flex items-center gap-2 opacity-70">
                    <ShieldCheck className="w-4 h-4" /> Official Verification
                  </div>
                  
                  {/* Initial Triage: Verify or Reject */}
                  {(g.status === "pending" || g.status === "critical") ? (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-400 mb-4">Validate the legitimacy of this report before department assignment.</p>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-white text-gray-900 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> Verify as Original
                        </button>
                        <button className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2">
                          <X className="w-4 h-4" /> Reject as Fake
                        </button>
                      </div>
                    </div>
                  ) : (g.status === "resolved") ? (
                    /* Final Audit: Approve or Re-open */
                    <div className="space-y-3">
                      <p className="text-xs text-gray-400 mb-4">AI Vision Auditor has flagged this as fixed. Provide final human approval.</p>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-green-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> Approve and Close
                        </button>
                        <button className="flex-1 bg-white/10 text-white border border-white/10 py-3 rounded-xl text-sm font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                          <Activity className="w-4 h-4" /> Re-open Ticket
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-400 italic">Ticket is currently in {g.status} state. No pending verification actions.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: "Assign Department", icon: User, desc: "Change ticket ownership", color: "blue" },
                  ].map((action) => (
                    <button 
                      key={action.label}
                      className={`
                        w-full p-4 rounded-2xl border text-left transition-all duration-200 group flex items-center gap-4
                        ${borderColor} hover:bg-gray-50
                      `}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors bg-gray-100 group-hover:bg-gray-200`}>
                        <action.icon className="w-6 h-6 text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${textPrimary}`}>{action.label}</div>
                        <div className={`text-xs mt-0.5 ${textSecondary}`}>{action.desc}</div>
                      </div>
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity pr-2 ${textSecondary}`}>
                        →
                      </div>
                    </button>
                  ))}
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
