import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight, ArrowLeft, Stethoscope, FileText, Lock } from 'lucide-react';

interface ConsentStepProps {
  patientName: string;
  onConsentGiven: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const ConsentStep: React.FC<ConsentStepProps> = ({
  patientName,
  onConsentGiven,
  onBack,
  isSubmitting
}) => {
  const [agreedHistoryIntake, setAgreedHistoryIntake] = useState(true);
  const [agreedDoctorVerification, setAgreedDoctorVerification] = useState(true);
  const [agreedDataPrivacy, setAgreedDataPrivacy] = useState(true);

  const canProceed = agreedHistoryIntake && agreedDoctorVerification && agreedDataPrivacy;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-start mb-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Clinical Consent & Medical Disclaimer
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-lg mx-auto">
          Please review how MediKiosk assists your doctor prior to your consultation.
        </p>
      </div>

      {/* Mandatory Statutory Notice Card */}
      <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 mb-6 text-slate-800">
        <div className="flex items-start gap-3">
          <Stethoscope className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong className="text-amber-900 font-bold block mb-1">
              Important Medical Safety Notice:
            </strong>
            MediKiosk is an <em>AI-assisted clinical intake tool</em> designed to organize your symptom timeline for your attending physician. 
            <span className="font-semibold text-amber-950"> MediKiosk DOES NOT independently diagnose medical conditions, prescribe drugs, or replace a licensed doctor.</span> 
            All clinical findings must and will be reviewed and verified by the attending physician before any prescription is issued.
          </div>
        </div>
      </div>

      {/* Patient Specific Consent Items */}
      <div className="space-y-4 mb-8">
        <label 
          onClick={() => setAgreedHistoryIntake(!agreedHistoryIntake)}
          className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
            agreedHistoryIntake ? 'bg-clinical-50/50 border-clinical-600 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            checked={agreedHistoryIntake}
            onChange={() => {}} // Handled by container
            className="sr-only"
          />
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            agreedHistoryIntake ? 'bg-clinical-600 text-white' : 'border-2 border-slate-300 bg-white'
          }`}>
            {agreedHistoryIntake && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 block">
              1. Consent for Guided Clinical Intake
            </span>
            <span className="text-xs sm:text-sm text-slate-500 mt-0.5 block">
              I agree to answer questions regarding my current health complaint, symptom timeline, and medical history.
            </span>
          </div>
        </label>

        <label 
          onClick={() => setAgreedDoctorVerification(!agreedDoctorVerification)}
          className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
            agreedDoctorVerification ? 'bg-clinical-50/50 border-clinical-600 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            checked={agreedDoctorVerification}
            onChange={() => {}}
            className="sr-only"
          />
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            agreedDoctorVerification ? 'bg-clinical-600 text-white' : 'border-2 border-slate-300 bg-white'
          }`}>
            {agreedDoctorVerification && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 block">
              2. Attending Doctor Verification
            </span>
            <span className="text-xs sm:text-sm text-slate-500 mt-0.5 block">
              I understand that the attending physician retains full clinical authority and will inspect, amend, or approve all recorded entries.
            </span>
          </div>
        </label>

        <label 
          onClick={() => setAgreedDataPrivacy(!agreedDataPrivacy)}
          className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
            agreedDataPrivacy ? 'bg-clinical-50/50 border-clinical-600 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            checked={agreedDataPrivacy}
            onChange={() => {}}
            className="sr-only"
          />
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            agreedDataPrivacy ? 'bg-clinical-600 text-white' : 'border-2 border-slate-300 bg-white'
          }`}>
            {agreedDataPrivacy && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 block">
              3. OPD Record Confidentiality
            </span>
            <span className="text-xs sm:text-sm text-slate-500 mt-0.5 block">
              My intake responses will only be visible to hospital clinical personnel assigned to my token number.
            </span>
          </div>
        </label>
      </div>

      {/* Confirmation Sign-off */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          disabled={!canProceed || isSubmitting}
          onClick={onConsentGiven}
          className={`w-full touch-target-lg py-4 font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
            canProceed && !isSubmitting
              ? 'bg-clinical-600 hover:bg-clinical-700 text-white shadow-clinical-600/20 active:scale-[0.99]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Registering Consent...</span>
            </div>
          ) : (
            <>
              <span>I Understand & Give Clinical Consent</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>Digital consent timestamp recorded under Token ID • Patient: {patientName}</span>
        </p>
      </div>
    </div>
  );
};
