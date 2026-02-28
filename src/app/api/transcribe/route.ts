import { NextResponse } from 'next/server';
import { SarvamAIClient } from "sarvamai";
import { writeFile, unlink, mkdir, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  const sessionId = Date.now();
  const baseDir = join(tmpdir(), `sarvam-${sessionId}`);
  const inputDir = join(baseDir, 'input');
  const outputDir = join(baseDir, 'output');
  const tempFilePath = join(inputDir, `audio.webm`);
  
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as Blob;
    
    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // 1. Setup temporary workspace
    await mkdir(inputDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, buffer);

    // 2. Initialize Sarvam Client
    const client = new SarvamAIClient({
      apiSubscriptionKey: process.env.SARVAM_API_KEY || ''
    });

    // 3. Create Batch Job
    console.log(`[Sarvam] Creating job for saaras:v3...`);
    const job = await client.speechToTextJob.createJob({
      model: "saaras:v3",
      mode: "transcribe",
      languageCode: "unknown", // Auto-detection
      withDiarization: false
    });

    // 4. Upload, Start, and Wait
    await job.uploadFiles([tempFilePath]);
    await job.start();
    
    console.log(`[Sarvam] Job ${job.jobId} started. Waiting...`);
    await job.waitUntilComplete();

    // 5. Download Outputs (This is where the actual text lives)
    console.log(`[Sarvam] Job complete. Downloading outputs to ${outputDir}...`);
    await job.downloadOutputs(outputDir);

    // 6. Find and read the output JSON
    const files = await readdir(outputDir);
    const jsonFile = files.find(f => f.endsWith('.json'));

    if (jsonFile) {
      const outputPath = join(outputDir, jsonFile);
      const outputData = await readFile(outputPath, 'utf-8');
      const parsed = JSON.parse(outputData);

      console.log("[Sarvam] Raw Output Keys:", Object.keys(parsed));

      // According to docs, text can be in 'transcript' or 'diarized_transcript'
      let transcript = parsed.transcript;

      // If it's a diarized format or array of segments (common in saaras:v3)
      if (!transcript && parsed.results && Array.isArray(parsed.results)) {
        transcript = parsed.results.map((r: any) => r.transcript).join(" ");
      } else if (!transcript && parsed.diarized_transcript?.entries) {
        transcript = parsed.diarized_transcript.entries.map((e: any) => e.transcript).join(" ");
      }

      if (transcript) {
        console.log(`[Sarvam] Successfully extracted text.`);
        return NextResponse.json({ transcript: transcript.trim() });
      }
    }

    // Fallback if file structure is unexpected
    console.error("[Sarvam] Output file missing or invalid structure. Files found:", files);
    throw new Error("Could not find transcript in downloaded outputs.");

  } catch (error: any) {
    console.error('[Sarvam API] Error:', error);
    return NextResponse.json({ error: error.message || 'Transcription failed' }, { status: 500 });
  } finally {
    // Cleanup the entire temp workspace
    try {
      const { rm } = await import('fs/promises');
      if (existsSync(baseDir)) {
        await rm(baseDir, { recursive: true, force: true });
        console.log(`[Sarvam] Workspace ${baseDir} cleaned up.`);
      }
    } catch (e) {
      console.error("[Sarvam] Cleanup failed:", e);
    }
  }
}
