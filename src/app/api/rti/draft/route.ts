import { NextResponse } from 'next/server';
import { getGrievanceById, generateRTIQuestions } from '@/lib/aws/rti';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { grievanceId, citizenId } = await request.json();
        if (!grievanceId || !citizenId) return NextResponse.json({ error: 'Missing Data' }, { status: 400 });

        const grievance = await getGrievanceById(grievanceId);

        if (grievance.citizenId !== citizenId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const questionsText = await generateRTIQuestions(grievance);

        return NextResponse.json({
            success: true,
            questionsText,
            departmentName: grievance.targetDepartment || grievance.target_department || grievance.category
        });

    } catch (error: any) {
        console.error('[RTI Draft API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}