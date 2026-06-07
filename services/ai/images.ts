import { getAI } from "./client";
import { SceneDescription, VideoTheme } from "../../types";

// Implemented in Step 6 — generates one scene image per script section via Imagen 3
export async function generateSceneImages(
  scenes: SceneDescription[],
  theme: VideoTheme
): Promise<string[]> {
  const ai = getAI();
  const results: string[] = [];

  for (const scene of scenes) {
    const prompt = buildImagePrompt(scene, theme);
    const response = await (ai.models as any).generateImages({
      model: "imagen-3.0-generate-001",
      prompt,
      config: { numberOfImages: 1, aspectRatio: theme.aspectRatio },
    });

    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64) throw new Error(`Image generation failed for scene: ${scene.section}`);
    results.push(base64);
  }

  return results;
}

function buildImagePrompt(scene: SceneDescription, theme: VideoTheme): string {
  return [
    `${theme.style} style,`,
    `${theme.mood} mood,`,
    `${theme.palette} color palette,`,
    scene.description,
    theme.userVision ? `Additional context: ${theme.userVision}` : "",
    "cinematic composition, high quality, no text",
  ]
    .filter(Boolean)
    .join(" ");
}
