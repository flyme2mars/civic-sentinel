import { NextResponse } from 'next/server';
import { processGrievanceAgent } from '@/lib/aws/agent';
import { s3Client, AWS_CONFIG } from '@/lib/aws/config';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageKey, imageKeys, description, location } = body;
    
    // Use the first key from imageKeys if imageKey is missing
    const targetKey = imageKey || (imageKeys && imageKeys.length > 0 ? imageKeys[0] : null);

    console.log(`[Grievance API] Request received for key: ${targetKey}. Analyzing with Sentinel Agent...`);

    let imageBytes: Uint8Array | undefined;
    let imageFormat: "png" | "jpeg" | "webp" = "jpeg";

    // 1. Fetch image from S3 if key provided
    if (targetKey) {
      const getObjCommand = new GetObjectCommand({
        Bucket: AWS_CONFIG.s3.bucketName,
        Key: targetKey,
      });
      const response = await s3Client.send(getObjCommand);
      const bytes = await response.Body?.transformToByteArray();
      if (bytes) {
        imageBytes = bytes;
        const lowKey = targetKey.toLowerCase();
        if (lowKey.endsWith('.png')) imageFormat = "png";
        else if (lowKey.endsWith('.webp')) imageFormat = "webp";
        else imageFormat = "jpeg"; // default for .jpg, .jpeg
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
