"use client";
import React, { useState } from 'react';
import { Loader2, FileText, Edit3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface RtiEditorProps {
    grievance: any;
    citizenId: string;
}

export default function RtiEditor({ grievance, citizenId }: RtiEditorProps) {
    const [stage, setStage] = useState<'idle' | 'drafting' | 'editing' | 'generating'>('idle');

    // 1. Expand the state to include all the new fields!
    const [formData, setFormData] = useState({
        applicantName: grievance.citizen || '',
        applicantAddress: '', // Citizen types their home address here
        applicantPhoneNumber: grievance.phone || '',
        applicantEMailAddress: '',
        departmentName: grievance.targetDepartment || grievance.target_department || '',
        departmentAddress: '', // The location of the issue
        submissionPlace: grievance.location?.city || grievance.location?.district || '',
        submissionDate: new Date().toLocaleDateString('en-IN'),
        questions: ''
    });

    const handleDraft = async () => {
        setStage('drafting');
        try {
            const response = await fetch('/api/rti/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grievanceId: grievance.id, citizenId }),
            });

            if (!response.ok) throw new Error('Failed to draft RTI');
            const data = await response.json();

            const locObj = grievance.location || {};
            const fullAddress = [locObj.landmark, locObj.area, locObj.city, locObj.district, locObj.state]
                .filter(Boolean).join(', ');

            // Pre-fill the data returned from the DB and AI
            setFormData(prev => ({
                ...prev,
                departmentName: data.departmentName || prev.departmentName,
                departmentAddress: fullAddress || '',
                questions: data.questionsText
            }));

            setStage('editing');
        } catch (error) {
            console.error(error);
            alert("Error drafting RTI. Please try again.");
            setStage('idle');
        }
    };

    const handleGeneratePdf = async () => {
        setStage('generating');
        try {
            // Send the fully edited data object to the backend
            const response = await fetch('/api/rti/build-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grievanceId: grievance.id, citizenId, editedData: formData }),
            });

            if (!response.ok) throw new Error('Failed to build PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `RTI_${grievance.id}_Final.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setStage('idle');
        } catch (error) {
            console.error(error);
            alert("Error generating PDF.");
            setStage('editing');
        }
    };

    if (stage === 'idle') {
        return (
            <Button onClick={handleDraft} className="w-full h-12 md:h-14 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-[0.1em] gap-2 shadow-sm">
                <FileText className="w-4 h-4" /> Draft RTI Application
            </Button>
        );
    }

    if (stage === 'drafting' || stage === 'generating') {
        return (
            <div className="min-h-[240px] flex flex-col items-center justify-center border-2 border-slate-100 rounded-2xl bg-white space-y-4">
                <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {stage === 'drafting' ? 'AI is drafting legal questions...' : 'Stamping official PDF...'}
                </p>
            </div>
        );
    }

    // THE EDITING UI
    return (
        <div className="space-y-6 w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Edit3 className="w-4 h-4 text-slate-900" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Review & Finalize</h4>
            </div>

            {/* Applicant Details */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Your Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Full Name" value={formData.applicantName} onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })} />
                    <Input placeholder="Home Address" value={formData.applicantAddress} onChange={(e) => setFormData({ ...formData, applicantAddress: e.target.value })} />
                    <Input placeholder="Phone Number" value={formData.applicantPhoneNumber} onChange={(e) => setFormData({ ...formData, applicantPhoneNumber: e.target.value })} />
                    <Input placeholder="Email Address" type="email" value={formData.applicantEMailAddress} onChange={(e) => setFormData({ ...formData, applicantEMailAddress: e.target.value })} />
                </div>
            </div>

            {/* Department Details */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Department</label>
                        <Input value={formData.departmentName} onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Issue Location / Dept Address</label>
                        <Input value={formData.departmentAddress} onChange={(e) => setFormData({ ...formData, departmentAddress: e.target.value })} />
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RTI Questions (Edit as needed)</label>
                <Textarea value={formData.questions} onChange={(e) => setFormData({ ...formData, questions: e.target.value })} className="min-h-[150px] text-sm leading-relaxed" />
            </div>

            {/* Finalizing Details */}
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Place</label>
                    <Input value={formData.submissionPlace} onChange={(e) => setFormData({ ...formData, submissionPlace: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</label>
                    <Input value={formData.submissionDate} onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })} />
                </div>
            </div>

            <Button onClick={handleGeneratePdf} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-[0.1em] gap-2 shadow-md mt-6">
                <Download className="w-4 h-4" /> Confirm & Download PDF
            </Button>
        </div>
    );
}