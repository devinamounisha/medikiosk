import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Lock, Mail, ArrowRight, ShieldCheck, Wand2 } from 'lucide-react';
import { api } from '../services/api';

export const DoctorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('doctor@medikiosk.in');
  const [password, setPassword] = useState('doctor123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.doctorLogin(email, password);
      navigate('/doctor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    setEmail('doctor@medikiosk.in');
    setPassword('doctor123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white flex flex-col justify-between">
      {/* Top Bar */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-clinical-600 flex items-center justify-center text-white shadow-lg shadow-clinical-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight">MediKiosk</h1>
            <p className="text-xs text-slate-400">Clinical Doctor Gateway</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          &larr; Patient Kiosk
        </button>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-clinical-500/10 border border-clinical-500/30 text-clinical-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Physician Sign In
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized clinical staff access for OPD triage and verification.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Doctor ID / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="doctor@medikiosk.in"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Autofill Demo Quick Action */}
            <button
              type="button"
              onClick={handleAutoFill}
              className="w-full py-2 px-3 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-600 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-clinical-400" />
              <span>Use Demo Credentials (Dr. Arvind Sharma)</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-clinical-600 hover:bg-clinical-500 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-clinical-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to OPD Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-clinical-500" />
        <span>End-to-End Encrypted Doctor Session • MediKiosk SIH 2026</span>
      </div>
    </div>
  );
};
