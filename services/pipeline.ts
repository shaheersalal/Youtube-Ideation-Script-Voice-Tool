export { generateIdeas }        from "./ai/ideas";
export { generateScripts }      from "./ai/scripts";
export { generateKeywords }     from "./ai/keywords";
export { generateVoicePreview, generateFullAudio } from "./ai/audio";
export { generateSceneImages }  from "./ai/images";

// Used by costEstimator and PermissionGate to identify which step is gating
export enum PipelineStep {
  IDEAS         = "ideas",
  SCRIPTS       = "scripts",
  VOICE_PREVIEW = "voice_preview",
  FULL_AUDIO    = "full_audio",
  SCENE_IMAGES  = "scene_images",
  KEYWORDS      = "keywords",
}
