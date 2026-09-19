import React, { useState } from 'react';
import { User, Phone, CreditCard, ArrowRight, ArrowLeft, Wand2, ShieldCheck } from 'lucide-react';
import { Gender } from '../../types/index';

interface PatientIdData {
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  abhaId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface PatientIdStepProps {
  initialData: PatientIdData;
  onSubmit: (data: PatientIdData) => void;
  onBack: () => void;
}

export const PatientIdStep: React.FC<PatientIdStepProps> = ({
  initialData,
  onSubmit,
  onBack
}) => {
  const [formData, setFormData] = useState<PatientIdData>(initialData);
  const [error, setError] = useState<string | null>(null);

  const handleGenderSelect = (gender: Gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const handleAutofillDemo = () => {
    setFormData({
      fullName: 'Ramesh Kumar',
      age: 54,
      gender: 'MALE',
      phone: '9123456780',
      abhaId: '91-4820-1948-2831',
      emergencyContactName: 'Suresh Kumar',
      emergencyContactPhone: '9876501234'
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.age || formData.age < 1 || formData.age > 120) {
      setError('Please enter a valid age between 1 and 120.');
      return;
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError(null);
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleAutofillDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Demo Autofill</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Patient Identification
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Enter your details or ABHA number to connect your OPD intake record.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Full Name / पूरा नाम <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-base text-slate-900 focus:border-clinical-600 focus:ring-4 focus:ring-clinical-100 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Age and Gender Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Age */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Age (Years) / उम्र <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={120}
              required
              value={formData.age || ''}
              onChange={e => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })}
              placeholder="e.g. 54"
              className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-base text-slate-900 focus:border-clinical-600 focus:ring-4 focus:ring-clinical-100 outline-none transition-all"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Gender / लिंग <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenderSelect(g)}
                  className={`py-3.5 px-2 rounded-xl text-xs font-bold border-2 uppercase tracking-wider transition-all cursor-pointer ${
                    formData.gender === g
                      ? 'bg-clinical-600 text-white border-clinical-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Number & ABHA ID Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Mobile Number / मोबाइल <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit number"
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-base text-slate-900 focus:border-clinical-600 focus:ring-4 focus:ring-clinical-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* ABHA ID */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">
                ABHA ID (Ayushman Bharat)
              </label>
              <span className="text-xs text-slate-500 font-medium">Optional</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={formData.abhaId || ''}
                onChange={e => setFormData({ ...formData, abhaId: e.target.value })}
                placeholder="e.g. 91-4820-1948-2831"
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-base text-slate-900 focus:border-clinical-600 focus:ring-4 focus:ring-clinical-100 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Security & Verification Banner */}
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-clinical-600 flex-shrink-0" />
          <span>Your demographic details are safeguarded under DPDP guidelines and linked directly to your OPD consultation room.</span>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full touch-target-lg py-4 bg-clinical-600 hover:bg-clinical-700 active:scale-[0.98] text-white font-bold text-lg rounded-xl shadow-md shadow-clinical-600/20 flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <span>Confirm & Proceed to Consent</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
