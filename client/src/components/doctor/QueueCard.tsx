import React from 'react';
import { Clock, AlertCircle, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { PatientCase, TriagePriority, CaseStatus } from '../../types/index';

interface QueueCardProps {
  patientCase: PatientCase;
  onSelect: (patientCase: PatientCase) => void;
  isSelected: boolean;
}

export const QueueCard: React.FC<QueueCardProps> = ({
  patientCase,
  onSelect,
  isSelected
}) => {
  const getPriorityBadge = (priority: TriagePriority) => {
    switch (priority) {
      case 'EMERGENCY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            Emergency
          </span>
        );
      case 'URGENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Urgent Attention
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Routine
          </span>
        );
    }
  };

  const getStatusBadge = (status: CaseStatus) => {
    const config: Record<CaseStatus, { bg: string; label: string }> = {
      NEW: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'New Arrival' },
      IN_PROGRESS: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Intake In Progress' },
      REVIEWED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Summary Ready' },
      VERIFIED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Doctor Verified' },
      CONSULTATION_COMPLETE: { bg: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Consulted' }
    };

    const c = config[status] || config.NEW;
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  // Format relative elapsed time
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - new Date(patientCase.createdAt).getTime()) / 60000));

  return (
    <div
      onClick={() => onSelect(patientCase)}
      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none bg-white relative ${
        isSelected
          ? 'border-clinical-600 ring-2 ring-clinical-500/20 shadow-md bg-clinical-50/20'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-extrabold px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-xs">
            {patientCase.tokenNumber}
          </span>
          <h3 className="font-bold text-base text-slate-900 truncate">
            {patientCase.patient?.fullName || 'Patient Record'}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {patientCase.patient ? `(${patientCase.patient.age}y, ${patientCase.patient.gender[0]})` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getPriorityBadge(patientCase.triagePriority)}
        </div>
      </div>

      {/* Chief Complaint Preview */}
      <div className="mb-3 text-sm text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1.5">Complaint:</span>
        {patientCase.chiefComplaint}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Waiting: {elapsedMinutes}m</span>
          </div>
          {getStatusBadge(patientCase.status)}
        </div>

        <div className="flex items-center gap-1 font-bold text-clinical-700">
          <span>Inspect</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
