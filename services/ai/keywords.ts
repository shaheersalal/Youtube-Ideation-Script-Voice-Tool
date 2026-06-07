import { getAI } from "./client";

export async function generateKeywords(domain: string, title: string): Promise<string[]> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `List 15 trending SEO keywords for a YouTube video in the "${domain}" domain titled "${title}". Return comma-separated values only, no numbering or explanation.`,
  });
  return (response.text || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}
