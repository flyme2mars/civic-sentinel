'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Step {
  targetId: string;
  title: string;
  content: string;
}

interface DemoGuideProps {
  steps: Step[];
  onClose: () => void;
}

export function DemoGuide({ steps, onClose }: DemoGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const [isFound, setIsFound] = useState(false);
  const requestRef = useRef<number>(null);

  // Constant tracking loop using requestAnimationFrame for perfect spatial synchronization
  const updatePosition = () => {
    const element = document.getElementById(steps[currentStep].targetId);
    
    if (element) {
      const domRect = element.getBoundingClientRect();
      
      // Only update if dimensions are non-zero (element is actually laid out)
      if (domRect.width > 0 && domRect.height > 0) {
        const padding = 8;
        setRect({
          top: domRect.top - padding,
          left: domRect.left - padding,
          width: domRect.width + padding * 2,
          height: domRect.height + padding * 2
        });
        setIsFound(true);
      }
    } else {
      setIsFound(false);
      setRect(null);
    }
    
    requestRef.current = requestAnimationFrame(updatePosition);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePosition);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [currentStep, steps]);

  // Smooth scroll to element when step changes
  useEffect(() => {
    const element = document.getElementById(steps[currentStep].targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // If element not found yet, show a clean loading state or center-screen spotlight
  const displayRect = rect || { 
    top: window.innerHeight / 2 - 50, 
    left: window.innerWidth / 2 - 50, 
    width: 100, 
    height: 100 
  };

  // Tooltip positioning logic (relative to the spotlight hole)
  const tooltipWidth = 320;
  const tooltipHeight = 200; // Safer estimate for dynamic content
  
  let tooltipTop = displayRect.top + displayRect.height + 16;
  let placement: 'top' | 'bottom' = 'bottom';

  // Check if bottom placement overflows bottom of viewport
  if (tooltipTop + tooltipHeight > window.innerHeight - 20) {
    // Try top placement
    const topPlacementTop = displayRect.top - tooltipHeight - 16;
    if (topPlacementTop > 20) {
      tooltipTop = topPlacementTop;
      placement = 'top';
    } else {
      // If both overflow (element is very tall), stay at bottom but clamp to viewport
      tooltipTop = Math.max(20, Math.min(window.innerHeight - tooltipHeight - 20, tooltipTop));
      placement = 'bottom';
    }
  } else {
    // Standard bottom check - ensure it's not off the top if the element is high up
    tooltipTop = Math.max(20, tooltipTop);
  }

  let tooltipLeft = displayRect.left + (displayRect.width / 2) - (tooltipWidth / 2);
  tooltipLeft = Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, tooltipLeft));

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden pointer-events-none">
      {/* SVG MASK SPOTLIGHT - The "Hole" in the screen */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="demo-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect 
              x={displayRect.left} 
              y={displayRect.top} 
              width={displayRect.width} 
              height={displayRect.height} 
              rx="16" 
              ry="16" 
              fill="black" 
              className="transition-all duration-500 ease-in-out"
            />
          </mask>
        </defs>
        <rect 
          x="0" 
          y="0" 
          width="100%" 
          height="100%" 
          fill="rgba(15, 23, 42, 0.8)" 
          mask="url(#demo-spotlight-mask)"
          className="backdrop-blur-[1px] transition-all duration-500"
          onClick={onClose}
        />
      </svg>

      {/* THE TOOLTIP CARD */}
      <div 
        className="absolute w-[320px] transition-all duration-500 ease-out pointer-events-auto"
        style={{ top: tooltipTop, left: tooltipLeft }}
      >
        <div className={cn(
          "bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 p-7 space-y-5 animate-in fade-in zoom-in-95 duration-500",
          !isFound && "opacity-50 grayscale scale-95"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", isFound ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Guide {currentStep + 1} / {steps.length}
              </span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 leading-tight">
              {isFound ? steps[currentStep].title : "Locating Element..."}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4">
              {isFound ? steps[currentStep].content : "Please wait while the interface stabilizes."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === currentStep ? "bg-slate-900 w-5" : "bg-slate-100 w-1.5")} />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="ghost" size="sm" onClick={handlePrev} className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                  <ChevronLeft className="w-3 h-3" />
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={handleNext} 
                className="h-9 px-5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-95"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
