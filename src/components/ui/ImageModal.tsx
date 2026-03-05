'use client';

import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  altText?: string;
}

export function ImageModal({ isOpen, onClose, imageSrc, altText = "Image Evidence" }: ImageModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[110]">
        <div className="flex flex-col">
          <h3 className="text-white font-bold text-lg">{altText}</h3>
          <p className="text-white/50 text-xs font-mono uppercase tracking-widest mt-1">Civic Sentinel Evidence</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10 hover:border-white/20"
            title={isZoomed ? "Zoom Out" : "Zoom In"}
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          <button 
            onClick={onClose}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10 hover:border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        className={`relative transition-all duration-500 ease-out flex items-center justify-center p-4 md:p-12 w-full h-full ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        onClick={(e) => { 
          if (isZoomed) {
            setIsZoomed(false);
          } else {
            e.stopPropagation();
            setIsZoomed(true);
          }
        }}
      >
        <img 
          src={imageSrc} 
          alt={altText} 
          className={`
            max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500
            ${isZoomed ? 'scale-110 md:scale-125' : 'scale-100'}
            animate-in zoom-in-95
          `}
        />
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-white/70 text-[10px] font-mono font-bold tracking-[0.2em] uppercase pointer-events-none">
        Esc to close • Click to toggle zoom
      </div>
    </div>
  );
}
