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
        
        // DEFENSIVE: Detect format via Magic Numbers
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
          imageFormat = "png";
        } else if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
          imageFormat = "jpeg";
        } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
          imageFormat = "webp";
        } else {
          // Fallback to extension
          const lowKey = targetKey.toLowerCase();
          if (lowKey.endsWith('.png')) imageFormat = "png";
          else if (lowKey.endsWith('.webp')) imageFormat = "webp";
          else imageFormat = "jpeg";
        }
        
        console.log(`[Grievance API] Detected image format from bytes: ${imageFormat}`);
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
