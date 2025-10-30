
import React, { useState } from 'react';
import { MountainIcon, SparklesIcon, PinIcon } from './Icons';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: <MountainIcon className="w-16 h-16 text-teal-300" />,
    title: "Discover Nepal's Best Spots",
    description: "Explore breathtaking mountains, ancient temples, and vibrant cultures across Nepal",
  },
  {
    icon: <SparklesIcon className="w-16 h-16 text-yellow-300" />,
    title: "Plan Trips Instantly with AI",
    description: "Get personalized itineraries tailored to your preferences in seconds",
  },
  {
    icon: <PinIcon className="w-16 h-16 text-cyan-300" />,
    title: "Offline Maps & Local Homestays",
    description: "Navigate without internet and experience authentic Nepali hospitality",
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { icon, title, description } = onboardingSteps[currentStep];

  return (
    <div className="h-screen w-screen max-w-md mx-auto bg-black flex flex-col justify-between p-6 text-white">
      <div className="text-right">
        <button onClick={onComplete} className="text-gray-400">Skip</button>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="bg-gray-800/50 p-6 rounded-3xl shadow-lg mb-8 border border-gray-700 from-teal-500 to-cyan-500 bg-gradient-to-br">
            {icon}
        </div>
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-gray-400 max-w-xs">{description}</p>
      </div>

      <div>
        <div className="flex justify-center items-center gap-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? 'w-6 bg-teal-400' : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
            <button 
                onClick={handlePrev} 
                className={`px-6 py-3 rounded-xl text-white ${currentStep > 0 ? 'bg-gray-800' : 'opacity-0'}`}
                disabled={currentStep === 0}
            >
                &lt;
            </button>
            <button 
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-teal-500 text-black font-semibold"
            >
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next >'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
