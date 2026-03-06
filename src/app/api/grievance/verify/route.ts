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
    if (!grievance) {
      return NextResponse.json({ error: 'Grievance not found.' }, { status: 404 });
    }

    // Determine all before and after keys
    const beforeKeys = Array.isArray(grievance.evidenceKeys) && grievance.evidenceKeys.length > 0 
      ? grievance.evidenceKeys 
      : (grievance.imageKey ? [grievance.imageKey] : []);
      
    const afterKeys = Array.isArray(grievance.fixedImageKeys) && grievance.fixedImageKeys.length > 0 
      ? grievance.fixedImageKeys 
      : (grievance.fixedImageKey ? [grievance.fixedImageKey] : []);

    if (beforeKeys.length === 0 || afterKeys.length === 0) {
      return NextResponse.json({ error: 'Required images (before/after) not found for verification.' }, { status: 400 });
    }

    // 2. Fetch all images from S3 as bytes
    const [beforeImages, afterImages] = await Promise.all([
      Promise.all(beforeKeys.map(async (key) => ({ key, bytes: await fetchS3Bytes(key) }))),
      Promise.all(afterKeys.map(async (key) => ({ key, bytes: await fetchS3Bytes(key) })))
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
      Your task is to compare two sets of images of the same location. 
      Set A contains "Before" images showing a reported grievance.
      Set B contains "After" images showing the repair work.

      Grievance Context:
      - Title: ${grievance.title}
      - Description: ${grievance.summary || grievance.originalDescription}

      Analyze:
      1. Location Check: Do the images in Set B correspond to the same physical location shown in Set A? (Use signboards, wall textures, and poles as landmarks).
      2. Resolution Check: Has the primary reported issue (e.g., the specific waste pile or broken pipe) been removed or fixed?
      3. Quality Check: Is the repair complete? 
      
      IMPORTANT JUDGMENT CRITERIA:
      - Distinguish between "Active Waste" (plastic, bags, debris) and "Environmental Stains" (moss, water stains on walls, or natural dirt ground). 
      - Do NOT reject a resolution because of old wall textures or moss if the actual garbage pile has been removed.
      - If the "Before" image showed a massive pile and the "After" image shows a clear area with only minor natural weathering, mark it as VERIFIED.
      - Be pragmatic: A public road doesn't need to be surgically sterile; it just needs the grievance resolved.

      Output ONLY JSON in this format:
      {
        "verified": boolean,
        "status": "VERIFIED" | "REJECTED",
        "confidence": number (0-1),
        "reasoning": "Technical explanation of why it was verified or rejected for the admin. Refer to specific images if necessary.",
        "resolutionSummary": "A concise, user-friendly summary of the repair work for the citizen (e.g., 'The pothole at MG Road has been filled and leveled.')"
      }
    `;

    const userContent: any[] = [];
    userContent.push({ text: "SET A: BEFORE IMAGES" });
    beforeImages.forEach((img, i) => {
      userContent.push({ text: `Before Image ${i + 1}:` });
      userContent.push({ image: { format: getFormat(img.key), source: { bytes: img.bytes } } });
    });

    userContent.push({ text: "SET B: AFTER (RESOLUTION) IMAGES" });
    afterImages.forEach((img, i) => {
      userContent.push({ text: `After Image ${i + 1}:` });
      userContent.push({ image: { format: getFormat(img.key), source: { bytes: img.bytes } } });
    });

    userContent.push({ text: "Please analyze the resolution based on all provided images and the grievance context." });

    const command = new ConverseCommand({
      modelId: AWS_CONFIG.bedrock.modelId,
      messages: [
        {
          role: "user",
          content: userContent
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
