import React from 'react';
import { VideoIdea, ScriptOption, VoiceOption, AudioOutput, VideoTheme } from '../../types';

interface Props {
  domain: string;
  selectedIdea?: VideoIdea;
  selectedVoice?: VoiceOption;
  selectedScript?: ScriptOption;
  seoKeywords: string[];
  audioOutput?: AudioOutput;
  sceneImages?: string[];
  videoTheme?: VideoTheme;
}

export const FinalSummaryStep: React.FC<Props> = ({
  domain, selectedIdea, selectedVoice, selectedScript, seoKeywords, audioOutput, sceneImages, videoTheme,
}) => (
  <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
    <div className="text-center space-y-4">
      <h2 className="text-5xl font-black tracking-tighter">Project Finalized!</h2>
      <p className="text-slate-500 text-lg max-w-2xl mx-auto">Your ideation is complete. Here is your content roadmap and SEO kit.</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Script card */}
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-6">
            <div>
              <h3 className="text-2xl font-black uppercase text-blue-500 tracking-tighter">Project: {selectedIdea?.title}</h3>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Domain: {domain}</p>
            </div>
            <div className="bg-slate-800 px-6 py-3 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase">Selected Voice</p>
              <p className="text-lg font-black">{selectedVoice?.name}</p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-bold flex items-center gap-3">
              <i className="fas fa-file-signature text-blue-400"></i> Final Script
            </h4>
            <div className="p-8 bg-black/40 rounded-3xl border border-slate-800 text-slate-300 font-medium leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {selectedScript?.content}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const blob = new Blob([selectedScript?.content || ""], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedIdea?.title}_Script.txt`;
                  a.click();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
              >
                <i className="fas fa-download"></i> Save Script as .txt
              </button>
            </div>
          </div>
        </div>

        {/* Assets card — only shown when audio or storyboard was generated */}
        {(audioOutput || (sceneImages && sceneImages.length > 0)) && (
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <h4 className="text-xl font-bold flex items-center gap-3">
              <i className="fas fa-box-open text-blue-400"></i> Project Assets
            </h4>

            {audioOutput && (
              <div className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
                    <i className="fas fa-headphones"></i>
                  </div>
                  <div>
                    <p className="font-black text-sm">Narration Audio</p>
                    <p className="text-xs text-slate-500">
                      {Math.floor(audioOutput.durationSeconds / 60)}:{String(Math.floor(audioOutput.durationSeconds % 60)).padStart(2, '0')} · {(audioOutput.sizeBytes / 1024).toFixed(1)} KB · WAV · {selectedVoice?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const url = URL.createObjectURL(audioOutput.blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedIdea?.title ?? 'Narration'}_Audio.wav`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-black tracking-widest transition-all flex-shrink-0"
                >
                  <i className="fas fa-download mr-2"></i> WAV
                </button>
              </div>
            )}

            {sceneImages && sceneImages.length > 0 && (
              <div className="space-y-5">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Storyboard Scenes</p>
                <div className="grid grid-cols-3 gap-4">
                  {sceneImages.map((base64, i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                        <img
                          src={`data:image/png;base64,${base64}`}
                          alt={`Scene ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = `data:image/png;base64,${base64}`;
                          a.download = `Scene_${i + 1}_${videoTheme?.scenes[i]?.section ?? ''}.png`;
                          a.click();
                        }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-slate-400"
                      >
                        <i className="fas fa-download text-xs"></i> Scene {i + 1}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right column: SEO kit + next steps */}
      <div className="space-y-8">
        <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-xl">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-blue-400">
            <i className="fas fa-rocket"></i> SEO Launch Kit
          </h3>
          <div className="space-y-8">
            <section>
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">RECOMMENDED KEYWORDS</h4>
              <div className="flex flex-wrap gap-2">
                {seoKeywords.map((kw, i) => (
                  <span key={i} className="bg-black/40 border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-300 font-bold hover:border-blue-500 transition-colors">
                    #{kw}
                  </span>
                ))}
              </div>
            </section>

            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">ESTIMATED PERFORMANCE</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs font-bold text-slate-500 uppercase">Reach</p>
                  <p className="text-xl font-black text-blue-400">{selectedIdea?.estimatedViews}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs font-bold text-slate-500 uppercase">Viral %</p>
                  <p className="text-xl font-black text-orange-400">{selectedIdea?.viralPotential}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/10 p-10 rounded-[3rem] border border-blue-500/10">
          <h3 className="font-black text-xl mb-4">Next Steps</h3>
          <ul className="space-y-4 text-xs font-medium text-slate-400">
            <li className="flex gap-3"><i className="fas fa-microphone-alt text-blue-400 mt-0.5"></i> Download WAV narration and drop it into your editor.</li>
            <li className="flex gap-3"><i className="fas fa-images text-blue-400 mt-0.5"></i> Use storyboard scenes as visual references for filming.</li>
            <li className="flex gap-3"><i className="fas fa-hashtag text-blue-400 mt-0.5"></i> Paste keywords directly into YouTube tags.</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-black transition-all"
          >
            New Project
          </button>
        </div>
      </div>
    </div>
  </div>
);
