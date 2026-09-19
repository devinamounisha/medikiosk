import React, { useState } from 'react';

interface VoiceInputProps {
  question: string;
  onSubmit: (answer: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ question, onSubmit }) => {
  const [answer, setAnswer] = useState('');
  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };
  return (
    <div className="space-y-4">
      <p className="font-medium">{question}</p>
      <textarea
        rows={3}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-clinical-600"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your response..."
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="px-4 py-2 bg-clinical-600 text-white rounded hover:bg-clinical-700 transition"
      >
        Submit
      </button>
    </div>
  );
};
