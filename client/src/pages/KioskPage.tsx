
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { KioskProgress } from '../components/kiosk/KioskProgress';
import { LanguageStep } from '../components/kiosk/LanguageStep';
import { PatientIdStep } from '../components/kiosk/PatientIdStep';
import { ConsentStep } from '../components/kiosk/ConsentStep';
import { ClinicalInterview } from '../components/kiosk/ClinicalInterview';

import {
  Language,
  Gender,
  Patient,
  PatientCase
} from '../types/index';

import { api } from '../services/api';

import {
  Stethoscope,
  ShieldCheck
} from 'lucide-react';

const KioskPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);

  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>('en');

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [patientData, setPatientData] = useState<{
    fullName: string;
    age: number;
    gender: Gender;
    phone: string;
    abhaId?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  }>({
    fullName: '',
    age: 0,
    gender: 'MALE',
    phone: '',
    abhaId: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [createdPatient, setCreatedPatient] =
    useState<Patient | null>(null);

  const [createdCase, setCreatedCase] =
    useState<PatientCase | null>(null);

  const [interviewStarted, setInterviewStarted] =
    useState<boolean>(false);

  const steps = [
    {
      title: 'Language',
      subtitle: 'भाषा चयन'
    },
    {
      title: 'Identification',
      subtitle: 'रोगी पहचान'
    },
    {
      title: 'Consent',
      subtitle: 'सहमति पत्र'
    },
    {
      title: 'Intake Ready',
      subtitle: 'प्रवेश तैयार'
    }
  ];

  const handlePatientIdSubmit = (
    data: typeof patientData
  ) => {
    setPatientData(data);
    setCurrentStep(3);
  };

  const handleConsentGiven = async () => {
    setIsSubmitting(true);

    try {
      // Identify or create patient
      const patient = await api.identifyPatient({
        ...patientData,
        preferredLanguage: selectedLanguage
      });

      setCreatedPatient(patient);

      // Record statutory consent
      await api.recordConsent({
        patientId: patient.id,
        agreed: true,
        consentType: 'AI_ASSISTED_HISTORY_COLLECTION',
        ipOrKioskId: 'KIOSK_OPD_01'
      });

      // Create patient case
      const patientCase = await api.createCase({
        patientId: patient.id,
        chiefComplaint:
          'Severe epigastric abdominal pain radiating to back for 2 days',
        triagePriority: 'URGENT'
      });

      setCreatedCase(patientCase);

      // Move to Step 4
      setCurrentStep(4);
    } catch (err: any) {
      const errorMessage =
        err && err.message
          ? err.message
          : 'Check server connection';

      alert(
        'Error initializing patient record: ' +
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);

    setCreatedPatient(null);
    setCreatedCase(null);
    setInterviewStarted(false);

    setPatientData({
      fullName: '',
      age: 0,
      gender: 'MALE',
      phone: '',
      abhaId: '',
      emergencyContactName: '',
      emergencyContactPhone: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/70 flex flex-col justify-between">

      {/* ==================== KIOSK HEADER ==================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-clinical-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-clinical-600/20">
              <Stethoscope className="w-5 h-5" />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  MediKiosk
                </span>

                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-clinical-100 text-clinical-800 border border-clinical-200">
                  OPD Terminal 1
                </span>

              </div>

              <p className="text-xs text-slate-500">
                Department of Outpatient Care • High-Volume Triage
              </p>

            </div>

          </div>

          {/* Doctor Portal Button */}
          <button
            type="button"
            onClick={() => navigate('/doctor/dashboard')}
            className="text-xs font-bold text-slate-600 hover:text-clinical-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-clinical-300 bg-white hover:bg-clinical-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>
              Doctor Portal &rarr;
            </span>
          </button>

        </div>

      </header>

      {/* ==================== PROGRESS TRACKER ==================== */}
      <div className="pt-4">

        <KioskProgress
          currentStep={currentStep}
          steps={steps}
        />

      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">

        <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-10 transition-all">

          {/* ==================== STEP 1 ==================== */}

          {currentStep === 1 ? (

            <LanguageStep
              selectedLanguage={selectedLanguage}
              onSelect={setSelectedLanguage}
              onContinue={() => setCurrentStep(2)}
            />

          ) : null}


          {/* ==================== STEP 2 ==================== */}

          {currentStep === 2 ? (

            <PatientIdStep
              initialData={patientData}
              onSubmit={handlePatientIdSubmit}
              onBack={() => setCurrentStep(1)}
            />

          ) : null}


          {/* ==================== STEP 3 ==================== */}

          {currentStep === 3 ? (

            <ConsentStep
              patientName={
                patientData.fullName ||
                'Registered Patient'
              }
              onConsentGiven={handleConsentGiven}
              onBack={() => setCurrentStep(2)}
              isSubmitting={isSubmitting}
            />

          ) : null}


          {/* ==================== STEP 4 ==================== */}

          {currentStep === 4 ? (

            <div className="w-full">

              {createdPatient && createdCase ? (

                <div className="w-full">

                  {!interviewStarted ? (

                    <div className="p-6 text-center">

                      <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Patient Ready
                      </h2>

                      <p className="text-sm text-slate-600 mb-6">
                        The patient record has been created successfully.
                      </p>

                      <button
                        type="button"
                        onClick={() => setInterviewStarted(true)}
                        className="px-6 py-3 bg-clinical-600 text-white rounded-lg font-semibold hover:bg-clinical-700 transition-colors"
                      >
                        Start Interview
                      </button>

                    </div>

                  ) : (

                    <ClinicalInterview
                      caseId={createdCase.id}
                    />

                  )}

                </div>

              ) : (

                <div className="p-6 text-center">

                  <p className="text-sm text-slate-600">
                    Preparing patient record...
                  </p>

                </div>

              )}

            </div>

          ) : null}

        </div>

      </main>

      {/* ==================== HOSPITAL FOOTER ==================== */}

      <footer className="border-t border-slate-200 py-4 bg-white/70 backdrop-blur-sm text-center text-xs text-slate-500 flex items-center justify-center gap-4 px-4">

        <div className="flex items-center gap-1.5">

          <ShieldCheck className="w-4 h-4 text-clinical-600" />

          <span>
            NABH Compliant Clinical Record Capture
          </span>

        </div>

        <span className="text-slate-300">
          •
        </span>

        <span>
          SIH 2026 Prototype PS 26047
        </span>

      </footer>

    </div>
  );
};

/*
 * Export both ways:
 *
 * Named import:
 * import { KioskPage } from './pages/KioskPage';
 *
 * Default import:
 * import KioskPage from './pages/KioskPage';
 */

export { KioskPage };
export default KioskPage;

