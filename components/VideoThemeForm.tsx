import React from "react";
import { VideoTheme } from "../types";

export const defaultVideoTheme: VideoTheme = {
  style: "cinematic",
  mood: "inspiring",
  palette: "dark",
  aspectRatio: "16:9",
  textOverlay: "subtitles",
  scenes: [
    { section: "Hook", description: "" },
    { section: "Body", description: "" },
    { section: "Call to Action", description: "" },
  ],
  userVision: "",
};

interface VideoThemeFormProps {
  value: VideoTheme;
  onChange: (theme: VideoTheme) => void;
}

interface OptionDef {
  value: string;
  label: string;
  icon: string;
}

function OptionGroup({
  heading,
  options,
  selected,
  onSelect,
}: {
  heading: string;
  options: OptionDef[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{heading}</p>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const active = opt.value === selected;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 text-sm font-bold transition-all active:scale-95 ${
                active
                  ? "bg-blue-600/10 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10"
                  : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              <i className={`fas ${opt.icon}`}></i>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const VideoThemeForm: React.FC<VideoThemeFormProps> = ({ value, onChange }) => {
  const set = <K extends keyof VideoTheme>(key: K, val: VideoTheme[K]) =>
    onChange({ ...value, [key]: val });

  const updateScene = (index: number, description: string) =>
    onChange({
      ...value,
      scenes: value.scenes.map((s, i) => (i === index ? { ...s, description } : s)),
    });

  return (
    <div className="space-y-10">
      <OptionGroup
        heading="Visual Style"
        selected={value.style}
        onSelect={(v) => set("style", v as VideoTheme["style"])}
        options={[
          { value: "cinematic", label: "Cinematic", icon: "fa-film" },
          { value: "minimal",   label: "Minimal",   icon: "fa-grip-lines" },
          { value: "energetic", label: "Energetic", icon: "fa-bolt" },
          { value: "corporate", label: "Corporate", icon: "fa-briefcase" },
        ]}
      />

      <OptionGroup
        heading="Mood"
        selected={value.mood}
        onSelect={(v) => set("mood", v as VideoTheme["mood"])}
        options={[
          { value: "inspiring",    label: "Inspiring",    icon: "fa-star" },
          { value: "educational",  label: "Educational",  icon: "fa-book" },
          { value: "entertaining", label: "Entertaining", icon: "fa-face-grin" },
          { value: "dramatic",     label: "Dramatic",     icon: "fa-circle-exclamation" },
        ]}
      />

      <OptionGroup
        heading="Color Palette"
        selected={value.palette}
        onSelect={(v) => set("palette", v as VideoTheme["palette"])}
        options={[
          { value: "dark",    label: "Dark",    icon: "fa-moon" },
          { value: "light",   label: "Light",   icon: "fa-sun" },
          { value: "vibrant", label: "Vibrant", icon: "fa-palette" },
          { value: "muted",   label: "Muted",   icon: "fa-circle-half-stroke" },
        ]}
      />

      <OptionGroup
        heading="Aspect Ratio"
        selected={value.aspectRatio}
        onSelect={(v) => set("aspectRatio", v as VideoTheme["aspectRatio"])}
        options={[
          { value: "16:9", label: "16:9 · Landscape", icon: "fa-display" },
          { value: "9:16", label: "9:16 · Portrait",  icon: "fa-mobile" },
          { value: "1:1",  label: "1:1 · Square",     icon: "fa-square" },
        ]}
      />

      <OptionGroup
        heading="Text Overlay"
        selected={value.textOverlay}
        onSelect={(v) => set("textOverlay", v as VideoTheme["textOverlay"])}
        options={[
          { value: "subtitles", label: "Subtitles", icon: "fa-closed-captioning" },
          { value: "chapters",  label: "Chapters",  icon: "fa-list" },
          { value: "none",      label: "None",      icon: "fa-ban" },
        ]}
      />

      {/* Per-section scene descriptions */}
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Scene Descriptions</p>
          <p className="text-xs text-slate-600 mt-1">
            Describe the visual for each section. Imagen 3 will use these to generate storyboard images.
          </p>
        </div>
        <div className="space-y-5">
          {value.scenes.map((scene, i) => (
            <div key={i} className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                <span className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-[10px]">
                  {i + 1}
                </span>
                {scene.section}
              </label>
              <textarea
                value={scene.description}
                onChange={(e) => updateScene(i, e.target.value)}
                placeholder={`Describe the visual for the ${scene.section.toLowerCase()} section...`}
                rows={2}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Free-text vision */}
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Your Vision</p>
          <p className="text-xs text-slate-600 mt-1">
            Extra context, references, or creative direction that applies to the whole video.
          </p>
        </div>
        <textarea
          value={value.userVision}
          onChange={(e) => onChange({ ...value, userVision: e.target.value })}
          placeholder="e.g. Think Tesla product reveal — dark studio, dramatic lighting, white sans-serif text fades in word by word..."
          rows={4}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none transition-all"
        />
      </div>
    </div>
  );
};
