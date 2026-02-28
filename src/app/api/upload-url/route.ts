import { NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, AWS_CONFIG } from '@/lib/aws/config';

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Filename and fileType are required' }, { status: 400 });
    }

    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: AWS_CONFIG.s3.bucketName,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
