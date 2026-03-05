import { DynamoDBClient, ListTablesCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { AWS_CONFIG } from "./config";

export async function diagnose() {
  console.log("--- AWS Configuration Diagnosis ---");
  console.log("Region:", AWS_CONFIG.region);
  console.log("Target Table:", AWS_CONFIG.dynamodb.tableName);
  
  const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
  console.log("Access Key Present:", !!accessKeyId);
  console.log("Secret Key Present:", !!(process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY));

  const client = new DynamoDBClient({ 
    region: AWS_CONFIG.region,
    credentials: {
      accessKeyId,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  });

  try {
    console.log("Attempting to list tables...");
    const listRes = await client.send(new ListTablesCommand({}));
    console.log("Available Tables:", listRes.TableNames);

    if (listRes.TableNames?.includes(AWS_CONFIG.dynamodb.tableName)) {
      console.log(`SUCCESS: Table '${AWS_CONFIG.dynamodb.tableName}' found.`);
      const descRes = await client.send(new DescribeTableCommand({ TableName: AWS_CONFIG.dynamodb.tableName }));
      console.log("Table Status:", descRes.Table?.TableStatus);
    } else {
      console.log(`ERROR: Table '${AWS_CONFIG.dynamodb.tableName}' NOT found in this region.`);
    }
  } catch (err: any) {
    console.error("DIAGNOSIS FAILED:", err.name, "-", err.message);
  }
}
