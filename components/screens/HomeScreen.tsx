import React, { useState, useEffect } from 'react';
import { SearchIcon, MicIcon, PhoneIcon, AlertIcon, SparklesIcon } from '../Icons';
import { getAiSearchGroundedResponse, getDestinationDetailsStream, getAIFeaturedDestinations } from '../../services/geminiService';
import { SearchResult, Destination } from '../../types';

const initialDestinations: Omit<Destination, 'id'>[] = [
  {
    name: 'Mount Everest Base Camp',
    location: 'Solukhumbu',
    description: "Challenge yourself with an unforgettable trek to the base of the world's tallest peak. Witness awe-inspiring Himalayan vistas and immerse yourself in Sherpa culture.",
    image: 'https://placehold.co/400x300/0d0d0d/ffffff?text=Everest',
    tags: ['Trending', 'AI Pick']
  },
  {
    name: 'Pokhara Valley',
    location: 'Gandaki Province',
    description: 'Discover the tranquil beauty of Phewa Lake, perfectly reflecting the Annapurna mountain range. A paradise for nature lovers and adventure seekers.',
    image: 'https://placehold.co/400x300/0d0d0d/ffffff?text=Pokhara',
    tags: ['Trending']
  },
  {
    name: 'Kathmandu Durbar Square',
    location: 'Kathmandu',
    description: "Step back in time at this UNESCO World Heritage site. Explore intricate Newari architecture, ancient royal palaces, and living temples bustling with devotees.",
    image: 'https://placehold.co/400x300/0d0d0d/ffffff?text=Kathmandu',
    tags: ['AI Pick']
  }
];

const Header: React.FC = () => (
    <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <img src="https://placehold.co/40x40/14b8a6/000000?text=TN" alt="logo" className="w-8 h-8 rounded-full" />
            <span className="font-bold text-lg text-white">TravelNepal.ai</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">AI</span>
        </div>
    </div>
);

const DiscoverSection: React.FC = () => (
    <div className="p-4 pt-0">
        <div className="h-48 rounded-2xl bg-cover bg-center flex flex-col justify-end p-4" style={{backgroundImage: "url('https://placehold.co/400x200/0d0d0d/14b8a6?text=Discover+Nepal')"}}>
            <div className="bg-black/30 backdrop-blur-sm p-2 rounded-lg">
                <h1 className="text-2xl font-bold text-white">Discover Nepal</h1>
                <p className="text-sm text-gray-200">AI-powered travel companion for your adventure</p>
            </div>
        </div>
    </div>
);

const SearchBar: React.FC<{ onSearch: (results: SearchResult) => void; onLoading: (loading: boolean) => void; onError: (error: string) => void; }> = ({ onSearch, onLoading, onError }) => {
    const [query, setQuery] = useState('');

    const handleSearch = async () => {
        if (!query.trim()) return;
        onLoading(true);
        onError('');
        try {
            const response = await getAiSearchGroundedResponse(query);
            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            onSearch({
                text: response.text,
                sources: groundingMetadata?.groundingChunks || [],
            });
        } catch (error) {
            console.error("Search failed:", error);
            onError("Sorry, the AI search failed. Please try again.");
        } finally {
            onLoading(false);
        }
    };
    
    return (
        <div className="px-4 relative">
            <SearchIcon className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
            <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="AI-powered search: 'trekking', 'temples'..."
                className="w-full bg-[#1C1C1E] border border-gray-700 rounded-full py-3 pl-12 pr-12 text-white placeholder-gray-500"
            />
            <MicIcon className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
        </div>
    );
};

const Categories: React.FC = () => (
    <div className="p-4 flex gap-3">
        <button className="px-4 py-2 bg-teal-500/20 text-teal-300 rounded-full text-sm border border-teal-500/50">Trekking</button>
        <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">Cultural</button>
        <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">Adventure</button>
    </div>
);

const EmergencyCard: React.FC = () => (
    <div className="px-4">
        <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
                <AlertIcon className="w-6 h-6 text-red-400"/>
                <div>
                    <h3 className="font-bold text-red-300">Emergency & Safety</h3>
                    <p className="text-xs text-red-400/80">Quick access to essential services</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <a href="tel:100" className="bg-gray-800/50 p-2 rounded-lg flex flex-col items-center gap-1"><PhoneIcon className="w-4 h-4"/> Police: 100</a>
                <a href="tel:102" className="bg-gray-800/50 p-2 rounded-lg flex flex-col items-center gap-1"><PhoneIcon className="w-4 h-4"/> Ambulance: 102</a>
                <div className="bg-gray-800/50 p-2 rounded-lg flex flex-col items-center gap-1"><PhoneIcon className="w-4 h-4"/> Tourist Police</div>
            </div>
        </div>
    </div>
);

const Stats: React.FC = () => (
    <div className="p-4 grid grid-cols-3 gap-4">
        <div className="bg-[#1C1C1E] border border-gray-800 p-3 rounded-2xl text-center">
            <p className="text-2xl font-bold text-teal-400">150+</p>
            <p className="text-xs text-gray-400">Destinations</p>
        </div>
         <div className="bg-[#1C1C1E] border border-gray-800 p-3 rounded-2xl text-center">
            <p className="text-2xl font-bold text-teal-400">50+</p>
            <p className="text-xs text-gray-400">Itineraries</p>
        </div>
         <div className="bg-[#1C1C1E] border border-gray-800 p-3 rounded-2xl text-center">
            <p className="text-2xl font-bold text-teal-400">24/7</p>
            <p className="text-xs text-gray-400">AI Support</p>
        </div>
    </div>
);

