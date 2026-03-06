import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient, AWS_CONFIG } from './config';

export async function generateSocialPost(grievance: any) {
    const title = grievance.title || "Civil Issue";
    // We use summary because the description is raw citizen input, summary is the professional version
    const description = grievance.summary || grievance.description || "";
    const targetDept = grievance.targetDepartment || grievance.target_department || "the responsible authorities";

    const locObj = grievance.location || {};
    const fullAddress = [locObj.area, locObj.city, locObj.district].filter(Boolean).join(', ');

    const SOCIAL_PROMPT = `
You are a social media expert for a civic action platform.
Based on this grievance, write a highly engaging, urgent X (Twitter) post to bring public attention to it.

Grievance: ${title}
Details: ${description}
Location: ${fullAddress}
Target Department: ${targetDept}

TASK:
1. Write a punchy X post well under 220 characters.
2. Demand action from the ${targetDept}.
3. Include 2 relevant hashtags (e.g., #Kerala #CivicIssue).
4. DO NOT include any links, image placeholders (like [Image]), or introductory text. Output ONLY the raw post content.
  `;

    const command = new ConverseCommand({
        modelId: AWS_CONFIG.bedrock.modelId,
        messages: [{ role: "user", content: [{ text: SOCIAL_PROMPT }] }],
    });

    const response = await bedrockClient.send(command);
    const content = response.output?.message?.content?.find(c => c.text)?.text;

    if (!content) throw new Error("No response from AI model");

    return content.trim();
}