import React, { useState } from 'react';
import { SparklesIcon } from '../Icons';
import { planComplexTrip } from '../../services/geminiService';

const examplePrompts = [
  "A 10-day luxury spiritual retreat in the Kathmandu valley, focusing on yoga, meditation, and ancient temples.",
  "An adventurous 7-day trek for a group of 4 fit beginners, including rafting and wildlife safari. Budget-friendly.",
  "Family-friendly 5-day trip to Pokhara, with easy hikes, boating, and cultural experiences for kids under 10.",
  "Solo female traveler's 14-day itinerary covering both cultural heritage sites and a moderate trek with great mountain views."
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
        setItinerary(null);
        try {
            const result = await planComplexTrip(prompt);
            setItinerary(result);
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
                <p className="text-gray-400">Describe your ideal trip to Nepal, and our AI will craft a personalized itinerary just for you.</p>
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

            <div className="space-y-2">
                <h3 className="font-semibold text-gray-400">Need inspiration? Try one of these:</h3>
                <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((p, i) => (
                        <button key={i} onClick={() => setPrompt(p)} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700 hover:bg-gray-700">
                           "{p.substring(0, 30)}..."
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
        </div>
    );
};

export default PlannerScreen;
