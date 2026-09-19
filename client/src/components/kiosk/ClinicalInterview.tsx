import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { PatientCase } from '../../types/index';
import { TouchInputs } from './TouchInputs';
import { VoiceInput } from './VoiceInput';
import { HistorySummaryReview } from './HistorySummaryReview';

interface InterviewTurn {
  questionText: string;
  answerText: string;
  section: string;
  inputModality?: string;
  confidenceScore?: number;
}

interface ClinicalQuestion {
  next_question?: string;
  question_text?: string;
  question?: string;
  question_type: 'text' | 'choice' | 'severity' | 'duration' | 'yes_no';
  section: string;
  reason?: string;
  should_continue?: boolean;
  options?: string[];
  collected_fields?: Record<string, any>;
}

interface ClinicalInterviewProps {
  caseId: string;
}

export const ClinicalInterview: React.FC<ClinicalInterviewProps> = ({
  caseId,
}) => {
  const [caseInfo, setCaseInfo] = useState<PatientCase | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<ClinicalQuestion | null>(null);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [completed, setCompleted] = useState(false);
  const [collectedFields, setCollectedFields] =
    useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    (import.meta.env?.VITE_API_BASE_URL as string) ||
    'http://localhost:5000/api';

  /*
   * Load case information when component starts.
   */
  useEffect(() => {
    let mounted = true;

    const loadCase = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Loading case:', caseId);

        const c = await api.getCaseById(caseId);

        if (!mounted) return;

        if (!c) {
          throw new Error('Case information was not found.');
        }

        console.log('Case loaded:', c);

        setCaseInfo(c);

        /*
         * IMPORTANT:
         * Do NOT use caseInfo?.chiefComplaint here because
         * setCaseInfo() does not update state immediately.
         *
         * Use c.chiefComplaint directly.
         */
        await fetchNextQuestion([], c.chiefComplaint);

      } catch (err: any) {
        console.error('Failed to load clinical case:', err);

        if (mounted) {
          setError(
            err?.message ||
              'Unable to load the patient case. Please try again.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCase();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  /*
   * Fetch the next AI clinical question.
   */
  const fetchNextQuestion = async (
    previousResponses: InterviewTurn[],
    chiefComplaint?: string
  ) => {
    try {
      setError(null);

      /*
       * Use freshly supplied chiefComplaint first.
       * If it is not supplied, use caseInfo.
       */
      const complaint =
        chiefComplaint || caseInfo?.chiefComplaint;

      if (!complaint) {
        throw new Error(
          'Chief complaint is missing from the patient case.'
        );
      }

      const body = {
        chiefComplaint: complaint,
        previousResponses,
        currentSection:
          previousResponses.length > 0
            ? previousResponses[previousResponses.length - 1].section
            : undefined,
      };

      console.log(
        'Sending request to /ai/next-question:',
        body
      );

      const response = await fetch(
        `${API_BASE_URL}/ai/next-question`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      /*
       * Get response as text first.
       * This prevents:
       *
       * Unexpected token '<', "<!doctype..."
       *
       * when the server sends an HTML error page.
       */
      const responseText = await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          'Server returned non-JSON response:',
          responseText
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `AI request failed with status ${response.status}.`
        );
      }

      if (!data.success) {
        throw new Error(
          data?.error || 'Failed to generate next question.'
        );
      }

      if (!data.nextQuestion) {
        throw new Error(
          'AI response did not contain a next question.'
        );
      }

      console.log(
        'Next clinical question:',
        data.nextQuestion
      );

      if (data.nextQuestion.should_continue === false) {
        setCompleted(true);

        setCollectedFields(
          data.nextQuestion.collected_fields || {}
        );

        return;
      }

      setCurrentQuestion(data.nextQuestion);

    } catch (err: any) {
      console.error(
        'Failed to fetch next clinical question:',
        err
      );

      setError(
        err?.message ||
          'Unable to generate the next clinical question.'
      );
    }
  };

  /*
   * Handle patient's answer.
   */
  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || submitting) {
      return;
    }

    if (!answer || !answer.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const turn: InterviewTurn = {
      questionText:
        currentQuestion.next_question ||
        currentQuestion.question_text ||
        currentQuestion.question ||
        '',

      answerText: answer.trim(),

      section:
        currentQuestion.section ||
        'history_of_present_illness',

      inputModality: currentQuestion.question_type,
    };

    console.log('Interview turn:', turn);

    try {
      /*
       * Save patient's answer to backend.
       */
      const response = await fetch(
        `${API_BASE_URL}/cases/${caseId}/responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(turn),
        }
      );

      const responseText = await response.text();

      let data: any = null;

      try {
        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch {
        console.warn(
          'Response save endpoint returned non-JSON:',
          responseText
        );
      }

      if (!response.ok) {
        console.error(
          'Save response failed:',
          response.status,
          data
        );

        throw new Error(
          data?.error ||
            `Failed to save answer (${response.status}).`
        );
      }

      /*
       * Add the answer to local interview history.
       */
      const newTurns = [...turns, turn];

      setTurns(newTurns);

      /*
       * Check whether AI has marked the interview as complete.
       */
      if (currentQuestion.should_continue === false) {
        setCompleted(true);

        setCollectedFields(
          currentQuestion.collected_fields || {}
        );

        return;
      }

      /*
       * Ask AI for the next question.
       */
      await fetchNextQuestion(
        newTurns,
        caseInfo?.chiefComplaint
      );

    } catch (err: any) {
      console.error('Error handling patient answer:', err);

      setError(
        err?.message ||
          'Unable to save your answer. Please try again.'
      );

    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />

        <p className="text-lg font-medium text-slate-700">
          Preparing clinical interview...
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Please wait while we prepare the first question.
        </p>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error && !caseInfo) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-xl font-bold text-red-700">
          Unable to Start Interview
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  /*
   * Case not available.
   */
  if (!caseInfo) {
    return (
      <div className="py-8 text-center text-slate-600">
        Patient case information is unavailable.
      </div>
    );
  }

  /*
   * Interview completed.
   */
  if (completed) {
    return (
      <HistorySummaryReview
        fields={collectedFields || {}}
        caseId={caseId}
      />
    );
  }

  /*
   * Waiting for first/next question.
   */
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />

        <p className="text-lg font-medium text-slate-700">
          Preparing next question...
        </p>

        {error && (
          <div className="mt-4 max-w-lg rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchNextQuestion(
                  turns,
                  caseInfo.chiefComplaint
                )
              }
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  const questionType =
    currentQuestion.question_type || 'text';

  const questionText =
    currentQuestion.next_question ||
    currentQuestion.question_text ||
    currentQuestion.question ||
    'Please tell us more about your symptoms.';

  const options =
    currentQuestion.options || [];

  /*
   * Render appropriate input control.
   */
  const renderInput = () => {
    if (
      ['choice', 'severity', 'duration', 'yes_no'].includes(
        questionType
      )
    ) {
      return (
        <TouchInputs
          question={questionText}
          options={options}
          onSubmit={handleAnswer}
        />
      );
    }

    return (
      <VoiceInput
        question={questionText}
        onSubmit={handleAnswer}
      />
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Clinical Interview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Please answer the following questions as accurately
          as possible. Your responses will be shared with the
          attending doctor for clinical history collection.
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-lg bg-slate-100 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            Questions answered
          </span>

          <span className="font-semibold text-slate-900">
            {turns.length}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Question Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {currentQuestion.section?.replace(
              /_/g,
              ' '
            ) || 'Clinical History'}
          </span>

          {submitting && (
            <span className="text-xs text-slate-500">
              Saving response...
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold leading-relaxed text-slate-900">
          {questionText}
        </h3>

        {/* Input */}
        <div className="mt-6">
          {renderInput()}
        </div>
      </div>

      {/* Safety information */}
      <p className="text-center text-xs text-slate-400">
        This interview collects clinical history only. It does
        not provide a diagnosis or prescribe treatment.
      </p>
    </div>
  );
};

export default ClinicalInterview;