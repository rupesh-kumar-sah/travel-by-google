import React, { useState } from 'react';
import { SparklesIcon } from '../Icons';
import { planComplexTripStream } from '../../services/geminiService';
import { TripIdea } from '../../types';

const staticTripIdeas: TripIdea[] = [
  {
    title: 'Spiritual Kathmandu',
    prompt: 'Plan a 4-day spiritual and cultural tour of Kathmandu, visiting major UNESCO sites like Pashupatinath, Boudhanath, and Swayambhunath. Include recommendations for vegetarian food.'
  },
  {
    title: 'Pokhara Chill & Thrill',
    prompt: 'Create a 5-day itinerary for Pokhara. I want a mix of relaxation by Phewa Lake and adventure activities like paragliding and visiting Devi\'s Fall. Suggest some good lakeside cafes.'
  },
  {
    title: 'Easy Annapurna Trek',
    prompt: 'I want a 7-day itinerary for an easy trek in the Annapurna region suitable for beginners. Focus on great views without extreme difficulty. Include accommodation suggestions (teahouses).'
  },
  {
    title: 'Jungle Safari Adventure',
    prompt: 'Plan a 3-day trip to Chitwan National Park. I want to do a jungle safari to see rhinos, stay in a nice lodge, and learn about the local Tharu culture.'
  }
];

const PlannerScreen: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [itinerary, setItinerary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePlan = async () => {
        if (!prompt.trim()) {
            setError("Please describe the trip you'd like to plan.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setItinerary(''); // Initialize with empty string for streaming
        try {
            const stream = await planComplexTripStream(prompt);
            for await (const chunk of stream) {
                setItinerary(prev => (prev ?? '') + chunk.text);
            }
        } catch (err) {
            console.error(err);
            setError("Sorry, I couldn't generate a plan. The AI service might be busy. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-6 text-white">
            <div>
                <h1 className="text-2xl font-bold">AI Trip Planner</h1>
                <p className="text-gray-400">Describe your ideal trip, or get inspired by an AI-suggested idea below.</p>
            </div>

            <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-4 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-400" />
                    <span>Your Trip Details</span>
                </h2>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="e.g., 'A 7-day moderate trek near Pokhara for two people with a budget of $1000, including some cultural sightseeing.'"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="w-full bg-teal-500 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <>
                           <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                           <span>Generating...</span>
                        </>
                    ) : (
                        'Generate Plan'
                    )}
                </button>
            </div>

            <div className="space-y-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-400" />
                    <span>AI Trip Ideas</span>
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mb-2 no-scrollbar">
                    {staticTripIdeas.map((idea, index) => (
                        <button 
                            key={index} 
                            onClick={() => setPrompt(idea.prompt)}
                            className="min-w-[200px] flex-shrink-0 bg-[#1C1C1E] border border-gray-800 rounded-2xl p-4 text-left hover:border-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <h3 className="font-bold text-teal-300">{idea.title}</h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{idea.prompt}</p>
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                 <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center text-red-300">
                    {error}
                </div>
            )}

            {itinerary && (
                <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-4">
                    <h2 className="text-xl font-bold mb-4">Your AI-Generated Itinerary</h2>
                    <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                        {itinerary}
                    </div>
                </div>
            )}
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .line-clamp-2 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                }
            `}</style>
        </div>
    );
};

export default PlannerScreen;