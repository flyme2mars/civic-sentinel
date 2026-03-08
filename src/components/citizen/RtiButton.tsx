"use client";
import { useState } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RtiButton({ grievanceId, citizenId }: { grievanceId: string, citizenId: string }) {
    const [loading, setLoading] = useState(false);

    const handleGenerateRTI = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/rti/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grievanceId, citizenId }),
            });

            if (!response.ok) throw new Error('Failed to generate RTI');

            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
            const filename = filenameMatch ? filenameMatch[1] : `RTI_${grievanceId}.pdf`;

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert("Error generating RTI document. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleGenerateRTI}
            disabled={loading}
            className="h-8 px-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
        >
            {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <FileText className="w-3 h-3" />
            )}
            {loading ? 'Drafting...' : 'Generate RTI'}
        </Button>
    );
}