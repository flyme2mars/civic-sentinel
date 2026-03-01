import { NextResponse } from 'next/server';
import { dynamoDb, s3Client, AWS_CONFIG } from '@/lib/aws/config';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // SECURITY: Basic Token-based Authorization for Hackathon
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('x-govt-token') || searchParams.get('token');
    
    if (token !== process.env.GOVT_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized Access Denied' }, { status: 401 });
    }

    const data = await dynamoDb.send(new ScanCommand({ 
      TableName: AWS_CONFIG.dynamodb.tableName,
      // 'status' and 'location' can be reserved; use ExpressionAttributeNames
      ProjectionExpression: "id, createdAt, title, #st, severity, slaHours, #loc, imageKey",
      ExpressionAttributeNames: {
        "#st": "status",
        "#loc": "location"
      }
    }));
    
    const rawItems = (data.Items || []) as Record<string, any>[];
    
    // Generate signed URLs for images
    const items = await Promise.all(rawItems.map(async (item) => {
      let imageUrl = null;
      if (item.imageKey) {
        try {
          const command = new GetObjectCommand({
            Bucket: AWS_CONFIG.s3.bucketName,
            Key: item.imageKey,
          });
          // URL valid for 1 hour
          imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        } catch (e) {
          console.error("Error signing URL for", item.imageKey, e);
        }
      }
      return { ...item, imageUrl };
    }));

    // Sort by created date descending
    items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, grievances: items });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Grievance List API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