const DestinationCard: React.FC<{dest: Omit<Destination, 'id'>; onClick: () => void}> = ({ dest, onClick }) => (
    <button onClick={onClick} className="bg-[#1C1C1E] border border-gray-800 rounded-2xl overflow-hidden w-full text-left hover:border-teal-500/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500">
        <div className="relative">
            <img src={dest.image} alt={dest.name} className="w-full h-40 object-cover"/>
            <div className="absolute top-2 right-2 flex gap-2">
                {dest.tags.includes('Trending') && <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full border border-cyan-500/50">📈 Trending</span>}
                {dest.tags.includes('AI Pick') && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/50">✨ AI Pick</span>}
                {dest.tags.includes('Hidden Gem') && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/50">💎 Hidden Gem</span>}
            </div>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-lg">{dest.name}</h4>
            <p className="text-sm text-gray-400">📍 {dest.location}</p>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">{dest.description}</p>
        </div>
    </button>
);

const SearchResultsModal: React.FC<{ result: SearchResult | null; onClose: () => void }> = ({ result, onClose }) => {
    if (!result) return null;
    return (
        <div className="fixed inset-0 max-w-md mx-auto z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
            <div 
                className="bg-[#101010] w-[95%] h-[90%] rounded-2xl flex flex-col border border-gray-700 p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <h2 className="text-xl font-bold">AI Search Results</h2>
                    <button onClick={onClose} className="text-gray-400 text-2xl">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto mt-4 space-y-4">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-200 whitespace-pre-wrap">{result.text}</p>
                    </div>
                    {result.sources.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-teal-400 mb-2">Sources:</h3>
                            <ul className="space-y-2">
                                {result.sources.map((source, index) => source.web && (
                                    <li key={index} className="bg-gray-800 p-2 rounded-md text-sm">
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                           {source.web.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DestinationDetailModal: React.FC<{ destination: Omit<Destination, 'id'> | null; onClose: () => void }> = ({ destination, onClose }) => {
    const [details, setDetails] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (destination) {
            const fetchDetails = async () => {
                setIsLoading(true);
                setError(null);
                setDetails('');
                try {
                    const stream = await getDestinationDetailsStream(destination.name);
                    for await (const chunk of stream) {
                        setDetails(prev => prev + chunk.text);
                    }
                } catch (err) {
                    setError("Failed to load details from AI. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetails();
        }
    }, [destination]);

    if (!destination) return null;

    return (
        <div className="fixed inset-0 max-w-md mx-auto z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
            <div 
                className="bg-[#101010] w-full h-[95%] rounded-t-3xl flex flex-col border-t border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <img src={destination.image} alt={destination.name} className="w-full h-48 object-cover rounded-t-3xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 w-8 h-8 rounded-full text-white text-lg">&times;</button>
                    <div className="absolute bottom-4 left-4">
                        <h2 className="text-2xl font-bold text-white">{destination.name}</h2>
                        <p className="text-gray-300">📍 {destination.location}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg">
                        <SparklesIcon className="w-5 h-5"/>
                        <p className="text-sm font-semibold">AI-Generated Travel Guide</p>
                    </div>
                    {isLoading && !details && (
                         <div className="flex items-center justify-center gap-2 p-8 text-gray-400">
                           <SparklesIcon className="w-5 h-5 animate-pulse" />
                           <span>Generating your guide...</span>
                        </div>
                    )}
                    {error && <div className="text-center p-4 text-red-400">{error}</div>}
                    {details && (
                        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                            {details}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HomeScreen: React.FC = () => {
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [destinations, setDestinations] = useState<Omit<Destination, 'id'>[]>(initialDestinations);
    const [isLoadingAIDestinations, setIsLoadingAIDestinations] = useState(true);
    const [selectedDestination, setSelectedDestination] = useState<Omit<Destination, 'id'> | null>(null);
    
    useEffect(() => {
        const fetchAIDestinations = async () => {
            try {
                const existingNames = destinations.map(d => d.name);
                const newDestinations = await getAIFeaturedDestinations(existingNames);
                setDestinations(prevDests => [...prevDests, ...newDestinations]);
            } catch (error) {
                console.error("Failed to fetch AI destinations:", error);
                // Fail gracefully, the initial destinations will still be shown
            } finally {
                setIsLoadingAIDestinations(false);
            }
        };

        fetchAIDestinations();
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <>
            <div className="w-full h-full text-white space-y-4">
                <Header />
                <DiscoverSection />
                <SearchBar 
                    onSearch={setSearchResults} 
                    onLoading={setIsSearching}
                    onError={setSearchError}
                />
                {isSearching && <div className="text-center p-4">🔎 Searching with AI...</div>}
                {searchError && <div className="text-center p-4 text-red-400">{searchError}</div>}
                <Categories />
                <EmergencyCard />
                <Stats />
                <div className="px-4 pb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Featured Destinations</h2>
                        <a href="#" className="text-sm text-teal-400">View all</a>
                    </div>
                     {isLoadingAIDestinations && (
                        <div className="flex items-center justify-center gap-2 p-4 text-gray-400">
                           <SparklesIcon className="w-4 h-4 animate-pulse" />
                           <span>Generating new adventures with AI...</span>
                        </div>
                     )}
                    <div className="space-y-4">
                        {destinations.map(dest => <DestinationCard key={dest.name} dest={dest} onClick={() => setSelectedDestination(dest)} />)}
                    </div>
                </div>
            </div>
            <SearchResultsModal result={searchResults} onClose={() => setSearchResults(null)} />
            <DestinationDetailModal destination={selectedDestination} onClose={() => setSelectedDestination(null)} />
        </>
    );
};

export default HomeScreen;