import React, { useState } from 'react';

interface TouchInputsProps {
  question: string;
  options: string[];
  onSubmit: (answer: string) => void;
}

export const TouchInputs: React.FC<TouchInputsProps> = ({ question, options, onSubmit }) => {
  const [selected, setSelected] = useState<string>('');
  const handleClick = (opt: string) => {
    setSelected(opt);
    onSubmit(opt);
  };
  return (
    <div className="space-y-4">
      <p className="font-medium">{question}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleClick(opt)}
            className={`p-2 rounded border ${selected === opt ? 'bg-clinical-600 text-white' : 'bg-white'} transition`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
