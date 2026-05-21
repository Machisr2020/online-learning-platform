
import React from 'react';

interface AdminEventFormStepsProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const AdminEventFormSteps: React.FC<AdminEventFormStepsProps> = ({
  currentStep,
  setCurrentStep,
}) => {
  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Settings' },
    { number: 3, title: 'Participants' },
  ];

  return (
    <div className="px-6 py-4 bg-gray-800/50">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step.number)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                currentStep >= step.number 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {step.number}
            </button>
            <span className={`ml-2 text-sm ${
              currentStep >= step.number ? 'text-white' : 'text-gray-400'
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && <div className="w-12 h-0.5 bg-gray-700 mx-4" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEventFormSteps;
