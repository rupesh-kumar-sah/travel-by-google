import React, { useState, useEffect, useRef } from 'react';
import { GroundingChunk } from '@google/genai';
import { SearchIcon, MicIcon, PhoneIcon, AlertIcon, SparklesIcon, LightbulbIcon, UserPlusIcon, TrashIcon, DollarSignIcon, CalendarIcon, UsersIcon, PlannerIcon } from '../Icons';
import { getAiSearchGroundedResponse, getDestinationDetailsStream } from '../../services/geminiService';
import { Destination, DynamicHeroContent } from '../../types';

interface SearchResult {
    text: string;
    sources: GroundingChunk[];
}

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
                         {cat
