
import React from 'react';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
}

const steps = [
  { label: 'Domain', icon: 'fa-search' },
  { label: 'Ideas', icon: 'fa-lightbulb' },
  { label: 'Scripts', icon: 'fa-file-alt' },
  { label: 'Voice', icon: 'fa-microphone' },
  { label: 'Finish', icon: 'fa-check-double' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex justify-between items-center w-full max-w-3xl mx-auto mb-12 px-4">
      {steps.map((step, index) => {
        const isActive = index <= currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isCurrent ? 'bg-blue-600 border-blue-400 scale-110 shadow-lg shadow-blue-500/50' :
                isActive ? 'bg-slate-700 border-blue-500 text-blue-400' : 
                'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                <i className={`fas ${step.icon} text-sm`}></i>
              </div>
              <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${
                isActive ? 'text-blue-400' : 'text-slate-600'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-2 -mt-6 transition-colors duration-300 ${
                index < currentStep ? 'bg-blue-500' : 'bg-slate-800'
              }`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
