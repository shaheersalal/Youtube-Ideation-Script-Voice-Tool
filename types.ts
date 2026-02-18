
export enum Step {
  DOMAIN_INPUT = 0,
  IDEAS = 1,
  SCRIPTS = 2,
  VOICE_SELECTION = 3,
  FINAL_SUMMARY = 4
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

export interface AppState {
  currentStep: Step;
  domain: string;
  selectedIdea?: VideoIdea;
  ideas: VideoIdea[];
  selectedScript?: ScriptOption;
  scripts: ScriptOption[];
  voiceGender: 'male' | 'female';
  selectedVoice?: VoiceOption;
  voices: VoiceOption[];
  seoKeywords: string[];
}
