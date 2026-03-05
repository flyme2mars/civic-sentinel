import { NextResponse } from 'next/server';
import { dynamoDb, AWS_CONFIG } from '@/lib/aws/config';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { draft, evidenceKeys, location, originalDescription, citizenId, citizenName, phoneNumber } = await request.json();

    if (!draft) {
      return NextResponse.json({ error: 'Draft data is required' }, { status: 400 });
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Calculate deadline based on legal_sla_hours (default to 48 if not provided)
    const slaHours = draft.legal_sla_hours || 48;
    const deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    // Primary image for backward compatibility (first item in the list)
    const primaryImage = Array.isArray(evidenceKeys) && evidenceKeys.length > 0 ? evidenceKeys[0] : null;

    const item = {
      id,
      createdAt,
      deadline,
      status: 'OPEN', // OPEN, IN_PROGRESS, FIXED, VERIFIED, EXPIRED
      imageKey: primaryImage,
      evidenceKeys: evidenceKeys || [],
      originalDescription,
      citizenId: citizenId || 'ANONYMOUS',
      citizenName: citizenName || 'Anonymous Citizen',
      phoneNumber: phoneNumber || 'Not provided',
      location: {
        ...location, // raw GPS
        ...draft.location // AI fused location
      },
      title: draft.title,
      category: draft.category,
      severity: draft.severity,
      targetDepartment: draft.target_department,
      officialDesignation: draft.official_designation,
      summary: draft.summary,
      successCriteria: draft.success_criteria,
      slaHours: slaHours,
      history: [
        {
          action: 'CREATED',
          timestamp: createdAt,
          note: 'Grievance officially lodged by citizen.'
        }
      ]
    };

    const command = new PutCommand({
      TableName: AWS_CONFIG.dynamodb.tableName,
      Item: item,
    });

    await dynamoDb.send(command);

    console.log(`[DynamoDB] Grievance stored: ${id}`);

    return NextResponse.json({ 
      success: true, 
      id,
      message: 'Grievance officially lodged and stored in Sentinel Database.'
    });

  } catch (error: any) {
    console.error('[Grievance Submit API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
