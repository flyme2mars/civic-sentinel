'use client';

import React, { useState } from 'react';
import { CivicIssue } from '@/lib/types';
import { 
  X, 
  MapPin, 
  Clock, 
  User, 
  Image as ImageIcon,
  Upload,
  CheckCircle,
  Eye,
  ArrowRight,
  Zap,
  Loader2,
  Trash2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { StatusIcon, PriorityIcon } from './Atoms';
import { formatDate, cn } from '@/lib/utils';
import { ImageModal } from '../ui/ImageModal';

function ImageWithLoader({ src, alt, className, onClick }: { src: string, alt: string, className?: string, onClick?: () => void }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative overflow-hidden group", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        onLoad={() => setIsLoading(false)}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          isLoading ? "opacity-0" : "opacity-100 grayscale group-hover:grayscale-0"
        )}
      />
      {!isLoading && (
        <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="bg-white p-2 rounded-lg text-gray-900 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function DetailDrawer({ 
  issue, 
  authToken,
  onClose 
}: { 
  issue: CivicIssue, 
  authToken: string | null,
  onClose: () => void 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionEvidence, setResolutionEvidence] = useState<{ key: string, preview: string }[]>([]);

  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    verified?: boolean;
    reasoning?: string;
    error?: string;
  } | null>(null);

  const [modalState, setModalState] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: '',
    alt: ''
  });

  const openModal = (src: string, alt: string) => {
    setModalState({ isOpen: true, src, alt });
  };

  const handleFileUpload = async (file: File) => {
    if (resolutionEvidence.length >= 4) {
      alert("Maximum 4 resolution images allowed.");
      return;
    }
    setIsUploading(true);
    const localPreview = URL.createObjectURL(file);
    try {
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      });
      const { uploadUrl, key } = await res.json();

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      setResolutionEvidence(prev => [...prev, { key, preview: localPreview }]);
    } catch (e) {
      console.error("Upload failed", e);
      URL.revokeObjectURL(localPreview);
    } finally {
      setIsUploading(false);
    }
  };

  const removeResolutionImage = (index: number) => {
    setResolutionEvidence(prev => {
      const item = prev[index];
      if (item.preview.startsWith('blob:')) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      Array.from(e.dataTransfer.files).forEach(file => handleFileUpload(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => handleFileUpload(file));
    }
  };

  const handleRunAudit = async () => {
    const targetId = issue.rawId || issue.id;
    const keys = resolutionEvidence.map(e => e.key);
    
    if (keys.length === 0 || !targetId) {
      setVerificationResult({ success: false, error: "Missing ID or Image Evidence." });
      return;
    }
    
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      // 1. Save the keys to DB first so Vision Auditor can see them
      const res = await fetch('/api/grievance/resolve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-govt-token': authToken || ''
        },
        body: JSON.stringify({
          id: targetId,
          resolvedImageKeys: keys,
          note: "Draft resolution images uploaded for AI pre-audit."
        })
      });
      const data = await res.json();
      
      if (data.success) {
        const verifyRes = await fetch('/api/grievance/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-govt-token': authToken || ''
          },
          body: JSON.stringify({ id: targetId })
        });
        const verifyData = await verifyRes.json();
        setVerificationResult(verifyData);
      } else {
        setVerificationResult({ success: false, error: data.error || "Failed to update resolution data." });
      }
    } catch (e: unknown) {
      console.error("Audit failed", e);
      setVerificationResult({ success: false, error: (e as Error).message || "An unexpected error occurred." });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinalSubmit = async () => {
    const targetId = issue.rawId || issue.id;
    if (!targetId) return;

    setIsSubmitting(true);
    try {
      // 1. Officially transition status to VERIFIED to move it to Admin queue
      const res = await fetch('/api/grievance/assign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-govt-token': authToken || ''
        },
        body: JSON.stringify({
          id: targetId,
          status: 'VERIFIED',
          note: "Resolution finalized by department and submitted for official audit review."
        })
      });
      const data = await res.json();

      if (data.success) {
        onClose();
        window.dispatchEvent(new CustomEvent('grievanceUpdated'));
      } else {
        alert(data.error || "Failed to finalize submission.");
      }
    } catch (e) {
      console.error("Final submit failed", e);
      alert("An unexpected error occurred during final submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToAdmin = async () => {
    const targetId = issue.rawId || issue.id;
    if (!targetId) return;

    if (!window.confirm("Are you sure this issue does not belong to your department? It will be returned to the Admin queue.")) {
      return;
    }

    setIsReturning(true);
    try {
      const res = await fetch('/api/grievance/assign', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-govt-token': authToken || ''
        },
        body: JSON.stringify({
          id: targetId,
          status: 'OPEN',
          assignedTo: 'UNASSIGNED',
          note: "Returned to Admin by department official: Not our department."
        })
      });
      const data = await res.json();
      
      if (data.success) {
        onClose();
        window.dispatchEvent(new CustomEvent('grievanceUpdated'));
      } else {
        alert(data.error || "Failed to return issue to Admin.");
      }
    } catch (e: unknown) {
      console.error("Return failed", e);
      alert((e as Error).message || "An unexpected error occurred.");
    } finally {
      setIsReturning(false);
    }
  };

  const handleVerifyOnly = async () => {
    const targetId = issue.rawId || issue.id;
    if (!targetId) return;

    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const verifyRes = await fetch('/api/grievance/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-govt-token': authToken || ''
        },
        body: JSON.stringify({ id: targetId })
      });
      const verifyData = await verifyRes.json();
      setVerificationResult(verifyData);
    } catch (e: unknown) {
      console.error("Verification failed", e);
      setVerificationResult({ success: false, error: (e as Error).message || "Verification failed." });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{issue.id}</span>
          <div className="flex items-center gap-2">
            <StatusIcon status={issue.status} className="w-4 h-4" />
            <span className="text-sm font-semibold text-gray-900 capitalize">{issue.status.replace('-', ' ')}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title & Description */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{issue.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {issue.description}
          </p>

          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</span>
              <div className="flex items-center gap-2">
                <PriorityIcon priority={issue.priority} />
                <span className="text-xs text-gray-900 capitalize font-medium">{issue.priority}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reported By</span>
              <div className="flex items-center gap-2 text-xs text-gray-900 font-medium">
                <User className="w-3 h-3 text-gray-400" />
                {issue.citizen}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</span>
              <div className="flex items-center gap-2 text-xs text-gray-900 font-medium">
                <MapPin className="w-3 h-3 text-gray-400" />
                {issue.ward}, {issue.address}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reported At</span>
              <div className="flex items-center gap-2 text-xs text-gray-900 font-medium">
                <Clock className="w-3 h-3 text-gray-400" />
                {formatDate(issue.reportedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="p-6 space-y-8">
          {/* Original Images Grid */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" />
              Initial Report Evidence ({issue.evidenceUrls?.length || (issue.imageUrl ? 1 : 0)})
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {issue.evidenceUrls && issue.evidenceUrls.length > 0 ? (
                issue.evidenceUrls.map((url, index) => (
                  <ImageWithLoader 
                    key={index}
                    src={url} 
                    alt={`Evidence ${index + 1}`} 
                    className="aspect-square bg-gray-50 rounded-xl border border-gray-200"
                    onClick={() => openModal(url, `Evidence ${index + 1}`)}
                  />
                ))
              ) : (
                <ImageWithLoader 
                  src={issue.imageUrl || '/placeholder-issue.jpg'} 
                  alt="Reported Issue" 
                  className="col-span-2 aspect-video bg-gray-50 rounded-xl border border-gray-200"
                  onClick={() => openModal(issue.imageUrl || '/placeholder-issue.jpg', "Initial Report Evidence")}
                />
              )}
            </div>
          </div>

          {/* Resolution Zone */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              {issue.status === 'resolved' || issue.status === 'verified' ? 'Resolution Evidence' : 'Resolution Upload'}
            </h3>
            
            {issue.status === 'resolved' || issue.status === 'verified' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {issue.fixedImageUrls && issue.fixedImageUrls.length > 0 ? (
                    issue.fixedImageUrls.map((url, index) => (
                      <ImageWithLoader 
                        key={index}
                        src={url} 
                        alt={`Resolution ${index + 1}`} 
                        className="aspect-square bg-gray-50 rounded-xl border border-gray-200"
                        onClick={() => openModal(url, `Resolution ${index + 1}`)}
                      />
                    ))
                  ) : (
                    <ImageWithLoader 
                      src={issue.fixedImageUrl || '/placeholder-issue.jpg'} 
                      alt="Resolved Issue" 
                      className="col-span-2 aspect-video bg-gray-50 rounded-xl border border-gray-200"
                      onClick={() => openModal(issue.fixedImageUrl || '/placeholder-issue.jpg', "Resolution Evidence")}
                    />
                  )}
                </div>

                {/* Show AI Summary in Resolved View */}
                {(issue as any).aiVerificationResult && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">AI Quality Assessment</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{(issue as any).aiVerificationResult.resolutionSummary || (issue as any).aiVerificationResult.reasoning}"
                    </p>
                  </div>
                )}
                
                {issue.status === 'resolved' && !verificationResult && !(issue as any).aiVerificationResult && (
                  <button
                    onClick={handleVerifyOnly}
                    disabled={isVerifying}
                    className="w-full py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-900 flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <div className="w-3 h-3 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3 text-indigo-500" />
                    )}
                    {isVerifying ? 'Verifying...' : 'Re-run AI Auditor'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    relative aspect-video rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 p-8
                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'}
                    ${resolutionEvidence.length > 0 ? 'border-green-500 bg-green-50' : ''}
                  `}
                >
                  {isUploading ? (
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Upload className={`w-6 h-6 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900">Drag &amp; Drop &quot;Fixed&quot; Images</p>
                        <p className="text-xs text-gray-500 mt-1">Up to 4 images (PNG, JPG)</p>
                      </div>
                      <label className="mt-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 hover:shadow-md transition-shadow cursor-pointer">
                        Browse Files
                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </>
                  )}
                </div>

                {resolutionEvidence.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {resolutionEvidence.map((item, index) => (
                      <div key={index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                        <img src={item.preview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => openModal(item.preview, `Uploaded Evidence ${index + 1}`)}
                            className="p-1.5 bg-white text-gray-900 rounded shadow-sm hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => removeResolutionImage(index)}
                            className="p-1.5 bg-white text-red-500 rounded shadow-sm hover:bg-gray-50 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Auditor Result Section */}
          {verificationResult && (
            <div className={`p-4 rounded-xl border ${verificationResult.verified ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className="flex items-center gap-2 mb-2">
                {verificationResult.verified ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span className={`text-sm font-bold ${verificationResult.verified ? 'text-emerald-900' : 'text-amber-900'}`}>
                  AI Auditor {verificationResult.verified ? 'Verified' : 'Flagged'}
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${verificationResult.verified ? 'text-emerald-700' : 'text-amber-700'}`}>
                {verificationResult.reasoning || verificationResult.error || "Verification completed."}
              </p>
              {!verificationResult.verified && (
                <p className="text-[10px] text-amber-600 mt-2 italic font-medium">
                  Note: The AI found potential issues. You can still submit if you believe the work is complete, or re-upload better evidence.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      {issue.status !== 'resolved' && issue.status !== 'verified' && (
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
          {!verificationResult ? (
            <>
              <button 
                onClick={handleRunAudit}
                disabled={isVerifying || isReturning || resolutionEvidence.length === 0}
                className="w-full bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Running AI Quality Audit...
                  </>
                ) : (
                  <>
                    Run AI Quality Audit
                    <Zap className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>
              <button 
                onClick={handleReturnToAdmin}
                disabled={isVerifying || isReturning}
                className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm"
              >
                {isReturning ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Not My Department (Return to Admin)
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm & Submit to Admin
              </button>
              <button 
                onClick={() => setVerificationResult(null)}
                className="w-full bg-white border border-gray-200 text-gray-500 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Cancel / Edit Images
              </button>
            </div>
          )}
        </div>
      )}

      <ImageModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        imageSrc={modalState.src}
        altText={modalState.alt}
      />
    </div>
  );
}
