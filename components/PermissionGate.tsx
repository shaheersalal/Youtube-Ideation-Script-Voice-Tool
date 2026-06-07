import React from "react";
import { CostEstimate, formatUsd } from "../services/costEstimator";

interface PermissionGateProps {
  isOpen: boolean;
  stepTitle: string;
  stepDescription: string;
  estimate: CostEstimate;
  onConfirm: () => void;
  onBack: () => void;
}

const STEP_ICONS: Record<string, string> = {
  ideas:         "fa-lightbulb",
  scripts:       "fa-file-alt",
  voice_preview: "fa-headphones",
  full_audio:    "fa-headphones",
  scene_images:  "fa-images",
  keywords:      "fa-hashtag",
};

export const PermissionGate: React.FC<PermissionGateProps> = ({
  isOpen,
  stepTitle,
  stepDescription,
  estimate,
  onConfirm,
  onBack,
}) => {
  if (!isOpen) return null;

  const icon = STEP_ICONS[stepTitle.toLowerCase().replace(/\s/g, "_")] ?? "fa-bolt";
  const costDisplay = formatUsd(estimate.usd);
  const isMicro = estimate.usd < 0.001;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-black/60 overflow-hidden">

        {/* Header accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

        <div className="p-10 space-y-8">
          {/* Icon + title */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <i className={`fas ${icon} text-blue-400 text-xl`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">API CALL REQUIRED</p>
              <h3 className="text-2xl font-black text-slate-100 tracking-tight">{stepTitle}</h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-sm leading-relaxed">{stepDescription}</p>

          {/* Cost card */}
          <div className="bg-black/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">ESTIMATED COST</p>

            <div className="flex items-end justify-between">
              <div>
                <span
                  className={`text-4xl font-black tracking-tighter ${
                    isMicro ? "text-slate-400" : "text-blue-400"
                  }`}
                >
                  {costDisplay}
                </span>
                {isMicro && (
                  <span className="ml-2 text-xs font-bold text-slate-600">fractional cent</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500">
                  {estimate.quantity.toLocaleString()} {estimate.unit}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 font-mono border-t border-slate-800/60 pt-3">
              {estimate.label}
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-slate-700 leading-relaxed">
            This is an estimate based on typical inputs. Your Gemini API account will be charged
            at current Google AI pricing. No charge if you go back.
          </p>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={onBack}
              className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 font-black text-sm hover:bg-slate-800 hover:text-slate-200 transition-all active:scale-95"
            >
              GO BACK
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
            >
              <i className="fas fa-bolt text-xs"></i>
              CONFIRM &amp; RUN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
