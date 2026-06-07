
import React, { useState, useRef } from 'react';
import { Step, AppState, VideoIdea, ScriptOption, VoiceOption } from './types';
import { StepIndicator } from './components/StepIndicator';
import * as aiService from './services/gemini';

const MALE_VOICES: VoiceOption[] = [
  { id: '1', name: 'Charon', gender: 'male', voiceName: 'Charon' },
  { id: '2', name: 'Fenrir', gender: 'male', voiceName: 'Fenrir' },
  { id: '3', name: 'Kore',   gender: 'male', voiceName: 'Kore' },
  { id: '4', name: 'Puck',   gender: 'male', voiceName: 'Puck' },
  { id: '5', name: 'Zephyr', gender: 'male', voiceName: 'Zephyr' },
];

const FEMALE_VOICES: VoiceOption[] = [
  { id: 'f1', name: 'Aria', gender: 'female', voiceName: 'Kore' },
  { id: 'f2', name: 'Luna', gender: 'female', voiceName: 'Puck' },
  { id: 'f3', name: 'Nova', gender: 'female', voiceName: 'Zephyr' },
  { id: 'f4', name: 'Lyra', gender: 'female', voiceName: 'Charon' },
  { id: 'f5', name: 'Iris', gender: 'female', voiceName: 'Fenrir' },
];

