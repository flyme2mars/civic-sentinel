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
    // SECURITY: Strictly check whether env.local has GOVT_API_TOKEN=='sentinel2026'
    const token = request.headers.get('x-govt-token');
    const isEnvValid = process.env.GOVT_API_TOKEN === 'sentinel2026';
    const isTokenValid = token === 'sentinel2026';

    if (!isEnvValid || !isTokenValid) {
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
      console.log(`[DynamoDB] Grievance ${id} updated with resolution evidence.`);
    }

    return NextResponse.json({ 
      success: true, 
      id,
      updatedStatus: 'FIXED',
      message: 'Resolution evidence saved successfully.'
    });

  } catch (error: any) {
    console.error('[Grievance Resolve API] Error:', error);
    // Generic error message for security
    return NextResponse.json({ error: 'An internal server error occurred while resolving the grievance.' }, { status: 500 });
  }
}
