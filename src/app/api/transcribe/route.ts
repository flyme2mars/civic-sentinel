import { NextResponse } from 'next/server';
import { SarvamAIClient } from "sarvamai";
import { writeFile, mkdir, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync } from 'fs';
import { benchmark } from '@/lib/utils/benchmarking';

export async function POST(request: Request) {
  const startTime = benchmark.start();
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

    await mkdir(inputDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, buffer);

    const client = new SarvamAIClient({
      apiSubscriptionKey: process.env.SARVAM_API_KEY || ''
    });

    console.log(`[Sarvam] Creating job for saaras:v3...`);
    const job = await client.speechToTextJob.createJob({
      model: "saaras:v3",
      languageCode: "unknown", // Auto-detection
      withDiarization: false
    });

    await job.uploadFiles([tempFilePath]);
    await job.start();
    
    console.log(`[Sarvam] Job ${job.jobId} started. Waiting...`);
    await job.waitUntilComplete();

    console.log(`[Sarvam] Job complete. Downloading outputs to ${outputDir}...`);
    await job.downloadOutputs(outputDir);

    const files = await readdir(outputDir);
    const jsonFile = files.find(f => f.endsWith('.json'));

    if (jsonFile) {
      const outputPath = join(outputDir, jsonFile);
      const outputData = await readFile(outputPath, 'utf-8');
      const parsed = JSON.parse(outputData);

      console.log("[Sarvam] Raw Output Keys:", Object.keys(parsed));

      let transcript = parsed.transcript;

      if (!transcript && parsed.results && Array.isArray(parsed.results)) {
        transcript = parsed.results.map((r: any) => r.transcript).join(" ");
      } else if (!transcript && parsed.diarized_transcript?.entries) {
        transcript = parsed.diarized_transcript.entries.map((e: any) => e.transcript).join(" ");
      }

      if (transcript) {
        console.log(`[Sarvam] Successfully extracted text.`);
        benchmark.end("Sarvam AI Transcription", startTime);
        return NextResponse.json({ transcript: transcript.trim() });
      }
    }

    console.error("[Sarvam] Output file missing or invalid structure. Files found:", files);
    benchmark.end("Sarvam AI Transcription (FAILED)", startTime);
    throw new Error("Could not find transcript in downloaded outputs.");

  } catch (error: any) {
    console.error('[Sarvam API] Error:', error);
    benchmark.end("Sarvam AI Transcription (ERROR)", startTime);
    return NextResponse.json({ error: error.message || 'Transcription failed' }, { status: 500 });
  } finally {
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
