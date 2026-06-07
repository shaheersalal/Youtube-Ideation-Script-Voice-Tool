import { PipelineStep } from "./pipeline";

export interface CostEstimate {
  usd: number;
  unit: string;
  quantity: number;
  label: string;
}

export interface StepInput {
  charCount?: number;
  sceneCount?: number;
  chunkCount?: number;
}

// Gemini pricing as of June 2025 (gemini-2.5-flash, TTS, Imagen 3)
// https://ai.google.dev/pricing
const RATES = {
  FLASH_INPUT_PER_1M_TOKENS:  0.15,   // gemini-2.5-flash text input
  FLASH_OUTPUT_PER_1M_TOKENS: 0.60,   // gemini-2.5-flash text output
  TTS_PER_1M_CHARS:           30.00,  // gemini-2.5-flash-preview-tts
  IMAGEN_PER_IMAGE:            0.04,  // imagen-3.0-generate-001
} as const;

// Rough token estimates per step (conservative, covers typical outputs)
const STEP_TOKEN_ESTIMATES = {
  [PipelineStep.IDEAS]:         { inputTokens: 200,  outputTokens: 600  },
  [PipelineStep.SCRIPTS]:       { inputTokens: 400,  outputTokens: 1200 },
  [PipelineStep.KEYWORDS]:      { inputTokens: 300,  outputTokens: 200  },
  [PipelineStep.VOICE_PREVIEW]: { charsPerRequest: 200 },
  [PipelineStep.FULL_AUDIO]:    { charsPerRequest: 4000 }, // per chunk
  [PipelineStep.SCENE_IMAGES]:  { imagesPerScene: 1 },
} as const;

export function estimateStep(step: PipelineStep, input: StepInput = {}): CostEstimate {
  switch (step) {
    case PipelineStep.IDEAS: {
      const { inputTokens, outputTokens } = STEP_TOKEN_ESTIMATES[step];
      const usd =
        (inputTokens  / 1_000_000) * RATES.FLASH_INPUT_PER_1M_TOKENS +
        (outputTokens / 1_000_000) * RATES.FLASH_OUTPUT_PER_1M_TOKENS;
      return {
        usd,
        unit: "tokens",
        quantity: inputTokens + outputTokens,
        label: `~${inputTokens + outputTokens} tokens · gemini-2.5-flash`,
      };
    }

    case PipelineStep.SCRIPTS: {
      const { inputTokens, outputTokens } = STEP_TOKEN_ESTIMATES[step];
      const usd =
        (inputTokens  / 1_000_000) * RATES.FLASH_INPUT_PER_1M_TOKENS +
        (outputTokens / 1_000_000) * RATES.FLASH_OUTPUT_PER_1M_TOKENS;
      return {
        usd,
        unit: "tokens",
        quantity: inputTokens + outputTokens,
        label: `~${inputTokens + outputTokens} tokens · gemini-2.5-flash`,
      };
    }

    case PipelineStep.KEYWORDS: {
      const { inputTokens, outputTokens } = STEP_TOKEN_ESTIMATES[step];
      const usd =
        (inputTokens  / 1_000_000) * RATES.FLASH_INPUT_PER_1M_TOKENS +
        (outputTokens / 1_000_000) * RATES.FLASH_OUTPUT_PER_1M_TOKENS;
      return {
        usd,
        unit: "tokens",
        quantity: inputTokens + outputTokens,
        label: `~${inputTokens + outputTokens} tokens · gemini-2.5-flash`,
      };
    }

    case PipelineStep.VOICE_PREVIEW: {
      const chars = input.charCount ?? STEP_TOKEN_ESTIMATES[step].charsPerRequest;
      const usd = (chars / 1_000_000) * RATES.TTS_PER_1M_CHARS;
      return {
        usd,
        unit: "characters",
        quantity: chars,
        label: `~${chars} chars · gemini-2.5-flash-preview-tts`,
      };
    }

    case PipelineStep.FULL_AUDIO: {
      const chars = input.charCount ?? 2000;
      const chunks = input.chunkCount ?? Math.ceil(chars / 4000);
      const totalChars = chunks * (input.charCount ?? 4000);
      const usd = (totalChars / 1_000_000) * RATES.TTS_PER_1M_CHARS;
      return {
        usd,
        unit: "characters",
        quantity: totalChars,
        label: `~${totalChars} chars across ${chunks} chunk${chunks > 1 ? "s" : ""} · TTS`,
      };
    }

    case PipelineStep.SCENE_IMAGES: {
      const scenes = input.sceneCount ?? 3;
      const usd = scenes * RATES.IMAGEN_PER_IMAGE;
      return {
        usd,
        unit: "images",
        quantity: scenes,
        label: `${scenes} image${scenes > 1 ? "s" : ""} · imagen-3.0-generate-001`,
      };
    }

    default: {
      const _exhaustive: never = step;
      throw new Error(`No cost estimate defined for step: ${_exhaustive}`);
    }
  }
}

export function formatUsd(usd: number): string {
  if (usd < 0.001) return "< $0.001";
  return `$${usd.toFixed(4)}`;
}
