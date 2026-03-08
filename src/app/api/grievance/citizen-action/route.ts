import { NextResponse } from 'next/server';
import { dynamoDb, AWS_CONFIG } from '@/lib/aws/config';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

export async function POST(request: Request) {
  try {
    const { id, citizenId, action, note } = await request.json();

    if (!id || !citizenId || !action) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (action !== 'CLOSED' && action !== 'ESCALATED') {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: AWS_CONFIG.dynamodb.tableName,
      Key: { id },
      UpdateExpression: "SET #st = :status, updatedAt = :time, history = list_append(if_not_exists(history, :empty_list), :historyEntry)",
      ConditionExpression: "citizenId = :citizenId", // Ensure the citizen actually owns this
      ExpressionAttributeNames: {
        "#st": "status"
      },
      ExpressionAttributeValues: {
        ":status": action,
        ":time": timestamp,
        ":empty_list": [],
        ":citizenId": citizenId,
        ":historyEntry": [
          {
            action: action === 'CLOSED' ? 'CITIZEN_CLOSED' : 'CITIZEN_DISPUTED',
            timestamp: timestamp,
            note: note || (action === 'CLOSED' ? 'Citizen confirmed resolution and closed the ticket.' : 'Citizen disputed the resolution.')
          }
        ]
      },
      ReturnValues: "ALL_NEW"
    });

    await dynamoDb.send(command);

    return NextResponse.json({ 
      success: true, 
      id,
      updatedStatus: action,
      message: action === 'CLOSED' ? 'Grievance closed successfully.' : 'Grievance escalated successfully.'
    });

  } catch (error: any) {
    console.error('[Grievance Citizen Action API] Error:', error);
    if (error.name === 'ConditionalCheckFailedException') {
      return NextResponse.json({ error: 'Unauthorized to modify this grievance.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
