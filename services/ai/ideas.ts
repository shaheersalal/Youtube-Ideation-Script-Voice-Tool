import { Type } from "@google/genai";
import { VideoIdea } from "../../types";
import { getAI } from "./client";

export async function generateIdeas(domain: string): Promise<VideoIdea[]> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate 5 viral YouTube video ideas for the domain: ${domain}. For each idea, provide a catchy title, a short description, and an estimation of potential views and viral potential (1-100).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id:             { type: Type.STRING },
            title:          { type: Type.STRING },
            description:    { type: Type.STRING },
            estimatedViews: { type: Type.STRING },
            viralPotential: { type: Type.NUMBER },
          },
          required: ["id", "title", "description", "estimatedViews", "viralPotential"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.text || "[]");
  if (!Array.isArray(parsed)) throw new Error("Unexpected response format from Gemini");
  return parsed;
}
