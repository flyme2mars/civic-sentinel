// AWS Configuration and SDK Clients
// Note: Credentials should be managed via environment variables (IAM roles in AWS Lambda/EC2)

export const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1', // Defaulting to Mumbai for Bharat Hackathon
  s3: {
    bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  },
  bedrock: {
    modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0', // High-performance model for reasoning
  }
};

// Placeholder for initializing Bedrock/S3 clients
// import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
// export const bedrockClient = new BedrockRuntimeClient({ region: AWS_CONFIG.region });
