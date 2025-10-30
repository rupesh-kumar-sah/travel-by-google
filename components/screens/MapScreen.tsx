
import React, { useState, useEffect } from 'react';
import { findNearbyPlaces } from '../../services/geminiService';

interface GroundingChunk {
    web?: {
        uri: string;
        title: string;
    };
    maps?: {
        uri: string;
        title: string;
        placeAnswerSources?: {
            reviewSnippets: {
                uri: string;
                title: string;
                text: string;
            }[];
        }[]
    }
}

const MapScreen: React.FC = () => {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [places, setPlaces] = useState<GroundingChunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
        try {
            const response = await findNearbyPlaces(category, userLocation);
            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
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
            <p className="text-gray-400">Discover points of interest around you, powered by AI.</p>
            
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => handleSearch(cat)}
                        className={`px-4 py-2 rounded-full text-sm capitalize ${activeCategory === cat ? 'bg-teal-500 text-black' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading && <div className="text-center p-8">Loading nearby {activeCategory}...</div>}
            {error && <div className="text-center p-8 text-red-400">{error}</div>}

            <div className="space-y-3">
                {places.map((place, index) => {
                    const mapData = place.maps;
                    if (!mapData) return null;
                    return (
                        <a href={mapData.uri} target="_blank" rel="noopener noreferrer" key={index} className="block bg-[#1C1C1E] border border-gray-800 rounded-2xl p-4 hover:bg-gray-800 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-teal-300">{mapData.title}</h3>
                                    {mapData.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.text &&
                                        <p className="text-sm text-gray-400 mt-1 italic">"{mapData.placeAnswerSources[0].reviewSnippets[0].text}"</p>
                                    }
                                </div>
                                <span className="text-gray-500 text-2xl">📍</span>
                            </div>
                        </a>
                    )
                })}
            </div>
        </div>
    );
};

export default MapScreen;
