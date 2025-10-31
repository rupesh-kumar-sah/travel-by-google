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
    const [duration, setDuration] = useState<string>('7');
    const [durationUnit, setDurationUnit] = useState<'days' | 'weeks'>('days');
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
        
        const durationText = duration && parseInt(duration, 10) > 0 ? ` for ${duration} ${durationUnit}` : '';
        const fullPrompt = `Plan a trip in Nepal${durationText}. Here are the details from the user: ${prompt}`;

        try {
            const stream = await planComplexTripStream(fullPrompt);
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
        <div className="p-4 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">AI Trip Planner</h1>
                <p className="text-gray-500 dark:text-gray-400">Describe your ideal trip, or get inspired by an AI-suggested idea below.</p>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                    <span>Your Trip Details</span>
                </h2>
                
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trip Duration</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-24 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            min="1"
                            aria-label="Trip duration value"
                        />
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-1 flex">
                            <button 
                                onClick={() => setDurationUnit('days')} 
                                className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${durationUnit === 'days' ? 'bg-teal-500 text-black' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                                Days
                            </button>
                            <button 
                                onClick={() => setDurationUnit('weeks')} 
                                className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${durationUnit === 'weeks' ? 'bg-teal-500 text-black' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                                Weeks
                            </button>
                        </div>
                    </div>
                </div>

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="e.g., 'A moderate trek near Pokhara for two people with a budget of $1000, including some cultural sightseeing.'"
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="w-full bg-teal-500 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
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
                    <SparklesIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                    <span>AI Trip Ideas</span>
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mb-2 no-scrollbar">
                    {staticTripIdeas.map((idea, index) => (
                        <button 
                            key={index} 
                            onClick={() => setPrompt(idea.prompt)}
                            className="min-w-[200px] flex-shrink-0 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-left hover:border-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <h3 className="font-bold text-teal-700 dark:text-teal-300">{idea.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{idea.prompt}</p>
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                 <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-lg p-3 text-center text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {itinerary && (
                <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                    <h2 className="text-xl font-bold mb-4">Your AI-Generated Itinerary</h2>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
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
                 /* Hide number input arrows */
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                  -webkit-appearance: none; 
                  margin: 0; 
                }
                input[type=number] {
                  -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
};

export default PlannerScreen;