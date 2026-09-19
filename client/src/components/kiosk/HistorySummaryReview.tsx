import React from 'react';

interface HistorySummaryReviewProps {
  fields: Record<string, any>;
  caseId: string;
}

export const HistorySummaryReview: React.FC<
  HistorySummaryReviewProps
> = ({ fields, caseId }) => {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api';

  const handleComplete = async () => {
    try {
      const url = `${API_BASE_URL}/cases/${caseId}/complete-intake`;

      console.log('Completing intake:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      // Read response as text first
      const responseText = await response.text();

      let data: any = null;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        console.error(
          'Complete intake returned non-JSON:',
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
            `Failed to complete intake (${response.status}).`
        );
      }

      console.log('Intake completed successfully:', data);

      alert(
        'Intake completed – case is now pending doctor verification'
      );
    } catch (e: any) {
      console.error('Complete intake failed', e);

      alert(
        e?.message ||
          'Failed to complete intake. Please try again.'
      );
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      {/* Header */}
      <h2 className="mb-4 text-2xl font-bold text-slate-900">
        Collected Clinical Summary
      </h2>

      <p className="mb-6 text-sm text-slate-500">
        Review the information collected during the clinical
        interview before completing the intake.
      </p>

      {/* Case ID */}
      <div className="mb-6 rounded-lg bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Case ID
        </p>

        <p className="mt-1 font-semibold text-slate-800">
          {caseId}
        </p>
      </div>

      {/* Clinical fields */}
      {Object.keys(fields).length > 0 ? (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(fields).map(([key, value]) => (
            <React.Fragment key={key}>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <dt className="mb-1 font-medium capitalize text-slate-600">
                  {key.replace(/_/g, ' ')}
                </dt>

                <dd className="text-slate-800">
                  {Array.isArray(value)
                    ? value.join(', ')
                    : typeof value === 'object' &&
                      value !== null
                    ? JSON.stringify(value)
                    : String(value)}
                </dd>
              </div>
            </React.Fragment>
          ))}
        </dl>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
          <p className="text-sm text-slate-500">
            No clinical information has been collected yet.
          </p>
        </div>
      )}

      {/* Complete button */}
      <button
        type="button"
        onClick={handleComplete}
        className="mt-6 rounded-lg bg-clinical-600 px-4 py-2 font-medium text-white transition hover:bg-clinical-700"
      >
        Complete Intake
      </button>
    </div>
  );
};

export default HistorySummaryReview;