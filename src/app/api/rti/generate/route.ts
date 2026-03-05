import { NextResponse } from 'next/server';
import { getGrievanceById, generateRTIQuestions, buildRTIPdfs } from '@/lib/aws/rti';
import JSZip from 'jszip';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { grievanceId, citizenId } = await request.json(); // Accept citizenId from the client
        if (!grievanceId || !citizenId) return NextResponse.json({ error: 'Missing ID or Citizen ID' }, { status: 400 });

        const grievance = await getGrievanceById(grievanceId);

        // SECURITY CHECK 1: Does this user actually own this grievance?
        if (grievance.citizenId !== citizenId) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // SECURITY CHECK 2: Has the SLA actually breached?
        const now = new Date().getTime();
        const deadline = new Date(grievance.deadline).getTime();
        if (now < deadline) {
            return NextResponse.json({ error: 'SLA period has not expired yet. RTI cannot be generated.' }, { status: 403 });
        }

        // ... (rest of the generation and ZIP logic remains exactly the same)
        const rtiQuestions = await generateRTIQuestions(grievance);
        const pdfs = await buildRTIPdfs(grievance, rtiQuestions);

        if (pdfs.length === 1) {
            return new NextResponse(pdfs[0].bytes, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${pdfs[0].name}"`,
                },
            });
        }

        const zip = new JSZip();
        pdfs.forEach(pdf => zip.file(pdf.name, pdf.bytes));
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        return new NextResponse(zipBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="RTI_Applications_${grievanceId}.zip"`,
            },
        });

    } catch (error: any) {
        console.error('[RTI API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}