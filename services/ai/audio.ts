import { Modality } from "@google/genai";
import { AudioOutput } from "../../types";
import { getAI } from "./client";

const SAMPLE_RATE = 24000;
const NUM_CHANNELS = 1;
const BIT_DEPTH = 16;
const TTS_CHUNK_LIMIT = 4000; // Gemini TTS safe character limit per request

// Returns raw base64 PCM — used by voice audition previews in the UI
export async function generateVoicePreview(text: string, voiceName: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });

  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64) throw new Error("Voice preview generation failed");
  return base64;
}

// Generates complete script audio — chunks long scripts, concatenates PCM, wraps in WAV
export async function generateFullAudio(scriptText: string, voiceName: string): Promise<AudioOutput> {
  const chunks = chunkScript(scriptText, TTS_CHUNK_LIMIT);
  const pcmBuffers: Uint8Array[] = [];

  for (const chunk of chunks) {
    const base64 = await generateVoicePreview(chunk, voiceName);
    pcmBuffers.push(base64ToUint8Array(base64));
  }

  const pcmData = concatenatePCM(pcmBuffers);
  const blob = buildWavBlob(pcmData);
  const durationSeconds = pcmData.length / (SAMPLE_RATE * NUM_CHANNELS * (BIT_DEPTH / 8));

  return { blob, durationSeconds, sizeBytes: blob.size };
}

// Splits on sentence boundaries to avoid cutting mid-word
function chunkScript(text: string, limit: number): string[] {
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > limit) {
    let cut = remaining.lastIndexOf(". ", limit);
    if (cut === -1) cut = remaining.lastIndexOf(" ", limit);
    if (cut === -1) cut = limit;
    else cut += 1;

    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function concatenatePCM(buffers: Uint8Array[]): Uint8Array {
  const total = buffers.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

function buildWavBlob(pcm: Uint8Array): Blob {
  const byteRate = SAMPLE_RATE * NUM_CHANNELS * (BIT_DEPTH / 8);
  const blockAlign = NUM_CHANNELS * (BIT_DEPTH / 8);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  write(0, "RIFF");
  view.setUint32(4,  36 + pcm.length, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16,          true); // PCM chunk size
  view.setUint16(20, 1,           true); // PCM format
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE,  true);
  view.setUint32(28, byteRate,     true);
  view.setUint16(32, blockAlign,   true);
  view.setUint16(34, BIT_DEPTH,    true);
  write(36, "data");
  view.setUint32(40, pcm.length,  true);

  return new Blob([header, pcm], { type: "audio/wav" });
}
