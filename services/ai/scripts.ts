import { Type } from "@google/genai";
import { VideoIdea, ScriptOption } from "../../types";
import { getAI } from "./client";

export async function generateScripts(idea: VideoIdea): Promise<ScriptOption[]> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate 5 different script versions for the YouTube video idea: "${idea.title}". Description: ${idea.description}. Each script should be professional and engaging, with a clear hook, body, and call-to-action.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id:      { type: Type.STRING },
            title:   { type: Type.STRING },
            content: { type: Type.STRING },
            duration: { type: Type.STRING },
          },
          required: ["id", "title", "content", "duration"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.text || "[]");
  if (!Array.isArray(parsed)) throw new Error("Unexpected response format from Gemini");
  return parsed;
}
