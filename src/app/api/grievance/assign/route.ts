import { NextResponse } from 'next/server';
import { dynamoDb, AWS_CONFIG } from '@/lib/aws/config';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

/**
 * ASSIGN/STATUS UPDATE API
 * This endpoint allows admins to:
 * 1. Assign a grievance to a specific branch (assignedTo).
 * 2. Manually transition status (e.g., ASSIGNED, CLOSED).
 */
export async function POST(request: Request) {
  try {
    // SECURITY: Basic Token-based Authorization
    const token = request.headers.get('x-govt-token');
    if (token !== process.env.GOVT_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized Access Denied' }, { status: 401 });
    }

    const body = await request.json();
    const { id, assignedTo, status, note } = body;

    if (!id || (!assignedTo && !status)) {
      return NextResponse.json({ error: 'Grievance ID and at least one update field (assignedTo or status) are required.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    
    // Build update expression dynamically
    let updateExpression = "SET updatedAt = :time, history = list_append(if_not_exists(history, :empty_list), :historyEntry)";
    const expressionAttributeValues: any = {
      ":time": timestamp,
      ":empty_list": [],
      ":historyEntry": [
        {
          action: status || 'UPDATED',
          timestamp: timestamp,
          note: note || `Grievance updated by admin.${assignedTo ? ` Assigned to: ${assignedTo}` : ''}`
        }
      ]
    };
    const expressionAttributeNames: any = {};

    if (status) {
      updateExpression += ", #st = :status";
      expressionAttributeNames["#st"] = "status";
      expressionAttributeValues[":status"] = status;
    }

    if (assignedTo) {
      updateExpression += ", assignedTo = :assigned";
      expressionAttributeValues[":assigned"] = assignedTo;
    }

    const command = new UpdateCommand({
      TableName: AWS_CONFIG.dynamodb.tableName,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW"
    });

    await dynamoDb.send(command);

    return NextResponse.json({ 
      success: true, 
      id,
      updatedStatus: status,
      assignedTo,
      message: 'Grievance updated successfully.'
    });

  } catch (error: any) {
    console.error('[Grievance Assign API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
