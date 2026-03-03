'use client';

import React, { useState } from 'react';
import { CivicIssue } from '@/lib/types';
import { 
  X, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Image as ImageIcon,
  Upload,
  CheckCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { StatusIcon, PriorityIcon, Badge } from './Atoms';
import { formatDate } from '@/lib/utils';

export function DetailDrawer({ 
  issue, 
  onClose 
}: { 
  issue: CivicIssue, 
  onClose: () => void 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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
          {/* Original Image */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ImageIcon className="w-3 h-3" />
              Initial Report Evidence
            </h3>
            <div className="aspect-video bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group relative">
              <img 
                src={issue.imageUrl || '/placeholder-issue.jpg'} 
                alt="Reported Issue" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-white px-4 py-2 rounded-lg text-xs font-bold text-gray-900 flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Eye className="w-4 h-4" />
                  View Original Image
                </button>
              </div>
            </div>
          </div>

          {/* Resolution Zone */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Resolution Upload
            </h3>
            
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              className={`
                relative aspect-video rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 p-8
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'}
              `}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Upload className={`w-6 h-6 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">Drag & Drop "Fixed" Image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
              <button className="mt-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 hover:shadow-md transition-shadow">
                Browse Files
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
        <button 
          onClick={() => setIsVerifying(true)}
          disabled={isVerifying}
          className="flex-1 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
        >
          {isVerifying ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Analyzing with Vision Auditor...
            </>
          ) : (
            <>
              Submit to Vision Auditor
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
