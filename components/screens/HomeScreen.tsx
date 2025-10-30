import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, MicIcon, PhoneIcon, AlertIcon, SparklesIcon, LightbulbIcon, UserPlusIcon, TrashIcon, DollarSignIcon, CalendarIcon, UsersIcon, PlannerIcon } from '../Icons';
import { getAiSearchGroundedResponse, getDestinationDetailsStream } from '../../services/geminiService';
import { SearchResult, Destination, DynamicHeroContent } from '../../types';

interface EmergencyContact {
    name: string;
    phone: string;
}

const staticHeroContent: DynamicHeroContent = {
    title: "Discover Annapurna",
    description: "Trek through stunning landscapes to the base of the world's 10th highest peak.",
    image: 'https://images.unsplash.com/photo-1542392084-566d4847314a?q=80&w=400&auto=format&fit=crop',
};

const staticTravelTip = "Pack layers! The weather in the mountains can change in an instant.";

const staticDestinations: Omit<Destination, 'id'>[] = [
    {
        name: 'Poon Hill Trek',
        location: 'Gandaki Province',
        description: 'A relatively easy trek offering some of the most spectacular mountain scenery in the Annapurna region.',
        image: 'https://images.unsplash.com/photo-1605788485215-35990d068502?q=80&w=400&auto=format&fit=crop',
        tags: ['Trending', 'Nature'],
    },
    {
        name: 'Bhaktapur Durbar Square',
        location: 'Kathmandu Valley',
        description: "A UNESCO World Heritage site, showcasing the valley's rich medieval art, architecture, and culture.",
        image: 'https://images.unsplash.com/photo-1595361042152-4a7b74f07937?q=80&w=400&auto=format&fit=crop',
        tags: ['Cultural', 'AI Pick'],
    },
    {
        name: 'Chitwan National Park',
        location: 'Terai Region',
        description: 'Explore the lush jungles and spot rare wildlife, including one-horned rhinos and Bengal tigers.',
        image: 'https://images.unsplash.com/photo-1579282240050-8488b7b04975?q=80&w=400&auto=format&fit=crop',
        tags: ['Adventure', 'Hidden Gem'],
    }
];


const PersonalizedHeader: React.FC<{ name: string }> = ({ name }) => {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hours = new Date().getHours();
        if (hours < 12) setGreeting('Good Morning');
        else if (hours < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <div className="p-4 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-white">{greeting}, {name}</h1>
                <p className="text-sm text-gray-400">Let's plan your next adventure!</p>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-full border border-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">AI Connected</span>
            </div>
        </div>
    );
};

const DynamicDiscoverSection: React.FC<{ content: DynamicHeroContent | null; isLoading: boolean }> = ({ content, isLoading }) => {
    if (isLoading || !content) {
        return (
            <div className="p-4 pt-0">
                <div className="h-48 rounded-2xl bg-gray-800 animate-pulse"></div>
            </div>
        );
    }
    
    return (
        <div className="p-4 pt-0">
            <div className="h-48 rounded-2xl bg-cover bg-center flex flex-col justify-end p-4 relative overflow-hidden" style={{backgroundImage: `url('${content.image}')`}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="relative z-10 bg-black/30 backdrop-blur-sm p-2 rounded-lg">
                    <h2 className="text-2xl font-bold text-white">{content.title}</h2>
                    <p className="text-sm text-gray-200">{content.description}</p>
                </div>
            </div>
        </div>
    );
};

const TravelTipCard: React.FC<{ tip: string | null; isLoading: boolean }> = ({ tip, isLoading }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Show card again when a new tip is loaded
        if (tip) setIsVisible(true);
    }, [tip]);

    if (!isVisible || (!tip && !isLoading)) return null;

    return (
         <div className="px-4">
             <div className="bg-teal-900/50 border border-teal-500/30 rounded-2xl p-3 flex items-start gap-3">
                 <div className="text-yellow-300 mt-0.5"><LightbulbIcon className="w-5 h-5"/></div>
                 <div className="flex-1">
                     <p className="text-sm font-semibold text-teal-200">AI Travel Tip</p>
                     {isLoading ? (
                        <div className="h-4 w-3/4 bg-gray-700/50 rounded mt-1 animate-pulse"></div>
                     ) : (
                        <p className="text-xs text-gray-300">{tip}</p>
                     )}
                 </div>
                 <button onClick={() => setIsVisible(false)} className="text-gray-500 text-lg leading-none -mt-1">&times;</button>
             </div>
         </div>
    );
};

