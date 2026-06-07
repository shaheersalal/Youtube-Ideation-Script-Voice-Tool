
export enum Step {
  DOMAIN_INPUT = 0,
  IDEAS = 1,
  SCRIPTS = 2,
  VOICE_SELECTION = 3,
  FULL_AUDIO = 4,
  FINAL_SUMMARY = 5
}

export interface VideoIdea {
  id: string;
  title: string;
  description: string;
  estimatedViews: string;
  viralPotential: number; // 1-100
}

export interface ScriptOption {
  id: string;
  title: string;
  content: string;
  duration: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  voiceName: string;
}

export interface AudioOutput {
  blob: Blob;
  durationSeconds: number;
  sizeBytes: number;
}

export interface SceneDescription {
  section: string; // e.g. "hook", "body", "cta"
  description: string;
}

export interface VideoTheme {
  style: "cinematic" | "minimal" | "energetic" | "corporate";
  mood: "inspiring" | "educational" | "entertaining" | "dramatic";
  palette: "dark" | "light" | "vibrant" | "muted";
  aspectRatio: "16:9" | "9:16" | "1:1";
  textOverlay: "subtitles" | "chapters" | "none";
  scenes: SceneDescription[];
  userVision: string;
}

export interface AppState {
  currentStep: Step;
  domain: string;
  selectedIdea?: VideoIdea;
  ideas: VideoIdea[];
  selectedScript?: ScriptOption;
  scripts: ScriptOption[];
  voiceGender: "male" | "female";
  selectedVoice?: VoiceOption;
  voices: VoiceOption[];
  seoKeywords: string[];
  audioOutput?: AudioOutput;
  videoTheme?: VideoTheme;
  sceneImages?: string[];
}
