import { NextResponse } from 'next/server';
import { getGrievanceById, buildRTIPdfs } from '@/lib/aws/rti';
import { dynamoDb, AWS_CONFIG } from '@/lib/aws/config';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { grievanceId, citizenId, editedData } = await request.json();
        if (!grievanceId || !citizenId || !editedData) {
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        // 1. Fetch and Verify
        const grievance = await getGrievanceById(grievanceId);
        if (grievance.citizenId !== citizenId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 2. Build the PDF with the user's edited data
        const pdf = await buildRTIPdfs(grievance, editedData);

        // 3. UPDATE DYNAMODB: Mark RTI as Generated!
        try {
            await dynamoDb.send(new UpdateCommand({
                TableName: AWS_CONFIG.dynamodb.tableName,
                Key: { id: grievanceId },
                UpdateExpression: "SET rtiGenerated = :val",
                ExpressionAttributeValues: { ":val": true }
            }));
            console.log(`[DynamoDB] Marked RTI generated for ${grievanceId}`);
        } catch (dbError) {
            console.error("[DynamoDB Update Error]:", dbError);
            // We don't fail the request if the DB update fails, the citizen still gets their PDF
        }

        // 4. Send the physical file back to the browser
        return new NextResponse(Buffer.from(pdf.bytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${pdf.name}"`,
            },
        });

    } catch (error: any) {
        console.error('[RTI Build API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}