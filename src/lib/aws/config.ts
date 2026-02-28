import { S3Client } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { TranscribeClient } from "@aws-sdk/client-transcribe";

// AWS Configuration and SDK Clients
// Note: Credentials should be managed via environment variables (IAM roles in AWS Lambda/EC2)

export const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1', // Defaulting to Mumbai for Bharat Hackathon
  s3: {
    bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'civic-sentinel-uploads',
  },
  bedrock: {
    modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0', // High-performance model for reasoning
  }
};

// Initialize AWS Clients
export const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

export const bedrockClient = new BedrockRuntimeClient({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

export const transcribeClient = new TranscribeClient({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});
