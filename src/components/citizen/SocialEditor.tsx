"use client";
import React, { useState } from 'react';
import { Loader2, Share2, Edit3, Send, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SocialEditorProps {
    grievance: any;
    citizenId: string;
}

export default function SocialEditor({ grievance, citizenId }: SocialEditorProps) {
    const [stage, setStage] = useState<'idle' | 'drafting' | 'editing'>('idle');
    const [postText, setPostText] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleDraft = async () => {
        setStage('drafting');
        try {
            const response = await fetch('/api/social/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grievanceId: grievance.id, citizenId }),
            });

            if (!response.ok) throw new Error('Failed to draft post');
            const data = await response.json();

            setPostText(data.postText);
            setImageUrl(data.imageUrl);
            setStage('editing');
        } catch (error) {
            console.error(error);
            alert("Error drafting social post.");
            setStage('idle');
        }
    };

    const handlePostToX = () => {
        // ONLY pass the text to X. No URLs.
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`;
        window.open(twitterUrl, '_blank');
        setStage('idle'); // Reset after posting
    };

    const handleDownloadImage = async () => {
        if (!imageUrl) return;
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Evidence_${grievance.id.split('-')[0]}.jpg`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download image", error);
        }
    };

    if (stage === 'idle') {
        return (
            <Button onClick={handleDraft} className="w-full h-12 md:h-14 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-[0.1em] gap-2 shadow-sm">
                <Share2 className="w-4 h-4" /> Draft Awareness Post
            </Button>
        );
    }

    if (stage === 'drafting') {
        return (
            <div className="min-h-[240px] flex flex-col items-center justify-center border-2 border-slate-100 rounded-2xl bg-white space-y-4">
                <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    AI is drafting social media copy...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-slate-900" />
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">X (Twitter) Draft</h4>
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 shadow-inner">
                {/* Mock Avatar */}
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-slate-500">YOU</span>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                        <Textarea
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            className="min-h-[100px] text-sm md:text-base border-none bg-transparent p-0 resize-none focus-visible:ring-0 leading-relaxed"
                            maxLength={280}
                            placeholder="What's happening?"
                        />
                        <div className="flex justify-end pr-2">
                            <span className={`text-[10px] font-bold ${postText.length > 250 ? 'text-red-500' : 'text-slate-400'}`}>
                                {postText.length} / 280
                            </span>
                        </div>
                    </div>

                    {/* Twitter-style Image Preview */}
                    {imageUrl && (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                            <img src={imageUrl} alt="Evidence Preview" className="w-full h-48 md:h-64 object-cover" />

                            {/* Overlay Download Button */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <Button onClick={handleDownloadImage} variant="secondary" className="gap-2 font-bold">
                                    <Download className="w-4 h-4" /> Save Image to Attach
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-[10px] md:text-xs font-medium leading-relaxed">
                    <strong>Note:</strong> X does not allow automatic image uploads from third-party apps. If you want the evidence included, <strong>save the image above</strong> and attach it manually after clicking the launch button.
                </p>
            </div>

            <Button onClick={handlePostToX} className="w-full h-14 bg-black hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-[0.1em] gap-2 shadow-md mt-4">
                <Send className="w-4 h-4" /> Launch X (Twitter)
            </Button>
        </div>
    );
}