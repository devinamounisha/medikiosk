import React from 'react';
import { CheckCircle2, Ticket, Stethoscope, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { Patient, PatientCase } from '../../types/index';

interface ReadyStepProps {
  patient: Patient;
  patientCase: PatientCase;
  onReset: () => void;
  onStartHistoryTaking: () => void;
}

export const ReadyStep: React.FC<ReadyStepProps> = ({
  patient,
  patientCase,
  onReset,
  onStartHistoryTaking
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
        <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
      </div>

      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Patient Intake Registered!
      </h2>
      <p className="text-base text-slate-600 mb-8">
        Your digital case record and OPD token have been established in the hospital queue.
      </p>

      {/* OPD Token Pass Card */}
      <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 text-left relative overflow-hidden">
        {/* Visual Accent Pill */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-clinical-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-700/60 pb-5 mb-5">
          <div>
            <span className="text-xs uppercase tracking-widest text-clinical-400 font-bold block mb-1">
              OPD QUEUE TOKEN
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white flex items-center gap-3">
              <Ticket className="w-8 h-8 text-clinical-400" />
              <span>{patientCase.tokenNumber}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium block">
              Consultation Room
            </span>
            <span className="text-lg sm:text-xl font-bold text-amber-400">
              OPD Room 402
            </span>
          </div>
        </div>

        {/* Patient & Doctor Meta */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Patient Name</span>
            <strong className="text-base text-white block">{patient.fullName}</strong>
            <span className="text-xs text-slate-400">{patient.age} Yrs • {patient.gender}</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Attending Specialist</span>
            <strong className="text-base text-white block flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-clinical-400" />
              <span>Dr. Arvind Sharma</span>
            </strong>
            <span className="text-xs text-slate-400">Internal Medicine</span>
          </div>
        </div>

        {/* Initial Complaint / Triage Priority */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-xs flex items-center justify-between">
          <div className="text-slate-300 truncate max-w-[280px]">
            <span className="text-slate-400">Complaint:</span> {patientCase.chiefComplaint}
          </div>
          <span className="px-2.5 py-1 rounded-full bg-clinical-950/80 border border-clinical-500/40 text-clinical-300 font-bold text-xs uppercase tracking-wider">
            {patientCase.triagePriority} Priority
          </span>
        </div>
      </div>

      {/* Primary Action to Enter Guided History Intake (Phase 2 bridge) */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={onStartHistoryTaking}
          className="w-full touch-target-lg py-4 bg-clinical-600 hover:bg-clinical-700 active:scale-[0.99] text-white font-bold text-lg rounded-2xl shadow-xl shadow-clinical-600/25 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <span>Begin Guided Clinical Interview</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 py-2 px-4 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Patient Registration</span>
        </button>
      </div>

      {/* Phase 2 preview notice */}
      <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200 text-left text-xs text-blue-800 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Phase 1 Complete:</span> Patient registration, consent, and queue tokens are live in the database. Clicking &quot;Begin Guided Clinical Interview&quot; will activate the Groq Adaptive Case-Taking engine in Phase 2.
        </div>
      </div>
    </div>
  );
};
