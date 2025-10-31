import React, { useState, useEffect } from 'react';
import { findNearbyPlaces } from '../../services/geminiService';
import { GroundingChunk } from '../../types';
import { ChevronDownIcon, ExternalLinkIcon } from '../Icons';

const MapScreen: React.FC = () => {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [places, setPlaces] = useState<GroundingChunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.error("Geolocation error:", error);
                // Fallback location (Kathmandu) if permission denied
                setUserLocation({ latitude: 27.7172, longitude: 85.3240 });
                setError("Could not get your location. Showing results for Kathmandu.");
            }
        );
    }, []);

    const handleSearch = async (category: string) => {
        if (!userLocation) {
            setError("User location is not available yet.");
            return;
        }
        setLoading(true);
        setError(null);
        setPlaces([]);
        setActiveCategory(category);
        setSelectedPlaceId(null); // Reset selection on new search
        try {
            const response = await findNearbyPlaces(category, userLocation);
            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0) {
                setPlaces(groundingMetadata.groundingChunks);
            } else {
                 setPlaces([]);
                 setError(`AI couldn't find any ${category} nearby. Try another search.`)
            }
        } catch (err) {
            setError("Failed to fetch places. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const categories = ['temples', 'hospitals', 'hotels', 'restaurants', 'ATMs'];

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold">Map & Nearby Places</h1>
            <p className="text-gray-500 dark:text-gray-400">Discover points of interest around you, powered by AI.</p>
            
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => handleSearch(cat)}
                        className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${activeCategory === cat ? 'bg-teal-500 text-black font-semibold' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading && <div className="text-center p-8 text-gray-500 dark:text-gray-400">Searching for nearby {activeCategory}...</div>}
            {error && <div className="text-center p-8 text-red-500 dark:text-red-400">{error}</div>}

            <div className="space-y-3">
                {places.map((place, index) => {
                    const mapData = place.maps;
                    if (!mapData) return null;
                    const placeId = mapData.uri || `place-${index}`;
                    const isSelected = selectedPlaceId === placeId;

                    return (
                        <div key={placeId} className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setSelectedPlaceId(isSelected ? null : placeId)}
                                className="w-full text-left p-4 flex justify-between items-center"
                                aria-expanded={isSelected}
                                aria-controls={`place-details-${index}`}
                            >
                                <h3 className="font-bold text-lg text-teal-700 dark:text-teal-300 pr-2">{mapData.title}</h3>
                                <ChevronDownIcon className={`flex-shrink-0 w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`} />
                            </button>

                            {isSelected && (
                                <div 
                                    id={`place-details-${index}`}
                                    className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700/50 space-y-3 animate-fadeIn"
                                >
                                    {mapData.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.text ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                            "{mapData.placeAnswerSources[0].reviewSnippets[0].text}"
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500">No additional details available.</p>
                                    )}
                                    <a
                                        href={mapData.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                                    >
                                        View on Map <ExternalLinkIcon className="w-4 h-4" />
                                    </a>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
             <style>{`
              @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn {
                  animation: fadeIn 0.3s ease-out forwards;
              }
          `}</style>
        </div>
    );
};

export default MapScreen;