// Audio decoding utilities as per @google/genai guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentStep: Step.DOMAIN_INPUT,
    domain: '',
    ideas: [],
    scripts: [],
    voiceGender: 'male',
    voices: [],
    seoKeywords: []
  });

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  const LAST_STEP = Step.FINAL_SUMMARY;
  const handleNext = () => setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, LAST_STEP) as Step }));
  const handlePrev = () => setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, Step.DOMAIN_INPUT) as Step }));

  const generateIdeas = async () => {
    if (!state.domain) return;
    setLoading(true);
    setLoadingMsg(`Analyzing ${state.domain} domain for viral opportunities...`);
    try {
      const ideas = await aiService.generateIdeas(state.domain);
      setState(prev => ({ ...prev, ideas, currentStep: Step.IDEAS }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectIdea = async (idea: VideoIdea) => {
    setLoading(true);
    setLoadingMsg('Crafting 5 unique script variations...');
    try {
      const scripts = await aiService.generateScripts(idea);
      setState(prev => ({ ...prev, selectedIdea: idea, scripts, currentStep: Step.SCRIPTS }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectScript = (script: ScriptOption) => {
    const voiceOptions = state.voiceGender === 'male' ? MALE_VOICES : FEMALE_VOICES;
    setState(prev => ({
      ...prev,
      selectedScript: script,
      voices: voiceOptions,
      currentStep: Step.VOICE_SELECTION,
    }));
  };

  const playVoice = async (voice: VoiceOption, fullScript: boolean = false) => {
    setLoading(true);
    const text = fullScript ? (state.selectedScript?.content.substring(0, 300) + "...") : "Hello, I am ready to narrate your content.";
    setLoadingMsg(fullScript ? 'Synthesizing script preview...' : `Auditioning ${voice.name}...`);
    try {
      const base64 = await aiService.generateVoiceAudio(text, voice.voiceName);
      const ctx = getAudioContext();
      const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      setState(prev => ({ ...prev, selectedVoice: voice }));
    } catch (err: any) {
      setError("Audio playback failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const finalizeProject = async () => {
    if (!state.selectedVoice) return;
    setLoading(true);
    setLoadingMsg('Extracting viral SEO keywords...');
    try {
      const keywords = await aiService.generateKeywords(state.domain, state.selectedIdea?.title || "");
      setState(prev => ({ 
        ...prev, 
        seoKeywords: keywords,
        currentStep: Step.FINAL_SUMMARY 
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-pulse">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-magic text-blue-400"></i>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-200 tracking-tight">{loadingMsg}</p>
        </div>
      );
    }

    switch (state.currentStep) {
      case Step.DOMAIN_INPUT:
        return (
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
                value={state.domain}
                onChange={(e) => setState(prev => ({ ...prev, domain: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && generateIdeas()}
              />
              <button 
                onClick={generateIdeas}
                disabled={!state.domain}
                className="absolute right-4 top-4 bottom-4 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                Start Ideation
              </button>
            </div>
          </div>
        );

      case Step.IDEAS:
        return (
          <div className="space-y-10 animate-fadeIn">
            <h2 className="text-3xl font-black text-center">Viral Concepts for <span className="text-blue-500">#{state.domain}</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {state.ideas.map((idea) => (
                <div 
                  key={idea.id}
                  onClick={() => selectIdea(idea)}
                  className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-blue-500 p-8 rounded-[2.5rem] transition-all hover:-translate-y-2 hover:shadow-3xl hover:shadow-blue-500/10 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-arrow-right text-3xl"></i>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-blue-500/10 text-blue-400 text-xs font-black px-4 py-2 rounded-full border border-blue-500/20">
                      {idea.estimatedViews} VIEWS EST.
                    </span>
                    <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-lg">
                      <i className="fas fa-fire-alt"></i>
                      <span className="font-black text-sm">{idea.viralPotential}%</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{idea.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{idea.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case Step.SCRIPTS:
        return (
          <div className="space-y-10 animate-fadeIn max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-center">Review Your Scripts</h2>
            <div className="space-y-6">
              {state.scripts.map((script) => (
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
                         onClick={() => setState(prev => ({ ...prev, voiceGender: 'male' }))}
                         className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${state.voiceGender === 'male' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                       >MALE</button>
                       <button 
                         onClick={() => setState(prev => ({ ...prev, voiceGender: 'female' }))}
                         className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${state.voiceGender === 'female' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                       >FEMALE</button>
                    </div>
                    <button 
                      onClick={() => selectScript(script)}
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

      case Step.VOICE_SELECTION:
        return (
          <div className="space-y-10 animate-fadeIn max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black">Audition AI Narrators</h2>
              <p className="text-slate-500">Listen to the tones and pick your final narrator.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.voices.map((voice) => (
                <div 
                  key={voice.id}
                  onClick={() => setState(prev => ({ ...prev, selectedVoice: voice }))}
                  className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col gap-6 ${
                    state.selectedVoice?.id === voice.id ? 'bg-blue-600/5 border-blue-500 shadow-2xl' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
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
                      onClick={(e) => { e.stopPropagation(); playVoice(voice); }}
                      className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-lg transition-all"
                      title="Quick Sample"
                    >
                      <i className="fas fa-play ml-1"></i>
                    </button>
                  </div>
                  
                  {state.selectedVoice?.id === voice.id && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); playVoice(voice, true); }}
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
                 disabled={!state.selectedVoice}
                 onClick={finalizeProject}
                 className="px-16 py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
               >
                 FINALIZE CONTENT
               </button>
            </div>
          </div>
        );

      case Step.FINAL_SUMMARY:
        return (
          <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black tracking-tighter">Project Finalized!</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">Your ideation is complete. Here is your content roadmap and SEO kit.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                    <div>
                      <h3 className="text-2xl font-black uppercase text-blue-500 tracking-tighter">Project: {state.selectedIdea?.title}</h3>
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Domain: {state.domain}</p>
                    </div>
                    <div className="bg-slate-800 px-6 py-3 rounded-2xl text-center">
                       <p className="text-[10px] font-black text-slate-500 uppercase">Selected Voice</p>
                       <p className="text-lg font-black">{state.selectedVoice?.name}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xl font-bold flex items-center gap-3"><i className="fas fa-file-signature text-blue-400"></i> Final Script</h4>
                    <div className="p-8 bg-black/40 rounded-3xl border border-slate-800 text-slate-300 font-medium leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                      {state.selectedScript?.content}
                    </div>
                    <div className="flex justify-end">
                       <button 
                         onClick={() => {
                           const blob = new Blob([state.selectedScript?.content || ""], {type: 'text/plain'});
                           const url = URL.createObjectURL(blob);
                           const a = document.createElement('a');
                           a.href = url;
                           a.download = `${state.selectedIdea?.title}_Script.txt`;
                           a.click();
                         }}
                         className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
                       >
                         <i className="fas fa-download"></i> Save Script as .txt
                       </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-xl">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-blue-400">
                    <i className="fas fa-rocket"></i> SEO Launch Kit
                  </h3>
                  
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">RECOMMENDED KEYWORDS</h4>
                      <div className="flex flex-wrap gap-2">
                        {state.seoKeywords.map((kw, i) => (
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
                             <p className="text-xl font-black text-blue-400">{state.selectedIdea?.estimatedViews}</p>
                          </div>
                          <div className="bg-black/40 p-4 rounded-2xl border border-slate-800">
                             <p className="text-xs font-bold text-slate-500 uppercase">Viral %</p>
                             <p className="text-xl font-black text-orange-400">{state.selectedIdea?.viralPotential}%</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/10 p-10 rounded-[3rem] border border-blue-500/10">
                   <h3 className="font-black text-xl mb-4">Next Steps</h3>
                   <ul className="space-y-4 text-xs font-medium text-slate-400">
                      <li className="flex gap-3"><i className="fas fa-microphone-alt text-blue-400 mt-0.5"></i> Export script to your favorite editor.</li>
                      <li className="flex gap-3"><i className="fas fa-hashtag text-blue-400 mt-0.5"></i> Copy keywords into YouTube tags.</li>
                      <li className="flex gap-3"><i className="fas fa-lightbulb text-blue-400 mt-0.5"></i> Start filming based on the narrative.</li>
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-100 selection:bg-blue-500 selection:text-white">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-5 group cursor-default">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-3xl shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
              <i className="fas fa-brain text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter leading-none uppercase">CONTENT IDEATION <span className="text-blue-500">TOOL</span></h1>
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mt-2">Professional Scripting Suite</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-8">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-600 tracking-widest uppercase">ENGINE STATUS</p>
                <p className="text-xs font-bold text-blue-400">Gemini 3.0 Flash Ready</p>
             </div>
             <div className="h-10 w-[1px] bg-slate-800"></div>
             <button className="w-12 h-12 rounded-2xl border border-slate-800 flex items-center justify-center hover:bg-slate-900 transition-all group">
               <i className="fas fa-shield-alt text-slate-600 group-hover:text-blue-400"></i>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 mt-16">
        <StepIndicator currentStep={state.currentStep} />
        
        {error && (
          <div className="max-w-3xl mx-auto mb-12 bg-red-950/30 border-2 border-red-500/20 p-6 rounded-3xl text-red-400 flex items-center gap-5 animate-shake">
            <i className="fas fa-bolt text-2xl"></i>
            <div className="flex-1 text-sm font-bold tracking-tight">{error}</div>
            <button onClick={() => setError(null)} className="opacity-40 hover:opacity-100"><i className="fas fa-times"></i></button>
          </div>
        )}

        <div className="mt-8">
          {renderContent()}
        </div>
      </main>

      {state.currentStep !== Step.DOMAIN_INPUT && state.currentStep !== Step.FINAL_SUMMARY && !loading && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 px-10 py-5 bg-slate-900/80 backdrop-blur-3xl border border-white/5 rounded-full shadow-4xl z-40">
           <button 
             onClick={handlePrev}
             className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-all active:scale-90"
           >
             <i className="fas fa-chevron-left"></i>
           </button>
           <div className="flex flex-col items-center min-w-[100px]">
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">PROGRESS</span>
             <span className="text-xl font-black text-white">{state.currentStep + 1} <span className="text-slate-700">/ 5</span></span>
           </div>
           <button 
             onClick={handleNext}
             disabled={state.currentStep === Step.VOICE_SELECTION && !state.selectedVoice}
             className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 transition-all active:scale-90 shadow-2xl shadow-blue-500/30"
           >
             <i className="fas fa-chevron-right"></i>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;
