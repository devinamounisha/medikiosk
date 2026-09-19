import React from 'react';
import { Globe, ArrowRight, Sparkles } from 'lucide-react';
import { Language } from '../../types/index';

interface LanguageStepProps {
  selectedLanguage: Language;
  onSelect: (lang: Language) => void;
  onContinue: () => void;
}

export const LanguageStep: React.FC<LanguageStepProps> = ({
  selectedLanguage,
  onSelect,
  onContinue
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center">
      {/* Hospital Kiosk Hero Header */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-clinical-50 border border-clinical-200 text-clinical-800 text-sm font-semibold mb-6">
        <Sparkles className="w-4 h-4 text-clinical-600" />
        <span>OPD Self-Service Terminal • High Volume Intake</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Welcome to MediKiosk
      </h1>
      <p className="text-lg text-slate-600 mb-8 max-w-lg">
        Please choose your preferred language to begin your clinical check-in.
        <br />
        <span className="text-slate-500 font-medium">कृपया अपनी पसंदीदा भाषा चुनें</span>
      </p>

      {/* Language Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full mb-10">
        <button
          type="button"
          onClick={() => onSelect('en')}
          className={`p-6 rounded-2xl text-left border-2 transition-all flex flex-col justify-between h-44 cursor-pointer relative overflow-hidden group ${
            selectedLanguage === 'en'
              ? 'border-clinical-600 bg-clinical-50/70 shadow-md ring-2 ring-clinical-500/30'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
              selectedLanguage === 'en' ? 'bg-clinical-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              A
            </div>
            {selectedLanguage === 'en' && (
              <span className="text-xs font-bold uppercase tracking-wider bg-clinical-600 text-white px-2.5 py-1 rounded-full">
                Selected
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">English</h2>
            <p className="text-sm text-slate-500">Standard English Interface</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('hi')}
          className={`p-6 rounded-2xl text-left border-2 transition-all flex flex-col justify-between h-44 cursor-pointer relative overflow-hidden group ${
            selectedLanguage === 'hi'
              ? 'border-clinical-600 bg-clinical-50/70 shadow-md ring-2 ring-clinical-500/30'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
              selectedLanguage === 'hi' ? 'bg-clinical-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              आ
            </div>
            {selectedLanguage === 'hi' && (
              <span className="text-xs font-bold uppercase tracking-wider bg-clinical-600 text-white px-2.5 py-1 rounded-full">
                चयनित
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">हिंदी (Hindi)</h2>
            <p className="text-sm text-slate-500">सहज हिंदी माध्यम</p>
          </div>
        </button>
      </div>

      {/* Large Continue Touch Target */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full sm:w-auto min-w-[280px] touch-target-lg px-8 py-4 bg-clinical-600 hover:bg-clinical-700 active:scale-[0.98] text-white font-bold text-lg rounded-2xl shadow-lg shadow-clinical-600/20 flex items-center justify-center gap-3 transition-all"
      >
        <span>Continue / आगे बढ़ें</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
        <Globe className="w-4 h-4 text-slate-400" />
        <span>Additional regional languages (Tamil, Telugu, Bengali) supported in Phase 5</span>
      </div>
    </div>
  );
};
