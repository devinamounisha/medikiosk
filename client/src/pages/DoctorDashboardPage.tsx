import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorNav } from '../components/doctor/DoctorNav';
import { QueueCard } from '../components/doctor/QueueCard';
import { CaseDrawer } from '../components/doctor/CaseDrawer';
import { PatientCase, DoctorUser } from '../types/index';
import { api } from '../services/api';
import { Users, AlertCircle, Clock, CheckCircle, RefreshCw, Filter, Search, Stethoscope } from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorUser>({
    id: '11111111-1111-1111-1111-111111111111',
    email: 'doctor@medikiosk.in',
    role: 'DOCTOR',
    fullName: 'Dr. Arvind Sharma',
    department: 'General Medicine',
    roomNumber: 'OPD Room 402'
  });

  const [queue, setQueue] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const cases = await api.getQueue(activeFilter);
      setQueue(cases);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeFilter]);

  const handleLogout = () => {
    api.logoutDoctor();
    navigate('/doctor/login');
  };

  // Filter by search query
  const filteredQueue = queue.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.tokenNumber.toLowerCase().includes(q) ||
      (c.patient?.fullName && c.patient.fullName.toLowerCase().includes(q)) ||
      c.chiefComplaint.toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalCount = queue.length;
  const urgentCount = queue.filter(c => c.triagePriority === 'URGENT' || c.triagePriority === 'EMERGENCY').length;
  const inProgressCount = queue.filter(c => c.status === 'IN_PROGRESS').length;
  const verifiedCount = queue.filter(c => c.status === 'VERIFIED' || c.status === 'CONSULTATION_COMPLETE').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Doctor Top Navigation */}
      <DoctorNav
        doctor={doctor}
        onLogout={handleLogout}
        onSwitchToKiosk={() => navigate('/')}
      />

      {/* Main OPD Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Total OPD Queue</span>
              <strong className="text-2xl font-black text-slate-900">{totalCount}</strong>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Urgent Flags</span>
              <strong className="text-2xl font-black text-amber-600">{urgentCount}</strong>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Intake Active</span>
              <strong className="text-2xl font-black text-indigo-600">{inProgressCount}</strong>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Doctor Verified</span>
              <strong className="text-2xl font-black text-emerald-600">{verifiedCount}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls & Queue Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['ALL', 'NEW', 'IN_PROGRESS', 'REVIEWED', 'VERIFIED'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-clinical-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search token, name, complaint..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:border-clinical-600 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={fetchQueue}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-clinical-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Patient Queue List */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Live Patient Queue ({filteredQueue.length})
            </h2>
            <span className="text-xs text-slate-400">Auto-synced with Kiosk Terminal 1</span>
          </div>

          {loading && queue.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-clinical-600" />
              <span>Loading OPD live queue...</span>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Stethoscope className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-700">No patients currently in this queue view</p>
              <p className="text-xs text-slate-500 mt-1">
                New intake cases registered at the Patient Kiosk will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQueue.map(c => (
                <QueueCard
                  key={c.id}
                  patientCase={c}
                  isSelected={selectedCase?.id === c.id}
                  onSelect={c => setSelectedCase(c)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Slide-over Inspection Drawer */}
      <CaseDrawer
        patientCase={selectedCase}
        onClose={() => setSelectedCase(null)}
        onStatusChange={(caseId, newStatus) => {
          setQueue(prev => prev.map(c => c.id === caseId ? { ...c, status: newStatus as any } : c));
          if (selectedCase && selectedCase.id === caseId) {
            setSelectedCase({ ...selectedCase, status: newStatus as any });
          }
        }}
      />
    </div>
  );
};
