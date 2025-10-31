export enum Screen {
  Home = 'Home',
  Planner = 'Planner',
  Map = 'Map',
  Feed = 'Feed',
  Profile = 'Profile',
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  level: string;
  stats: {
    trips: number;
    countries: number;
    days: number;
  };
}

export interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  image: string;
  tags: string[];
}

export interface Itinerary {
  id: number;
  title: string;
  location: string;
  duration: string;
  description: string;
  bestTimeToVisit: string;
  keyActivities: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  isAI: boolean;
}

export interface FeedPost {
  id: number;
  author: string;
  authorAvatar: string;
  location: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Place {
    name: string;
    address: string;
    distance: string;
    rating: number;
    category: 'temple' | 'hospital' | 'hotel' | 'atm' | 'restaurant';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Added GroundingChunk type for reuse
export interface GroundingChunk {
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

export interface SearchResult {
    text: string;
    sources: GroundingChunk[];
}

// Moved from geminiService.ts
export interface TripIdea {
  title: string;
  prompt: string;
}

// Moved from geminiService.ts
export interface DynamicHeroContent {
  title: string;
  description: string;
  image: string; // base64 string or URL
}