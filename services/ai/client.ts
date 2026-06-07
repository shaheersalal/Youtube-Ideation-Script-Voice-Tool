import { GoogleGenAI } from "@google/genai";

const LS_KEY = 'gemini_api_key';
let cachedKey = '';
let ai: GoogleGenAI | null = null;

export const getAI = (): GoogleGenAI => {
  const key = localStorage.getItem(LS_KEY) || process.env.API_KEY || '';
  if (!key) throw new Error('No Gemini API key found. Enter your key in the app settings.');
  if (!ai || key !== cachedKey) {
    ai = new GoogleGenAI({ apiKey: key });
    cachedKey = key;
  }
  return ai;
};
