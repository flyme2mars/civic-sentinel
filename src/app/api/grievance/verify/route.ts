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
            { image: { format: "jpeg", source: { bytes: beforeBytes } } },
            { text: "After Image:" },
            { image: { format: "jpeg", source: { bytes: afterBytes } } },
            { text: "Please analyze the resolution." }
          ]
        }
      ],
      system: [{ text: systemPrompt }]
    });

    const bedrockRes = await bedrockClient.send(command);
    const finalContent = bedrockRes.output?.message?.content?.find(c => c.text)?.text;
    
    if (!finalContent) throw new Error("AI failed to generate a response");
    
    // Parse AI Response
    const jsonMatch = finalContent.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { verified: false, status: "REJECTED", reasoning: "AI Error during analysis." };

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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
