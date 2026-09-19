import React from 'react';
import { Check } from 'lucide-react';

interface KioskProgressProps {
  currentStep: number;
  totalSteps?: number;
  steps: { title: string; subtitle: string }[];
}

export const KioskProgress: React.FC<KioskProgressProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-clinical-600 -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-sm ${
                  isCompleted 
                    ? 'bg-clinical-600 text-white shadow-clinical-200' 
                    : isCurrent 
                    ? 'bg-white text-clinical-700 border-4 border-clinical-600 ring-4 ring-clinical-100' 
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : stepNum}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-semibold ${isCurrent ? 'text-clinical-900' : 'text-slate-600'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
