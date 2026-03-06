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
    // SECURITY: Basic Token-based Authorization
    const token = request.headers.get('x-govt-token');
    if (token !== process.env.GOVT_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized Access Denied' }, { status: 401 });
    }

    const body = await request.json();
    const { id, resolvedImageKey, resolvedImageKeys, note } = body;

    if (process.env.NODE_ENV === 'development') {
      console.log("[Resolve API] Received Payload:", body);
    }

    // Determine the primary key and the full array of keys
    const primaryKey = resolvedImageKey || (Array.isArray(resolvedImageKeys) && resolvedImageKeys.length > 0 ? resolvedImageKeys[0] : null);
    const allKeys = Array.isArray(resolvedImageKeys) && resolvedImageKeys.length > 0 ? resolvedImageKeys : (resolvedImageKey ? [resolvedImageKey] : []);

    if (!id || allKeys.length === 0) {
      return NextResponse.json({ error: 'Grievance ID and at least one resolved image evidence are required.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: AWS_CONFIG.dynamodb.tableName,
      Key: { id },
      // Update status, add the fixed image keys, and append to history
      UpdateExpression: "SET #st = :status, fixedImageKey = :img, fixedImageKeys = :imgs, updatedAt = :time, history = list_append(if_not_exists(history, :empty_list), :historyEntry)",
      ExpressionAttributeNames: {
        "#st": "status"
      },
      ExpressionAttributeValues: {
        ":status": "FIXED",
        ":img": primaryKey,
        ":imgs": allKeys,
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

    await dynamoDb.send(command);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[DynamoDB] Grievance ${id} marked as FIXED by official.`);
    }

    // TRIGGER VERIFICATION AUTOMATICALLY
    // In a real production app, this might be a background job or Lambda trigger.
    // For this prototype, we'll trigger it here to simplify the frontend flow.
    try {
      const verifyUrl = new URL('/api/grievance/verify', request.url).toString();
      fetch(verifyUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-govt-token': process.env.GOVT_API_TOKEN || ''
        },
        body: JSON.stringify({ id })
      }).catch(err => console.error("[Resolve API] Async Verify Trigger Failed:", err));
    } catch (e) {
      console.error("[Resolve API] Failed to trigger verification:", e);
    }

    return NextResponse.json({ 
      success: true, 
      id,
      updatedStatus: 'FIXED',
      message: 'Resolution submitted. AI Vision Auditor verification initiated in background.'
    });

  } catch (error: any) {
    console.error('[Grievance Resolve API] Error:', error);
    // Generic error message for security
    return NextResponse.json({ error: 'An internal server error occurred while resolving the grievance.' }, { status: 500 });
  }
}