const SearchBar: React.FC<{ 
    query: string; 
    onQueryChange: (q: string) => void; 
    onSearch: () => void;
    onVoiceClick: () => void;
    isListening: boolean;
}> = ({ query, onQueryChange, onSearch, onVoiceClick, isListening }) => {
    return (
        <div className="px-4 relative">
            <SearchIcon className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
            <input 
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                placeholder={isListening ? "Listening..." : "AI-powered search: 'trekking', 'temples'..."}
                className="w-full bg-[#1C1C1E] border border-gray-700 rounded-full py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button onClick={onVoiceClick} className="absolute right-8 top-1/2 -translate-y-1/2" aria-label="Voice search">
                <MicIcon className={`w-5 h-5 transition-colors ${isListening ? 'text-teal-400 animate-pulse' : 'text-gray-400'}`}/>
            </button>
        </div>
    );
};

const SearchFilters: React.FC<{ onFilterClick: (append: string) => void }> = ({ onFilterClick }) => {
    const filters = [
        { label: 'Cost', append: 'with a cost estimate', icon: <DollarSignIcon className="w-4 h-4" /> },
        { label: 'Best Time', append: 'and the best time to visit', icon: <CalendarIcon className="w-4 h-4" /> },
        { label: 'For Families', append: 'suitable for families', icon: <UsersIcon className="w-4 h-4" /> },
        { label: '7-Day Plan', append: 'as a 7-day itinerary', icon: <PlannerIcon className="w-4 h-4" /> }
    ];

    return (
        <div className="px-4">
            <p className="text-xs text-gray-400 mb-2 ml-1">Refine with AI:</p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {filters.map(filter => (
                    <button
                        key={filter.label}
                        onClick={() => onFilterClick(filter.append)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-xs border border-gray-700 hover:bg-teal-500/20 hover:text-teal-300 transition-colors"
                    >
                        {filter.icon}
                        <span>{filter.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};


const Categories: React.FC<{ onCategoryClick: (category: string) => void }> = ({ onCategoryClick }) => {
    const categories = ['Trekking', 'Cultural', 'Adventure', 'Food', 'Nature'];
    return (
        <div className="px-4">
             <div className="flex gap-3 overflow-x-auto pb-2 -mb-2 no-scrollbar">
                {categories.map(cat => (
                     <button 
                        key={cat}
                        onClick={() => onCategoryClick(cat)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700 flex-shrink-0 hover:bg-teal-500/20 hover:text-teal-300 transition-colors"
                     >
                         {cat}
                     </button>
                ))}
             </div>
             <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

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

const CustomEmergencyContacts: React.FC = () => {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [error, setError] = useState('');

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedContacts = localStorage.getItem('emergencyContacts');
            if (storedContacts) {
                setContacts(JSON.parse(storedContacts));
            }
        } catch (e) {
            console.error("Failed to parse emergency contacts from localStorage", e);
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    }, [contacts]);

    const handleAddContact = () => {
        if (!newName.trim() || !newPhone.trim()) {
            setError('Name and phone number cannot be empty.');
            return;
        }
        setContacts([...contacts, { name: newName.trim(), phone: newPhone.trim() }]);
        setNewName('');
        setNewPhone('');
        setError('');
        setIsAdding(false);
    };

    const handleRemoveContact = (indexToRemove: number) => {
        setContacts(contacts.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="px-4">
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                         <UserPlusIcon className="w-6 h-6 text-blue-300"/>
                        <div>
                            <h3 className="font-bold text-blue-200">My Emergency Contacts</h3>
                            <p className="text-xs text-blue-300/80">Your personal safety contacts</p>
                        </div>
                    </div>
                    {!isAdding && (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm hover:bg-blue-500/40 transition-colors"
                        >
                            + Add
                        </button>
                    )}
                </div>

                {isAdding ? (
                    <div className="space-y-3 pt-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Contact Name (e.g., Jane Doe)"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white placeholder-gray-500 text-sm"
                        />
                        <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="Phone Number (e.g., +1 555 1234)"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white placeholder-gray-500 text-sm"
                        />
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => { setIsAdding(false); setError(''); }} className="bg-gray-700/80 px-4 py-1.5 rounded-md text-sm">Cancel</button>
                            <button onClick={handleAddContact} className="bg-blue-500 px-4 py-1.5 rounded-md text-sm text-black font-semibold">Save</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {contacts.length === 0 ? (
                            <div className="text-center py-4 text-sm text-gray-400">
                                <p>No contacts added yet.</p>
                                <p>Add your first emergency contact for peace of mind.</p>
                            </div>
                        ) : (
                            contacts.map((contact, index) => (
                                <div key={index} className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-200">{contact.name}</p>
                                        <a href={`tel:${contact.phone}`} className="text-sm text-teal-400 hover:underline">{contact.phone}</a>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveContact(index)}
                                        className="text-gray-500 hover:text-red-400 p-1"
                                        aria-label={`Remove ${contact.name}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

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

const DestinationCard: React.FC<{dest: Omit<Destination, 'id'>; onClick: () => void; onImageClick: () => void;}> = ({ dest, onClick, onImageClick }) => (
    <button onClick={onClick} className="bg-[#1C1C1E] border border-gray-800 rounded-2xl overflow-hidden w-full text-left hover:border-teal-500/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500">
        <div className="relative group">
            <img 
                src={dest.image} 
                alt={dest.name} 
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card's onClick from firing
                    onImageClick();
                }}
            />
             <div
                onClick={(e) => {
                    e.stopPropagation();
                    onImageClick();
                }} 
                className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
            >
                <SearchIcon className="w-8 h-8 text-white/80" />
            </div>
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

const DestinationCardSkeleton: React.FC = () => (
    <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl overflow-hidden w-full">
        <div className="w-full h-40 bg-gray-700 animate-pulse"></div>
        <div className="p-4 space-y-2">
            <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-700 rounded animate-pulse mt-2"></div>
            <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse"></div>
        </div>
    </div>
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

const ImageZoomModal: React.FC<{ imageUrl: string | null; onClose: () => void }> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <img 
                src={imageUrl} 
                alt="Zoomed destination" 
                className="max-w-[95%] max-h-[90%] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            />
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/50 w-8 h-8 rounded-full text-white text-lg"
                aria-label="Close image view"
            >&times;</button>
        </div>
    );
};

const HomeScreen: React.FC = () => {
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [selectedDestination, setSelectedDestination] = useState<Omit<Destination, 'id'> | null>(null);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    
    // State for new dynamic features & search
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const handleVoiceSearch = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };

        recognition.start();
    };


    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchError('');
        try {
            const response = await getAiSearchGroundedResponse(searchQuery);
            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            setSearchResults({
                text: response.text,
                sources: groundingMetadata?.groundingChunks || [],
            });
        } catch (error) {
            console.error("Search failed:", error);
            setSearchError("Sorry, the AI search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleCategoryClick = (category: string) => {
        setSearchQuery(category);
        handleSearch();
    };

    const handleFilterClick = (append: string) => {
        setSearchQuery(prev => (prev.trim() + ' ' + append).trim());
    };

    return (
        <>
            <div className="w-full text-white space-y-4 pb-4">
                <PersonalizedHeader name="Explorer" />
                <DynamicDiscoverSection content={staticHeroContent} isLoading={false} />
                <SearchBar 
                    query={searchQuery} 
                    onQueryChange={setSearchQuery} 
                    onSearch={handleSearch}
                    onVoiceClick={handleVoiceSearch}
                    isListening={isListening}
                />
                <SearchFilters onFilterClick={handleFilterClick} />

                {isSearching && <div className="text-center px-4 -my-2 text-sm text-gray-400">🔎 Searching with AI...</div>}
                {searchError && <div className="text-center px-4 -my-2 text-sm text-red-400">{searchError}</div>}
                
                <TravelTipCard tip={staticTravelTip} isLoading={false} />
                <Categories onCategoryClick={setSearchQuery} />
                
                <div className="px-4 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold">Featured Destinations</h2>
                        <a href="#" className="text-sm text-teal-400">View all</a>
                    </div>
                    <div className="space-y-4">
                       {staticDestinations.map(dest => (
                            <DestinationCard 
                                key={dest.name} 
                                dest={dest} 
                                onClick={() => setSelectedDestination(dest)} 
                                onImageClick={() => setZoomedImage(dest.image)}
                            />
                        ))}
                    </div>
                </div>
                
                <Stats />
                <EmergencyCard />
                <CustomEmergencyContacts />
            </div>
            <SearchResultsModal result={searchResults} onClose={() => setSearchResults(null)} />
            <DestinationDetailModal destination={selectedDestination} onClose={() => setSelectedDestination(null)} />
            <ImageZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
            <style>{`
              @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
              }
              .animate-fadeIn {
                  animation: fadeIn 0.2s ease-out forwards;
              }
          `}</style>
        </>
    );
};

export default HomeScreen;