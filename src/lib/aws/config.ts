import { S3Client } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { TranscribeClient } from "@aws-sdk/client-transcribe";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";
import { GeoMapsClient } from "@aws-sdk/client-geo-maps";
import { GeoRoutesClient } from "@aws-sdk/client-geo-routes";

// AWS Configuration and SDK Clients
export const AWS_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
  s3: {
    bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'civic-sentinel-uploads',
  },
  bedrock: {
    modelId: process.env.BEDROCK_MODEL_ID || 'apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
  },
  dynamodb: {
    tableName: process.env.DYNAMODB_TABLE_NAME || 'CivicGrievances',
  }

};

const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';

if (!accessKeyId) {
  console.warn('[AWS Config] WARNING: Access Key ID is missing from environment variables!');
}

const credentials = {
  accessKeyId,
  secretAccessKey,
};

// Initialize AWS Clients
export const s3Client = new S3Client({ region: AWS_CONFIG.region, credentials });
export const bedrockClient = new BedrockRuntimeClient({ region: AWS_CONFIG.region, credentials });
export const transcribeClient = new TranscribeClient({ region: AWS_CONFIG.region, credentials });

// Modern Resourceless Location Clients
export const geoPlacesClient = new GeoPlacesClient({ region: AWS_CONFIG.region, credentials });
export const geoMapsClient = new GeoMapsClient({ region: AWS_CONFIG.region, credentials });
export const geoRoutesClient = new GeoRoutesClient({ region: AWS_CONFIG.region, credentials });

const ddbClient = new DynamoDBClient({ region: AWS_CONFIG.region, credentials });
export const dynamoDb = DynamoDBDocumentClient.from(ddbClient);
