import React from 'react';
import { VideoTheme } from '../../types';
import { VideoThemeForm } from '../VideoThemeForm';

interface Props {
  videoTheme: VideoTheme;
  onChange: (theme: VideoTheme) => void;
  onGenerateStoryboard: () => void;
}

export const VideoThemeStep: React.FC<Props> = ({ videoTheme, onChange, onGenerateStoryboard }) => (
  <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn">
    <div className="text-center space-y-3">
      <h2 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-500">
        Design Your Storyboard
      </h2>
      <p className="text-slate-500 text-lg">Configure the visual language Imagen 3 will use to render each scene.</p>
    </div>

    <VideoThemeForm value={videoTheme} onChange={onChange} />

    <div className="pt-4">
      <button
        onClick={onGenerateStoryboard}
        className="w-full py-6 bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-4"
      >
        <i className="fas fa-images"></i> GENERATE STORYBOARD
      </button>
    </div>
  </div>
);
