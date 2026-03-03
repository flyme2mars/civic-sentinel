import { NextResponse } from 'next/server';
import { dynamoDb, AWS_CONFIG } from '@/lib/aws/config';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

/**
 * RESOLVE API
 * This endpoint marks a grievance as resolved by the government official.
 * It expects the grievance ID and the S3 key of the "After" photo.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, resolvedImageKey, note } = body;

    console.log("[Resolve API] Received Payload:", body);

    if (!id || !resolvedImageKey) {
      console.error("[Resolve API] Missing required fields:", { id, resolvedImageKey });
      return NextResponse.json({ error: `Grievance ID and resolvedImageKey are required. Received: ID=${id}, Key=${resolvedImageKey}` }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: AWS_CONFIG.dynamodb.tableName,
      Key: { id },
      // Update status, add the fixed image key, and append to history (handling if history doesn't exist)
      UpdateExpression: "SET #st = :status, fixedImageKey = :img, updatedAt = :time, history = list_append(if_not_exists(history, :empty_list), :historyEntry)",
      ExpressionAttributeNames: {
        "#st": "status"
      },
      ExpressionAttributeValues: {
        ":status": "FIXED",
        ":img": resolvedImageKey,
        ":time": timestamp,
        ":empty_list": [],
        ":historyEntry": [
          {
            action: 'FIXED',
            timestamp: timestamp,
            note: note || 'Issue resolved by government official. Pending Vision Auditor verification.'
          }
        ]
      },
      ReturnValues: "ALL_NEW"
    });

    const result = await dynamoDb.send(command);

    console.log(`[DynamoDB] Grievance ${id} marked as FIXED by official.`);

    return NextResponse.json({ 
      success: true, 
      id,
      updatedStatus: 'FIXED',
      message: 'Resolution submitted. Initiating AI Vision Auditor verification.'
    });

  } catch (error: any) {
    console.error('[Grievance Resolve API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
