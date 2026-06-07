import React from 'react';
import { AudioOutput, VoiceOption, VideoIdea } from '../../types';

interface Props {
  audioOutput?: AudioOutput;
  selectedVoice?: VoiceOption;
  selectedIdea?: VideoIdea;
  onGenerateSEO: () => void;
}

export const FullAudioStep: React.FC<Props> = ({ audioOutput, selectedVoice, selectedIdea, onGenerateSEO }) => (
  <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
    <div className="text-center space-y-3">
      <div className="w-20 h-20 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
        <i className="fas fa-headphones text-blue-400 text-3xl"></i>
      </div>
      <h2 className="text-4xl font-black tracking-tighter">Audio Synthesized</h2>
      <p className="text-slate-500">Your script narration is ready to download.</p>
    </div>

    {audioOutput && (
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-800">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            selectedVoice?.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
          }`}>
            <i className={`fas ${selectedVoice?.gender === 'male' ? 'fa-mars' : 'fa-venus'} text-xl`}></i>
          </div>
          <div>
            <p className="text-xl font-black">{selectedVoice?.name}</p>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">NARRATOR · PREMIUM VOICE</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 p-6 rounded-2xl border border-slate-800 text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">DURATION</p>
            <p className="text-2xl font-black text-blue-400">
              {Math.floor(audioOutput.durationSeconds / 60)}:{String(Math.floor(audioOutput.durationSeconds % 60)).padStart(2, '0')}
            </p>
          </div>
          <div className="bg-black/40 p-6 rounded-2xl border border-slate-800 text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">FILE SIZE</p>
            <p className="text-2xl font-black text-blue-400">
              {(audioOutput.sizeBytes / 1024).toFixed(1)} <span className="text-sm font-bold">KB</span>
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
          className="w-full py-5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-2xl font-black tracking-widest text-sm transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <i className="fas fa-download"></i> DOWNLOAD WAV
        </button>
      </div>
    )}

    <button
      onClick={onGenerateSEO}
      className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-lg shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
    >
      GENERATE SEO &amp; SUMMARY
    </button>
  </div>
);
