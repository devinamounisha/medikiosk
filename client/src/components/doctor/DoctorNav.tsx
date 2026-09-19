import React from 'react';
import { Stethoscope, LogOut, ExternalLink, ShieldAlert, Activity } from 'lucide-react';
import { DoctorUser } from '../../types/index';

interface DoctorNavProps {
  doctor: DoctorUser;
  onLogout: () => void;
  onSwitchToKiosk: () => void;
}

export const DoctorNav: React.FC<DoctorNavProps> = ({
  doctor,
  onLogout,
  onSwitchToKiosk
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Room Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-clinical-600 flex items-center justify-center text-white shadow-md shadow-clinical-600/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">MediKiosk</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-clinical-500/20 text-clinical-300 border border-clinical-500/30 px-1.5 py-0.5 rounded">
                  Clinical Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{doctor.roomNumber || 'OPD Room 402'} • {doctor.department || 'General Medicine'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Doctor Profile & Action Controls */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Switch to Patient Kiosk (Convenient quick-toggle for demo presentations) */}
          <button
            type="button"
            onClick={onSwitchToKiosk}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Open Patient Self-Service Kiosk"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Patient Kiosk</span>
          </button>

          {/* Doctor Badge */}
          <div className="hidden md:flex items-center gap-2.5 border-l border-slate-800 pl-4">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-200 block">{doctor.fullName}</span>
              <span className="text-[11px] text-slate-400">Senior Physician</span>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign out of Doctor Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
