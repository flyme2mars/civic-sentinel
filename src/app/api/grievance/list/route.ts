import { NextResponse } from 'next/server';
import { dynamoDb, s3Client, AWS_CONFIG, ddbClient } from '@/lib/aws/config';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // SECURITY: Basic Token-based Authorization for Hackathon
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('x-govt-token') || searchParams.get('token');
    const branch = searchParams.get('branch');
    
    if (token !== process.env.GOVT_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized Access Denied' }, { status: 401 });
    }

    const scanParams: any = { 
      TableName: AWS_CONFIG.dynamodb.tableName,
      // 'status' and 'location' can be reserved; use ExpressionAttributeNames
      ProjectionExpression: "id, createdAt, title, #st, severity, slaHours, #loc, imageKey, fixedImageKey, evidenceKeys, fixedImageKeys, assignedTo, targetDepartment, citizenName, phoneNumber, score, aiVerificationResult, originalDescription, summary, history",
      ExpressionAttributeNames: {
        "#st": "status",
        "#loc": "location"
      }
    };

    if (branch) {
      scanParams.FilterExpression = "assignedTo = :branch";
      scanParams.ExpressionAttributeValues = {
        ":branch": branch
      };
    }

    const data = await dynamoDb.send(new ScanCommand(scanParams));
    
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

      let evidenceUrls: string[] = [];
      if (item.evidenceKeys && Array.isArray(item.evidenceKeys)) {
        evidenceUrls = await Promise.all(item.evidenceKeys.map(async (key: string) => {
          try {
            const command = new GetObjectCommand({
              Bucket: AWS_CONFIG.s3.bucketName,
              Key: key,
            });
            return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          } catch (e) {
            console.error("Error signing evidence URL for", key, e);
            return null;
          }
        })).then(urls => urls.filter((url): url is string => url !== null));
      }

      let fixedImageUrl = null;
      if (item.fixedImageKey) {
        try {
          const command = new GetObjectCommand({
            Bucket: AWS_CONFIG.s3.bucketName,
            Key: item.fixedImageKey,
          });
          fixedImageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        } catch (e) {
          console.error("Error signing URL for", item.fixedImageKey, e);
        }
      }

      let fixedImageUrls: string[] = [];
      if (item.fixedImageKeys && Array.isArray(item.fixedImageKeys)) {
        fixedImageUrls = await Promise.all(item.fixedImageKeys.map(async (key: string) => {
          try {
            const command = new GetObjectCommand({
              Bucket: AWS_CONFIG.s3.bucketName,
              Key: key,
            });
            return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          } catch (e) {
            console.error("Error signing fixed URL for", key, e);
            return null;
          }
        })).then(urls => urls.filter((url): url is string => url !== null));
      }

      return { ...item, imageUrl, fixedImageUrl, evidenceUrls, fixedImageUrls };
    }));

    // Sort by created date descending
    items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, grievances: items });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      try {
        const tables = await ddbClient.send(new ListTablesCommand({}));
        console.error(`[DYNAMODB DIAGNOSIS] Table "${AWS_CONFIG.dynamodb.tableName}" NOT FOUND. Available tables in ${AWS_CONFIG.region}:`, tables.TableNames);
      } catch (listErr) {
        console.error("[DYNAMODB DIAGNOSIS] Failed to list tables:", listErr);
      }
    }
    console.error('[Grievance List API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
