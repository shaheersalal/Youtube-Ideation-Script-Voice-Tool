import React, { useState } from 'react';
import { ScriptOption } from '../../types';

interface Props {
  scripts: ScriptOption[];
  voiceGender: 'male' | 'female';
  onVoiceGenderChange: (g: 'male' | 'female') => void;
  onSelectScript: (script: ScriptOption) => void;
}

export const ScriptsStep: React.FC<Props> = ({ scripts, voiceGender, onVoiceGenderChange, onSelectScript }) => {
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);

  return (
    <div className="space-y-10 animate-fadeIn max-w-5xl mx-auto">
      <h2 className="text-3xl font-black text-center">Review Your Scripts</h2>
      <div className="space-y-6">
        {scripts.map((script) => (
          <div
            key={script.id}
            className={`bg-slate-900 border-2 transition-all p-8 rounded-[2rem] ${activeScriptId === script.id ? 'border-blue-500' : 'border-slate-800'}`}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">{script.title}</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveScriptId(activeScriptId === script.id ? null : script.id)}
                  className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  {activeScriptId === script.id ? 'CLOSE SCRIPT' : 'READ FULL SCRIPT'}
                </button>
                <span className="text-slate-500 text-sm flex items-center bg-slate-800 px-4 py-2 rounded-xl">
                  <i className="far fa-clock mr-2"></i>{script.duration}
                </span>
              </div>
            </div>

            {activeScriptId === script.id && (
              <div className="mt-8 p-8 bg-black/40 rounded-2xl border border-slate-800 text-slate-300 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                {script.content}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-6 mt-8 pt-8 border-t border-slate-800/50">
              <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl">
                <button
                  onClick={() => onVoiceGenderChange('male')}
                  className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${voiceGender === 'male' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >MALE</button>
                <button
                  onClick={() => onVoiceGenderChange('female')}
                  className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${voiceGender === 'female' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >FEMALE</button>
              </div>
              <button
                onClick={() => onSelectScript(script)}
                className="px-10 py-4 bg-blue-600 rounded-2xl hover:bg-blue-500 font-black tracking-tight transition-all active:scale-95 shadow-xl shadow-blue-500/10"
              >
                SELECT THIS SCRIPT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
