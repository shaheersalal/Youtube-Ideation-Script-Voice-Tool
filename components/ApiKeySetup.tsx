import React, { useState } from 'react';

const LS_KEY = 'gemini_api_key';

interface Props {
  onSave: (key: string) => void;
  onCancel?: () => void; // if provided, renders as a modal overlay
}

export const ApiKeySetup: React.FC<Props> = ({ onSave, onCancel }) => {
  const [key, setKey] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed) { setError('Paste your Gemini API key above.'); return; }
    if (!trimmed.startsWith('AI')) { setError('Gemini keys start with "AI" — double-check yours.'); return; }
    localStorage.setItem(LS_KEY, trimmed);
    onSave(trimmed);
  };

  const card = (
    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[3rem] p-12 space-y-8 shadow-2xl">
      {/* Icon + title */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
          <i className="fas fa-key text-white text-3xl"></i>
        </div>
        <h2 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
          Connect Your Gemini API
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
          This tool calls Google Gemini directly from your browser.
          Your key is stored only in <span className="text-slate-300 font-bold">localStorage</span> — it never touches a server.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            placeholder="AIza..."
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full bg-slate-800/60 border-2 border-slate-700 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all pr-14"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <i className={`fas ${visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
        {error && <p className="text-red-400 text-xs font-bold px-1">{error}</p>}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-bold transition-colors px-1"
        >
          <i className="fas fa-external-link-alt text-[10px]"></i>
          Get a free key at aistudio.google.com
        </a>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <i className="fas fa-bolt"></i>
          {onCancel ? 'Save Key' : 'Start Building'}
        </button>
      </div>
    </div>
  );

  // Full-screen setup mode
  if (!onCancel) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        {card}
      </div>
    );
  }

  // Modal overlay mode (triggered from settings)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-md">
      <div className="relative">
        <button
          onClick={onCancel}
          className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-10"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
        {card}
      </div>
    </div>
  );
};
