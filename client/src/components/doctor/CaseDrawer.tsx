import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle,
  Stethoscope,
  User,
  Calendar,
  Clock,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { PatientCase } from '../../types/index';

interface CaseDrawerProps {
  patientCase: PatientCase | null;
  onClose: () => void;
  onStartConsultation?: (patientCase: PatientCase) => void;
}

interface InterviewResponse {
  id?: string;

  // Backend / Supabase fields
  question_text?: string;
  answer_text?: string;
  section?: string;
  input_modality?: string;
  confidence_score?: number;
  created_at?: string;

  // Possible camelCase fields
  questionText?: string;
  answerText?: string;
  createdAt?: string;

  // Possible generic fields
  question?: string;
  answer?: string;
  timestamp?: string;
}

export const CaseDrawer: React.FC<CaseDrawerProps> = ({
  patientCase,
  onClose,
  onStartConsultation,
}) => {
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(
    null
  );

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api';

  // ============================================================
  // LOAD INTERVIEW RESPONSES
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadResponses = async () => {
      if (!patientCase?.id) {
        setResponses([]);
        setResponseError(null);
        return;
      }

      try {
        setLoadingResponses(true);
        setResponseError(null);

        const url = `${API_BASE_URL}/cases/${patientCase.id}/responses`;

        console.log('Loading interview responses:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        const responseText = await response.text();

        let data: any = null;

        try {
          data = responseText
            ? JSON.parse(responseText)
            : null;
        } catch {
          console.error(
            'Responses endpoint returned non-JSON:',
            responseText
          );

          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              `Failed to load interview responses (${response.status}).`
          );
        }

        if (cancelled) return;

        /*
         * Backend returns:
         *
         * {
         *   success: true,
         *   responses: [...]
         * }
         */

        const responseList: InterviewResponse[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.responses)
            ? data.responses
            : [];

        console.log(
          'Interview responses received:',
          responseList
        );

        setResponses(responseList);
      } catch (error: any) {
        if (cancelled) return;

        console.error(
          'Failed to load interview responses:',
          error
        );

        setResponses([]);

        setResponseError(
          error?.message ||
            'Unable to load clinical interview transcript.'
        );
      } finally {
        if (!cancelled) {
          setLoadingResponses(false);
        }
      }
    };

    loadResponses();

    return () => {
      cancelled = true;
    };
  }, [patientCase?.id, API_BASE_URL]);

  // ============================================================
  // IMPORTANT:
  // Hooks are above this conditional return.
  // This prevents React "Expected static flag was missing".
  // ============================================================

  if (!patientCase) {
    return null;
  }

  // ============================================================
  // HELPERS
  // ============================================================

  const getQuestionText = (
    item: InterviewResponse
  ): string => {
    return (
      item.question_text ||
      item.questionText ||
      item.question ||
      'Question not available'
    );
  };

  const getAnswerText = (
    item: InterviewResponse
  ): string => {
    return (
      item.answer_text ||
      item.answerText ||
      item.answer ||
      'No answer recorded'
    );
  };

  const getSection = (
    item: InterviewResponse
  ): string => {
    return item.section || '';
  };

  const getResponseTime = (
    item: InterviewResponse
  ): string => {
    const value =
      item.created_at ||
      item.createdAt ||
      item.timestamp;

    if (!value) {
      return '';
    }

    try {
      return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleStartConsultation = () => {
    if (onStartConsultation) {
      onStartConsultation(patientCase);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* ====================================================== */}
      {/* OVERLAY */}
      {/* ====================================================== */}

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ====================================================== */}
      {/* DRAWER */}
      {/* ====================================================== */}

      <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">

        {/* ==================================================== */}
        {/* HEADER */}
        {/* ==================================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Clinical Case
              </h2>

              <p className="text-sm text-slate-500">
                Case ID: {patientCase.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ==================================================== */}
        {/* MAIN CONTENT */}
        {/* ==================================================== */}

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">

            {/* ================================================= */}
            {/* PATIENT INFORMATION */}
            {/* ================================================= */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  Patient Identification
                </h3>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Patient Name
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {patientCase.patient?.fullName ||
                        (patientCase as any).patientName ||
                        'Not available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Patient ID
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {patientCase.patientId ||
                        'Not available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Age
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {patientCase.patient?.age ??
                        (patientCase as any).age ??
                        'Not available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Gender
                    </p>

                    <p className="mt-1 font-semibold capitalize text-slate-900">
                      {patientCase.patient?.gender ||
                        (patientCase as any).gender ||
                        'Not available'}
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* ================================================= */}
            {/* CASE DETAILS */}
            {/* ================================================= */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  Case Details
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* Chief Complaint */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Chief Complaint
                  </p>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                    {patientCase.chiefComplaint ||
                      'No chief complaint recorded'}
                  </p>
                </div>

                {/* Priority */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Triage Priority
                  </p>

                  <div className="mt-2">
                    {patientCase.triagePriority ===
                    'URGENT' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        URGENT
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {patientCase.triagePriority ||
                          'Not assigned'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Case Status
                  </p>

                  <p className="mt-2 text-sm font-semibold capitalize text-slate-900">
                    {patientCase.status || 'Waiting'}
                  </p>
                </div>

                {/* Created */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Created
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {patientCase.createdAt
                      ? new Date(
                          patientCase.createdAt
                        ).toLocaleString()
                      : 'Not available'}
                  </p>
                </div>

              </div>
            </section>

            {/* ================================================= */}
            {/* CONSENT */}
            {/* ================================================= */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  Consent
                </h3>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />

                <div>
                  <p className="font-semibold text-emerald-800">
                    Consent Recorded
                  </p>

                  <p className="mt-1 text-sm leading-5 text-emerald-700">
                    The patient has provided consent for
                    AI-assisted clinical history collection.
                  </p>
                </div>
              </div>
            </section>

            {/* ================================================= */}
            {/* CLINICAL INTERVIEW */}
            {/* ================================================= */}

            <section>
              <div className="mb-3 flex items-center justify-between">

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />

                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    Clinical Interview
                  </h3>
                </div>

                {!loadingResponses && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {responses.length}{' '}
                    {responses.length === 1
                      ? 'response'
                      : 'responses'}
                  </span>
                )}

              </div>

              {/* Loading */}
              {loadingResponses && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />

                  <p className="text-sm text-slate-500">
                    Loading clinical interview...
                  </p>
                </div>
              )}

              {/* Error */}
              {!loadingResponses && responseError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />

                    <div>
                      <p className="font-semibold text-amber-800">
                        Unable to load interview
                      </p>

                      <p className="mt-1 text-sm text-amber-700">
                        {responseError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* No responses */}
              {!loadingResponses &&
                !responseError &&
                responses.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <Stethoscope className="mx-auto h-8 w-8 text-slate-400" />

                    <p className="mt-3 font-medium text-slate-700">
                      No interview responses yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      The clinical interview transcript
                      will appear here after the patient
                      answers questions.
                    </p>
                  </div>
                )}

              {/* ================================================= */}
              {/* RESPONSE LIST */}
              {/* ================================================= */}

              {!loadingResponses &&
                !responseError &&
                responses.length > 0 && (
                  <div className="space-y-3">

                    {responses.map((item, index) => (
                      <div
                        key={
                          item.id ||
                          `${index}-${getQuestionText(item)}`
                        }
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start gap-3">

                          {/* Number */}
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">

                            {/* Question */}
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold leading-6 text-slate-900">
                                {getQuestionText(item)}
                              </p>

                              {getResponseTime(item) && (
                                <span className="flex-shrink-0 text-xs text-slate-400">
                                  {getResponseTime(item)}
                                </span>
                              )}
                            </div>

                            {/* Answer */}
                            <div className="mt-3 rounded-lg bg-slate-50 p-3">
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Patient Answer
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-700">
                                {getAnswerText(item)}
                              </p>
                            </div>

                            {/* Section */}
                            {getSection(item) && (
                              <div className="mt-3 flex items-center gap-2">

                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-600">
                                  {getSection(item).replace(
                                    /_/g,
                                    ' '
                                  )}
                                </span>

                                {item.input_modality && (
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                                    {item.input_modality}
                                  </span>
                                )}

                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                )}
            </section>

            {/* ================================================= */}
            {/* PIPELINE STATUS */}
            {/* ================================================= */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-blue-600" />

                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  Clinical Pipeline Status
                </h3>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="space-y-4">

                  {/* Patient Registration */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Patient Registration
                      </p>

                      <p className="text-xs text-emerald-600">
                        Completed
                      </p>
                    </div>
                  </div>

                  {/* Consent */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Consent
                      </p>

                      <p className="text-xs text-emerald-600">
                        Completed
                      </p>
                    </div>
                  </div>

                  {/* AI Interview */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        responses.length > 0
                          ? 'bg-emerald-100'
                          : 'bg-amber-100'
                      }`}
                    >
                      {responses.length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        AI Clinical Interview
                      </p>

                      <p
                        className={`text-xs ${
                          responses.length > 0
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {responses.length > 0
                          ? 'Responses collected'
                          : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Consultation */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                      <Stethoscope className="h-4 w-4 text-slate-500" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Doctor Consultation
                      </p>

                      <p className="text-xs text-slate-500">
                        Pending
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

          </div>
        </div>

        {/* ==================================================== */}
        {/* FOOTER */}
        {/* ==================================================== */}

        <div className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-xs text-slate-500">
                Case priority
              </p>

              <div className="mt-1 flex items-center gap-2">
                {patientCase.triagePriority ===
                  'URGENT' && (
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                )}

                <span className="text-sm font-semibold text-slate-800">
                  {patientCase.triagePriority ||
                    'Normal'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartConsultation}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Stethoscope className="h-4 w-4" />
              Start Consultation
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CaseDrawer;