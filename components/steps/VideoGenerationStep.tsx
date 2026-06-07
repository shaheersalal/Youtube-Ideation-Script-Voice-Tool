import React from 'react';
import { VideoTheme } from '../../types';

interface Props {
  sceneImages?: string[];
  videoTheme?: VideoTheme;
  onGenerateSEO: () => void;
  onBack: () => void;
}

export const VideoGenerationStep: React.FC<Props> = ({ sceneImages, videoTheme, onGenerateSEO, onBack }) => (
  <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn">
    <div className="text-center space-y-3">
      <div className="w-20 h-20 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
        <i className="fas fa-images text-blue-400 text-3xl"></i>
      </div>
      <h2 className="text-4xl font-black tracking-tighter">Storyboard</h2>
      <p className="text-slate-500">Scene-by-scene visual breakdown for your video.</p>
    </div>

    {sceneImages && sceneImages.length > 0 ? (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sceneImages.map((base64, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video bg-slate-900 rounded-[1.5rem] overflow-hidden border border-slate-800">
                <img
                  src={`data:image/png;base64,${base64}`}
                  alt={`Scene ${i + 1}: ${videoTheme?.scenes[i]?.section ?? ''}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Scene {i + 1} · {videoTheme?.scenes[i]?.section}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={onGenerateSEO}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-lg shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
        >
          GENERATE SEO &amp; SUMMARY
        </button>
      </div>
    ) : (
      <div className="text-center py-16 space-y-6">
        <p className="text-slate-500">No storyboard generated yet. Go back and click GENERATE STORYBOARD.</p>
        <button
          onClick={onBack}
          className="px-10 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Theme
        </button>
      </div>
    )}
  </div>
);
