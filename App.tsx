import React, { useState } from 'react';
import { Step } from './types';
import { StepIndicator } from './components/StepIndicator';
import { PermissionGate } from './components/PermissionGate';
import { ApiKeySetup } from './components/ApiKeySetup';
import { useAppHandlers } from './hooks/useAppHandlers';
import { DomainInputStep }    from './components/steps/DomainInputStep';
import { IdeasStep }          from './components/steps/IdeasStep';
import { ScriptsStep }        from './components/steps/ScriptsStep';
import { VoiceSelectionStep } from './components/steps/VoiceSelectionStep';
import { FullAudioStep }      from './components/steps/FullAudioStep';
import { VideoThemeStep }     from './components/steps/VideoThemeStep';
import { VideoGenerationStep } from './components/steps/VideoGenerationStep';
import { FinalSummaryStep }   from './components/steps/FinalSummaryStep';

const LS_KEY = 'gemini_api_key';

const App: React.FC = () => {
  const [apiKeySet, setApiKeySet] = useState<boolean>(() =>
    !!(localStorage.getItem(LS_KEY) || process.env.API_KEY)
  );
  const [showKeyEdit, setShowKeyEdit] = useState(false);

  const {
    state, setState, loading, loadingMsg, error, setError,
    pendingGate, setPendingGate, confirmGate,
    handleNext, handlePrev,
    requestIdeas, requestScripts, selectScript, playVoice,
    requestAudioGeneration, requestStoryboard, requestFinalize,
  } = useAppHandlers();

  if (!apiKeySet) {
    return <ApiKeySetup onSave={() => setApiKeySet(true)} />;
  }

  const renderContent = () => {
    if (loading) return (
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

    switch (state.currentStep) {
      case Step.DOMAIN_INPUT:    return <DomainInputStep domain={state.domain} onChange={(d) => setState(p => ({ ...p, domain: d }))} onSubmit={requestIdeas} />;
      case Step.IDEAS:           return <IdeasStep domain={state.domain} ideas={state.ideas} onSelectIdea={requestScripts} />;
      case Step.SCRIPTS:         return <ScriptsStep scripts={state.scripts} voiceGender={state.voiceGender} onVoiceGenderChange={(g) => setState(p => ({ ...p, voiceGender: g }))} onSelectScript={selectScript} />;
      case Step.VOICE_SELECTION: return <VoiceSelectionStep voices={state.voices} selectedVoice={state.selectedVoice} onSelectVoice={(v) => setState(p => ({ ...p, selectedVoice: v }))} onPlayVoice={playVoice} onGenerateAudio={requestAudioGeneration} />;
      case Step.FULL_AUDIO:      return <FullAudioStep audioOutput={state.audioOutput} selectedVoice={state.selectedVoice} selectedIdea={state.selectedIdea} onGenerateSEO={requestFinalize} />;
      case Step.VIDEO_THEME:     return <VideoThemeStep videoTheme={state.videoTheme!} onChange={(t) => setState(p => ({ ...p, videoTheme: t }))} onGenerateStoryboard={requestStoryboard} />;
      case Step.VIDEO_GENERATION: return <VideoGenerationStep sceneImages={state.sceneImages} videoTheme={state.videoTheme} onGenerateSEO={requestFinalize} onBack={handlePrev} />;
      case Step.FINAL_SUMMARY:   return <FinalSummaryStep domain={state.domain} selectedIdea={state.selectedIdea} selectedVoice={state.selectedVoice} selectedScript={state.selectedScript} seoKeywords={state.seoKeywords} audioOutput={state.audioOutput} sceneImages={state.sceneImages} videoTheme={state.videoTheme} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-100 selection:bg-blue-500 selection:text-white">
      {pendingGate && (
        <PermissionGate isOpen={true} stepTitle={pendingGate.title} stepDescription={pendingGate.description}
          estimate={pendingGate.estimate} onConfirm={confirmGate} onBack={() => setPendingGate(null)} />
      )}
      {showKeyEdit && (
        <ApiKeySetup onSave={() => setShowKeyEdit(false)} onCancel={() => setShowKeyEdit(false)} />
      )}

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
              <p className="text-xs font-bold text-blue-400">Gemini 2.5 Flash Ready</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-800"></div>
            <button
              onClick={() => setShowKeyEdit(true)}
              title="Edit API Key"
              className="w-12 h-12 rounded-2xl border border-slate-800 flex items-center justify-center hover:bg-slate-900 transition-all group"
            >
              <i className="fas fa-key text-slate-600 group-hover:text-blue-400"></i>
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
        <div className="mt-8">{renderContent()}</div>
      </main>

      {state.currentStep !== Step.DOMAIN_INPUT && state.currentStep !== Step.FINAL_SUMMARY && !loading && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 px-10 py-5 bg-slate-900/80 backdrop-blur-3xl border border-white/5 rounded-full shadow-4xl z-40">
          <button onClick={handlePrev} className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-all active:scale-90">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">PROGRESS</span>
            <span className="text-xl font-black text-white">{state.currentStep + 1} <span className="text-slate-700">/ 8</span></span>
          </div>
          <button
            onClick={handleNext}
            disabled={
              (state.currentStep === Step.VOICE_SELECTION && !state.selectedVoice) ||
              (state.currentStep === Step.FULL_AUDIO && !state.audioOutput) ||
              (state.currentStep === Step.VIDEO_GENERATION && !state.sceneImages)
            }
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
