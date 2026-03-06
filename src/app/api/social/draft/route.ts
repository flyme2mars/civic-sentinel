import { NextResponse } from 'next/server';
import { getGrievanceById } from '@/lib/aws/rti';
import { generateSocialPost } from '@/lib/aws/social';
import { s3Client, AWS_CONFIG } from '@/lib/aws/config';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { grievanceId, citizenId } = await request.json();
        if (!grievanceId || !citizenId) return NextResponse.json({ error: 'Missing Data' }, { status: 400 });

        const grievance = await getGrievanceById(grievanceId);

        if (grievance.citizenId !== citizenId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 1. Generate the tweet text
        const postText = await generateSocialPost(grievance);

        // 2. Safely grab the raw key from DynamoDB
        const targetKey = grievance.imageKey || (grievance.evidenceKeys && grievance.evidenceKeys[0]);
        let imageUrl = '';

        // 3. Generate the S3 Presigned URL if a key exists
        if (targetKey) {
            try {
                const command = new GetObjectCommand({
                    Bucket: AWS_CONFIG.s3.bucketName,
                    Key: targetKey,
                });
                // Create a temporary secure URL valid for 1 hour
                imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            } catch (e) {
                console.error("[S3 Error] Could not generate signed URL:", e);
            }
        }

        return NextResponse.json({
            success: true,
            postText,
            imageUrl
        });

    } catch (error: any) {
        console.error('[Social Draft API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}