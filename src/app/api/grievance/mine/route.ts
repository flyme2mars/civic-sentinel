import { NextResponse } from 'next/server';
import { dynamoDb, s3Client, AWS_CONFIG } from '@/lib/aws/config';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const citizenId = searchParams.get('citizenId');

    if (!citizenId) {
      return NextResponse.json({ error: 'Citizen ID required' }, { status: 400 });
    }

    const data = await dynamoDb.send(new ScanCommand({ 
      TableName: AWS_CONFIG.dynamodb.tableName,
      FilterExpression: "citizenId = :cid",
      ExpressionAttributeValues: {
        ":cid": citizenId
      },
      // Use alises for reserved keywords
      ProjectionExpression: "id, createdAt, title, #st, severity, slaHours, #loc, imageKey, deadline",
      ExpressionAttributeNames: {
        "#st": "status",
        "#loc": "location"
      }
    }));
    
    const rawItems = (data.Items || []) as Record<string, any>[];
    
    const items = await Promise.all(rawItems.map(async (item) => {
      let imageUrl = null;
      if (item.imageKey) {
        try {
          const command = new GetObjectCommand({
            Bucket: AWS_CONFIG.s3.bucketName,
            Key: item.imageKey,
          });
          imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        } catch (e) {
          console.error("Error signing URL", e);
        }
      }
      return { ...item, imageUrl };
    }));

    // Sort by created date descending
    items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, grievances: items });
  } catch (error: any) {
    console.error('[Grievance Mine API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
