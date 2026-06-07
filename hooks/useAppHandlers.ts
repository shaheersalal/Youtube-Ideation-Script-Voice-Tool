import { useState, useRef } from 'react';
import { Step, AppState, VideoIdea, ScriptOption, VoiceOption } from '../types';
import { defaultVideoTheme } from '../components/VideoThemeForm';
import * as pipeline from '../services/pipeline';
import { PipelineStep } from '../services/pipeline';
import { estimateStep, CostEstimate } from '../services/costEstimator';
import { MALE_VOICES, FEMALE_VOICES } from '../constants/voices';

export interface GateAction {
  stepKey: PipelineStep;
  title: string;
  description: string;
  estimate: CostEstimate;
  loadingMessage: string;
  run: () => Promise<void>;
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = buffer.getChannelData(ch);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + ch] / 32768.0;
  }
  return buffer;
}

export function useAppHandlers() {
  const [state, setState] = useState<AppState>({
    currentStep: Step.DOMAIN_INPUT,
    domain: '',
    ideas: [],
    scripts: [],
    voiceGender: 'male',
    voices: [],
    seoKeywords: [],
    videoTheme: defaultVideoTheme,
  });

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [pendingGate, setPendingGate] = useState<GateAction | null>(null);

  const LAST_STEP = Step.FINAL_SUMMARY;

  const confirmGate = async () => {
    if (!pendingGate) return;
    const { run, loadingMessage } = pendingGate;
    setPendingGate(null);
    setLoadingMsg(loadingMessage);
    setLoading(true);
    try { await run(); } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const getAudioContext = () => {
    if (!audioContextRef.current)
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return audioContextRef.current;
  };

  const handleNext = () =>
    setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, LAST_STEP) as Step }));

  const handlePrev = () =>
    setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, Step.DOMAIN_INPUT) as Step }));

  const requestIdeas = () => {
    if (!state.domain) return;
    setPendingGate({
      stepKey: PipelineStep.IDEAS,
      title: "Ideas",
      description: `Scan the "${state.domain}" niche and generate viral video concepts with estimated reach and viral potential scores.`,
      estimate: estimateStep(PipelineStep.IDEAS),
      loadingMessage: `Analyzing ${state.domain} domain for viral opportunities...`,
      run: async () => {
        const ideas = await pipeline.generateIdeas(state.domain);
        setState(prev => ({ ...prev, ideas, currentStep: Step.IDEAS }));
      },
    });
  };

  const requestScripts = (idea: VideoIdea) => {
    setPendingGate({
      stepKey: PipelineStep.SCRIPTS,
      title: "Scripts",
      description: `Generate 5 script variations for "${idea.title}" — each with a distinct hook, body, and call-to-action.`,
      estimate: estimateStep(PipelineStep.SCRIPTS),
      loadingMessage: "Crafting 5 unique script variations...",
      run: async () => {
        const scripts = await pipeline.generateScripts(idea);
        setState(prev => ({ ...prev, selectedIdea: idea, scripts, currentStep: Step.SCRIPTS }));
      },
    });
  };

  const selectScript = (script: ScriptOption) => {
    const voiceOptions = state.voiceGender === 'male' ? MALE_VOICES : FEMALE_VOICES;
    setState(prev => ({ ...prev, selectedScript: script, voices: voiceOptions, currentStep: Step.VOICE_SELECTION }));
  };

  const playVoice = async (voice: VoiceOption, fullScript = false) => {
    setLoading(true);
    const text = fullScript
      ? (state.selectedScript?.content.substring(0, 300) + "...")
      : "Hello, I am ready to narrate your content.";
    setLoadingMsg(fullScript ? 'Synthesizing script preview...' : `Auditioning ${voice.name}...`);
    try {
      const base64 = await pipeline.generateVoicePreview(text, voice.voiceName);
      const ctx = getAudioContext();
      const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      setState(prev => ({ ...prev, selectedVoice: voice }));
    } catch (err: any) {
      setError("Audio playback failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestAudioGeneration = () => {
    if (!state.selectedVoice || !state.selectedScript) return;
    const charCount = state.selectedScript.content.length;
    const chunkCount = Math.ceil(charCount / 4000);
    setPendingGate({
      stepKey: PipelineStep.FULL_AUDIO,
      title: "Full Audio",
      description: `Synthesize the complete script as a WAV file narrated by ${state.selectedVoice.name}. Scripts longer than 4,000 characters are auto-chunked and merged.`,
      estimate: estimateStep(PipelineStep.FULL_AUDIO, { charCount, chunkCount }),
      loadingMessage: `Synthesizing narration with ${state.selectedVoice.name} — this may take a moment...`,
      run: async () => {
        const output = await pipeline.generateFullAudio(state.selectedScript!.content, state.selectedVoice!.voiceName);
        setState(prev => ({ ...prev, audioOutput: output, currentStep: Step.FULL_AUDIO }));
      },
    });
  };

  const requestStoryboard = () => {
    const sceneCount = state.videoTheme?.scenes.length ?? 3;
    setPendingGate({
      stepKey: PipelineStep.SCENE_IMAGES,
      title: "Scene Images",
      description: `Generate ${sceneCount} storyboard images via Imagen 3 — one per scene section with your chosen visual style and color palette.`,
      estimate: estimateStep(PipelineStep.SCENE_IMAGES, { sceneCount }),
      loadingMessage: `Rendering ${sceneCount} storyboard scenes with Imagen 3...`,
      run: async () => {
        const sceneImages = await pipeline.generateSceneImages(state.videoTheme!.scenes, state.videoTheme!);
        setState(prev => ({ ...prev, sceneImages, currentStep: Step.VIDEO_GENERATION }));
      },
    });
  };

  const requestFinalize = () => {
    setPendingGate({
      stepKey: PipelineStep.KEYWORDS,
      title: "Keywords",
      description: `Extract viral SEO keywords for "${state.selectedIdea?.title ?? state.domain}" to complete your content strategy kit.`,
      estimate: estimateStep(PipelineStep.KEYWORDS),
      loadingMessage: "Extracting viral SEO keywords...",
      run: async () => {
        const keywords = await pipeline.generateKeywords(state.domain, state.selectedIdea?.title || "");
        setState(prev => ({ ...prev, seoKeywords: keywords, currentStep: Step.FINAL_SUMMARY }));
      },
    });
  };

  return {
    state, setState, loading, loadingMsg, error, setError,
    pendingGate, setPendingGate, confirmGate,
    handleNext, handlePrev,
    requestIdeas, requestScripts, selectScript, playVoice,
    requestAudioGeneration, requestStoryboard, requestFinalize,
  };
}
