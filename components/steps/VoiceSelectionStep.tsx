import React from 'react';
import { VoiceOption } from '../../types';

interface Props {
  voices: VoiceOption[];
  selectedVoice?: VoiceOption;
  onSelectVoice: (voice: VoiceOption) => void;
  onPlayVoice: (voice: VoiceOption, fullScript?: boolean) => void;
  onGenerateAudio: () => void;
}

export const VoiceSelectionStep: React.FC<Props> = ({
  voices, selectedVoice, onSelectVoice, onPlayVoice, onGenerateAudio,
}) => (
  <div className="space-y-10 animate-fadeIn max-w-4xl mx-auto">
    <div className="text-center space-y-2">
      <h2 className="text-4xl font-black">Audition AI Narrators</h2>
      <p className="text-slate-500">Listen to the tones and pick your final narrator.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {voices.map((voice) => (
        <div
          key={voice.id}
          onClick={() => onSelectVoice(voice)}
          className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col gap-6 ${
            selectedVoice?.id === voice.id
              ? 'bg-blue-600/5 border-blue-500 shadow-2xl'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${voice.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
              <i className={`fas ${voice.gender === 'male' ? 'fa-mars' : 'fa-venus'} text-2xl`}></i>
            </div>
            <div className="flex-1">
              <h4 className="font-black text-2xl">{voice.name}</h4>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">PREMIUM NARRATOR</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onPlayVoice(voice); }}
              className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-lg transition-all"
              title="Quick Sample"
            >
              <i className="fas fa-play ml-1"></i>
            </button>
          </div>

          {selectedVoice?.id === voice.id && (
            <button
              onClick={(e) => { e.stopPropagation(); onPlayVoice(voice, true); }}
              className="w-full py-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl text-xs font-black tracking-widest hover:bg-blue-500/20 transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-headphones"></i> HEAR SCRIPT SNIPPET
            </button>
          )}
        </div>
      ))}
    </div>

    <div className="flex justify-center mt-12">
      <button
        disabled={!selectedVoice}
        onClick={onGenerateAudio}
        className="px-16 py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-4"
      >
        <i className="fas fa-headphones"></i> GENERATE AUDIO
      </button>
    </div>
  </div>
);
