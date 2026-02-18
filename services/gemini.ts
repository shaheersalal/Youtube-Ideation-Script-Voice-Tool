
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VideoIdea, ScriptOption } from "../types";

// Always create a fresh instance to ensure we use the most up-to-date process.env.API_KEY
export const createAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateIdeas(domain: string): Promise<VideoIdea[]> {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 viral YouTube video ideas for the domain: ${domain}. For each idea, provide a catchy title, a short description, and an estimation of potential views and viral potential (1-100).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedViews: { type: Type.STRING },
            viralPotential: { type: Type.NUMBER },
          },
          required: ["id", "title", "description", "estimatedViews", "viralPotential"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}

export async function generateScripts(idea: VideoIdea): Promise<ScriptOption[]> {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 different script versions for the YouTube video idea: "${idea.title}". Description: ${idea.description}. Each script should be professional and engaging.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            duration: { type: Type.STRING },
          },
          required: ["id", "title", "content", "duration"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}

export async function generateKeywords(domain: string, title: string): Promise<string[]> {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `List 15 trending SEO keywords for a YouTube video in the "${domain}" domain titled "${title}". Comma separated.`,
  });
  return (response.text || "").split(',').map(s => s.trim());
}

export async function generateVoiceAudio(text: string, voiceName: string): Promise<string> {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Voice generation failed");
  return base64Audio;
}
