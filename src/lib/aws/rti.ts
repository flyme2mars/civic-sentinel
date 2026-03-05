import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { bedrockClient, dynamoDb, AWS_CONFIG } from './config';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// 1. Fetch the exact grievance
export async function getGrievanceById(id: string) {
  const command = new GetCommand({
    TableName: AWS_CONFIG.dynamodb.tableName,
    Key: { id }
  });
  const response = await dynamoDb.send(command);
  if (!response.Item) throw new Error("Grievance not found");
  return response.Item;
}

// 2. Ask Bedrock ONLY for the questions
export async function generateRTIQuestions(grievance: any) {
  // 1. Map the schema correctly based on your Auditor Agent's output
  const title = grievance.title || "Civil Issue";
  const description = grievance.summary || grievance.description || "No description provided.";
  const targetDept = grievance.target_department || grievance.targetDepartment || grievance.category || 'Concerned Public Authority';

  // 2. Flatten the location object into a readable string for the LLM
  const locObj = grievance.location || {};
  const fullAddress = [locObj.landmark, locObj.area, locObj.city, locObj.district, locObj.state, locObj.pincode]
    .filter(Boolean) // Removes undefined/null values
    .join(', ');

  // Debugging logs to verify the fix
  console.log("=== DATA SENT TO NOVA ===");
  console.log("Department:", targetDept);
  console.log("Title:", title);
  console.log("Address:", fullAddress);
  console.log("Description:", description);
  console.log("=========================");

  const RTI_PROMPT = `
You are an expert Indian RTI Act legal assistant.
Grievance: ${title} - ${description}
Location: ${fullAddress}
Target Department: ${targetDept}

TASK:
Write exactly 3 highly objective questions directed at the ${targetDept} demanding accountability for this specific issue.
Ask for the daily file movement report, names of responsible officers, and certified copies of action taken.

OUTPUT FORMAT:
Output ONLY the numbered list of questions. Do not include any introductory text, department names, or markdown blocks.
  `;

  const command = new ConverseCommand({
    modelId: AWS_CONFIG.bedrock.modelId,
    messages: [{ role: "user", content: [{ text: RTI_PROMPT }] }],
  });

  const response = await bedrockClient.send(command);
  const content = response.output?.message?.content?.find(c => c.text)?.text;

  if (!content) throw new Error("No response from AI model");

  return content.trim();
}

// 3. Stamp the single PDF
export async function buildRTIPdfs(grievance: any, questionsText: string) {
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'RTI_Format.pdf');
  const existingPdfBytes = await fs.readFile(templatePath);
  const today = new Date().toLocaleDateString('en-IN');

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  const fill = (name: string, val: string, fontSize?: number) => {
    try {
      const field = form.getTextField(name);
      if (field) {
        field.setText(val);
        if (fontSize) field.setFontSize(fontSize);
      }
    } catch (e) {
      console.warn(`Could not fill PDF field: ${name}`);
    }
  };

  // Ensure we use the exact same fallbacks for the PDF
  const targetDept = grievance.target_department || grievance.targetDepartment || grievance.category || 'Concerned Authority';

  const locObj = grievance.location || {};
  const fullAddress = [locObj.landmark, locObj.area, locObj.city, locObj.district, locObj.state]
    .filter(Boolean)
    .join(', ');

  fill('departmentName', targetDept, 13);
  fill('novaQuestions', questionsText, 13);

  fill('applicantName', grievance.citizen || 'Citizen', 13);
  fill('departmentAddress', fullAddress || '', 13);

  // applicantAddress field name in the template pdf
  // applicantPhoneNumber field name in the template pdf
  // applicantEMailAddress field name in the template pdf

  // Make sure these fields exist in your new PDF template!
  // fill('submissionDate', today, 11);
  // fill('submissionPlace', locObj.city || locObj.district || 'Kerala', 11);

  form.flatten();
  const bytes = await pdfDoc.save();

  const cleanDept = targetDept.replace(/[^a-z0-9]/gi, '_');

  return [{
    name: `RTI_${grievance.id}_${cleanDept}.pdf`,
    bytes
  }];
}