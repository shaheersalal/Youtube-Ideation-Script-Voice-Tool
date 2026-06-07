import React from 'react';

interface Props {
  domain: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export const DomainInputStep: React.FC<Props> = ({ domain, onChange, onSubmit }) => (
  <div className="max-w-2xl mx-auto space-y-10 animate-fadeIn pt-10">
    <div className="text-center space-y-3">
      <h2 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-500">
        Define Your Domain
      </h2>
      <p className="text-slate-500 text-lg">Target your industry for precise content ideation.</p>
    </div>
    <div className="relative">
      <input
        type="text"
        placeholder="e.g. Finance, Sustainable Energy, Retro Gaming"
        className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl px-8 py-6 text-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xl"
        value={domain}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
      />
      <button
        onClick={onSubmit}
        disabled={!domain}
        className="absolute right-4 top-4 bottom-4 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95"
      >
        Start Ideation
      </button>
    </div>
  </div>
);
