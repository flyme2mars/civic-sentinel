import { NextResponse } from 'next/server';
import { processGrievanceAgent } from '@/lib/aws/agent';
import { s3Client, AWS_CONFIG } from '@/lib/aws/config';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  try {
    const { imageKey, description, location } = await request.json();

    console.log('[Grievance API] Request received. Analyzing with Sentinel Agent...');

    let imageBytes: Uint8Array | undefined;
    let imageFormat: "png" | "jpeg" | "webp" = "jpeg";

    // 1. Fetch image from S3 if key provided
    if (imageKey) {
      const getObjCommand = new GetObjectCommand({
        Bucket: AWS_CONFIG.s3.bucketName,
        Key: imageKey,
      });
      const response = await s3Client.send(getObjCommand);
      const bytes = await response.Body?.transformToByteArray();
      if (bytes) {
        imageBytes = bytes;
        imageFormat = imageKey.toLowerCase().endsWith('png') ? 'png' : 
                      imageKey.toLowerCase().endsWith('webp') ? 'webp' : 'jpeg';
      }
    }

    // 2. Run the Bedrock Agent
    const agentResult = await processGrievanceAgent({
      imageBytes,
      imageFormat,
      description,
      location
    });

    return NextResponse.json({ 
      success: true, 
      data: agentResult
    });

  } catch (error: any) {
    console.error('[Grievance API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
