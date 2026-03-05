import { NextResponse } from 'next/server';
import { dynamoDb, s3Client, bedrockClient, AWS_CONFIG } from '@/lib/aws/config';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

/**
 * VISION AUDITOR API
 * This endpoint uses AI to compare the "Before" (imageKey) and "After" (fixedImageKey) photos.
 */
export async function POST(request: Request) {
  try {
    // SECURITY: Basic Token-based Authorization
    const token = request.headers.get('x-govt-token');
    if (token !== process.env.GOVT_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized Access Denied' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Grievance ID is required' }, { status: 400 });
    }

    // 1. Get the Grievance details from DynamoDB
    const getRes = await dynamoDb.send(new GetCommand({
      TableName: AWS_CONFIG.dynamodb.tableName,
      Key: { id }
    }));

    const grievance = getRes.Item;
    if (!grievance || !grievance.imageKey || !grievance.fixedImageKey) {
      return NextResponse.json({ error: 'Required images (before/after) not found for verification.' }, { status: 400 });
    }

    // 2. Fetch both images from S3 as bytes
    const [beforeBytes, afterBytes] = await Promise.all([
      fetchS3Bytes(grievance.imageKey),
      fetchS3Bytes(grievance.fixedImageKey)
    ]);

    // Helper to determine format for Bedrock
    const getFormat = (key: string): "png" | "jpeg" | "webp" => {
      const ext = key.split('.').pop()?.toLowerCase();
      if (ext === 'png') return 'png';
      if (ext === 'webp') return 'webp';
      return 'jpeg'; // default to jpeg for jpg/jpeg
    };

    // 3. Trigger Bedrock Claude 3.5 Sonnet to compare
    const systemPrompt = `
      You are an elite Civil Infrastructure Inspector. 
      Your task is to compare two images of the same location. 
      Image A is the "Before" image showing a reported grievance.
      Image B is the "After" image showing the repair work.

      Analyze:
      1. Location Check: Do both images look like the same physical location?
      2. Resolution Check: Has the reported issue (e.g., pothole, waste, broken pipe) been fixed?
      3. Quality Check: Is the repair complete and professional?

      Output ONLY JSON in this format:
      {
        "verified": boolean,
        "status": "VERIFIED" | "REJECTED",
        "confidence": number (0-1),
        "reasoning": "Clear explanation of why it was verified or rejected"
      }
    `;

    const command = new ConverseCommand({
      modelId: AWS_CONFIG.bedrock.modelId,
      messages: [
        {
          role: "user",
          content: [
            { text: "Before Image:" },
            { image: { format: getFormat(grievance.imageKey), source: { bytes: beforeBytes } } },
            { text: "After Image:" },
            { image: { format: getFormat(grievance.fixedImageKey), source: { bytes: afterBytes } } },
            { text: "Please analyze the resolution." }
          ]
        }
      ],
      system: [{ text: systemPrompt }]
    });

    const bedrockRes = await bedrockClient.send(command);
    const finalContent = bedrockRes.output?.message?.content?.find(c => c.text)?.text;
    
    if (!finalContent) throw new Error("AI failed to generate a response");
    
    // Parse AI Response - Improved parsing to handle markdown code fences
    let result;
    try {
      // Clean content from potential markdown markers
      const cleanContent = finalContent.replace(/```json\s?|```/g, '').trim();
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error("[Vision Auditor] JSON Parse Error:", e, "Content:", finalContent);
    }

    if (!result) {
       result = { verified: false, status: "REJECTED", reasoning: "AI Error during analysis output parsing." };
    }

    // Status Coercion & Validation
    const validStatuses = ['VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(result.status)) {
       result.status = result.verified ? 'VERIFIED' : 'REJECTED';
    }

    const timestamp = new Date().toISOString();

    // 4. Update DynamoDB with AI findings
    const updateCommand = new UpdateCommand({
      TableName: AWS_CONFIG.dynamodb.tableName,
      Key: { id },
      UpdateExpression: "SET #st = :status, aiVerificationResult = :result, verifiedAt = :time, history = list_append(if_not_exists(history, :empty_list), :historyEntry)",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: {
        ":status": result.status,
        ":result": result,
        ":time": timestamp,
        ":empty_list": [],
        ":historyEntry": [
          {
            action: result.status,
            timestamp: timestamp,
            note: `Vision Auditor Result: ${result.reasoning}`
          }
        ]
      },
      ReturnValues: "ALL_NEW"
    });

    await dynamoDb.send(updateCommand);

    return NextResponse.json({ 
      success: true, 
      id,
      ...result 
    });

  } catch (error: any) {
    console.error('[Vision Auditor API] Error:', error);
    // Generic error message for security
    return NextResponse.json({ error: 'An error occurred during vision verification.' }, { status: 500 });
  }
}

async function fetchS3Bytes(key: string): Promise<Uint8Array> {
  const command = new GetObjectCommand({
    Bucket: AWS_CONFIG.s3.bucketName,
    Key: key
  });
  const res = await s3Client.send(command);
  const bytes = await res.Body?.transformToByteArray();
  if (!bytes) throw new Error(`Could not fetch bytes for S3 key: ${key}`);
  return bytes;
}
