import { GoogleGenAI } from "@google/genai";

export const getAI = (): GoogleGenAI => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set. Add it to .env.local");
  return new GoogleGenAI({ apiKey: key });
};
