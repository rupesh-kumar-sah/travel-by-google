import React, { useState, useEffect } from 'react';
import { User, FeedPost } from '../../types';
import { 
    GoogleIcon, LogOutIcon, TrashIcon, ProfileIcon, EditIcon, AwardIcon, 
    PlannerIcon, HeartIcon, BookmarkIcon, SettingsIcon, BellIcon, ShieldIcon, HelpCircleIcon, 
    MountainIcon, HomeIcon, MapIcon, ChevronLeftIcon, ChevronDownIcon
} from '../Icons';

// --- MOCK DATA ---

const defaultUser: User = {
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    avatar: 'https://i.pravatar.cc/150?u=alexchen',
    level: 'Pro Member',
    stats: {
        trips: 12,
        countries: 8,
        days: 45
    }
};

const myTrips = [
    { title: 'Everest Base Camp Trek', location: 'Solukhumbu', date: 'Nov 15, 2025', status: 'Upcoming' },
    { title: 'Pokhara Adventure', location: 'Gandaki Province', date: 'Dec 5, 2025', status: 'Saved' },
    { title: 'Kathmandu Heritage Tour', location: 'Kathmandu Valley', date: 'Mar 10, 2024', status: 'Completed' },
];

const achievements = [
    { name: 'First Trip Planned', icon: PlannerIcon, unlocked: true, description: 'Created your first itinerary with AI.' },
    { name: 'Mountain Conqueror', icon: MountainIcon, unlocked: true, description: 'Completed a high-altitude trek.' },
    { name: 'Culture Vulture', icon: HomeIcon, unlocked: true, description: 'Visited 3+ heritage sites.' },
    { name: 'Nepal Nomad', icon: MapIcon, unlocked: false, description: 'Visited all 7 provinces of Nepal.' },
];

const allPreferences = ['Adventure', 'Relaxation', 'Cultural', 'Foodie', 'Budget', 'Luxury', 'Nature', 'Spiritual'];

const faqs = [
    {
        q: "How does the AI Trip Planner work?",
        a: "Our AI Trip Planner uses advanced language models to create personalized itineraries. You just need to provide a prompt with your interests, duration, budget, and any other preferences, and the AI will generate a detailed, day-by-day plan for your trip to Nepal."
    },
    {
        q: "Is my personal data safe?",
        a: "Yes, we take your privacy seriously. All personal data is stored securely and is never shared with third parties. Your travel preferences are only used to enhance your in-app AI recommendations."
    },
    {
        q: "Can I use the app offline?",
        a: "Currently, core features like the AI Trip Planner and AI Assistant require an internet connection. We are working on adding more offline capabilities, such as offline maps and saved itineraries, in a future update."
    },
    {
        q: "How do I add custom emergency contacts?",
        a: "On the Home screen, scroll down to the 'My Emergency Contacts' section. Tap the '+ Add' button, fill in the name and phone number, and click 'Save'. Your contacts will be stored locally on your device for quick access."
    }
];


// --- COMPONENT PROPS ---

interface ProfileScreenProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// --- HELPER FUNCTIONS & COMPONENTS ---

const getStatusChip = (status: string) => {
    switch (status) {
        case 'Upcoming': return 'bg-blue-500/20 text-blue-300';
        case 'Saved': return 'bg-yellow-500/20 text-yellow-300';
        case 'Completed': return 'bg-green-500/20 text-green-300';
        default: return 'bg-gray-700 text-gray-300';
    }
}

const EditProfileModal: React.FC<{
    user: User;
    onClose: () => void;
    onSave: (updatedUser: User) => void;
}> = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar);

    const handleSave = () => {
        onSave({ ...user, name, avatar });
        onClose();
    };

    return (
        <div className="fixed inset-0 max-w-md mx-auto z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1E] w-[90%] rounded-2xl p-6 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 mt-1 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Avatar URL</label>
                        <input type="text" value={avatar} onChange={e => setAvatar(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 mt-1 text-gray-900 dark:text-white" />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-teal-500 text-black font-semibold">Save</button>
                </div>
            </div>
        </div>
    );
};

const HelpAndFaq: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Help & FAQ</h1>
            </div>
            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                        <button 
                            onClick={() => handleToggle(index)} 
                            className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                            aria-expanded={openIndex === index}
                        >
                            <span className="font-semibold pr-2">{faq.q}</span>
                            <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                        </button>
                        {openIndex === index && (
                            <div className="px-4 pb-4 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800">
                                <p className="pt-3">{faq.a}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- LOGGED IN VIEW ---

const LoggedInProfile: React.FC<{ 
    user: User;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onSignOut: () => void; 
    onDelete: () => void; 
    onUpdateUser: (user: User) => void;
    onShowHelp: () => void;
}> = ({ user, theme, toggleTheme, onSignOut, onDelete, onUpdateUser, onShowHelp }) => {
    const [activeTab, setActiveTab] = useState('trips');
    const [isEditing, setIsEditing] = useState(false);
    const [preferences, setPreferences] = useState<string[]>([]);
    const [savedPosts, setSavedPosts] = useState<FeedPost[]>([]);
    
    useEffect(() => {
        const savedPrefs = localStorage.getItem('travelPreferences');
        if (savedPrefs) {
            setPreferences(JSON.parse(savedPrefs));
        }
    }, []);

    // Effect to load saved posts when the 'saved' tab is active
    useEffect(() => {
        if (activeTab === 'saved') {
            try {
                const allPostsRaw = localStorage.getItem('feedPosts');
                if (allPostsRaw) {
                    const allPosts: FeedPost[] = JSON.parse(allPostsRaw);
                    const userSavedPosts = allPosts.filter(p => p.isSaved);
                    setSavedPosts(userSavedPosts);
                }
            } catch (e) {
                console.error("Failed to load saved posts from localStorage", e);
            }
        }
    }, [activeTab]);

    const handleTogglePreference = (pref: string) => {
        setPreferences(prev => 
            prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
        );
    };

    const handleSavePreferences = () => {
        localStorage.setItem('travelPreferences', JSON.stringify(preferences));
        alert("Preferences Saved!"); // Simple confirmation
    };

    return (
        <div className="space-y-6 pb-6">
            {isEditing && <EditProfileModal user={user} onClose={() => setIsEditing(false)} onSave={onUpdateUser} />}
            
            {/* Header */}
            <div>
                 <h1 className="text-2xl font-bold">My Profile</h1>
                 <p className="text-gray-500 dark:text-gray-400">Manage your trips and preferences.</p>
            </div>

            {/* User Info Card */}
            <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4">
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-2 border-teal-500 dark:border-teal-400" />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                             <h2 className="text-xl font-bold">{user.name}</h2>
                             <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            <EditIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    <span className="mt-2 inline-block text-xs bg-yellow-500/30 text-yellow-700 dark:text-yellow-200 px-3 py-1 rounded-full border border-yellow-500/50">{user.level}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 p-3 rounded-xl">
                    <p className="text-xl font-bold">{user.stats.trips}</p><p className="text-xs text-gray-500 dark:text-gray-400">Trips</p>
                </div>
                <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 p-3 rounded-xl">
                    <p className="text-xl font-bold">{user.stats.countries}</p><p className="text-xs text-gray-500 dark:text-gray-400">Countries</p>
                </div>
                <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 p-3 rounded-xl">
                    <p className="text-xl font-bold">{user.stats.days}</p><p className="text-xs text-gray-500 dark:text-gray-400">Days</p>
                </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="bg-gray-100 dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-full p-1 grid grid-cols-4 gap-1">
                <button onClick={() => setActiveTab('trips')} className={`w-full py-2 rounded-full text-xs font-semibold transition-colors ${activeTab === 'trips' ? 'bg-teal-500 text-black' : 'text-gray-700 dark:text-gray-300'}`}>Trips</button>
                <button onClick={() => setActiveTab('saved')} className={`w-full py-2 rounded-full text-xs font-semibold transition-colors ${activeTab === 'saved' ? 'bg-teal-500 text-black' : 'text-gray-700 dark:text-gray-300'}`}>Saved</button>
                <button onClick={() => setActiveTab('badges')} className={`w-full py-2 rounded-full text-xs font-semibold transition-colors ${activeTab === 'badges' ? 'bg-teal-500 text-black' : 'text-gray-700 dark:text-gray-300'}`}>Badges</button>
                <button onClick={() => setActiveTab('prefs')} className={`w-full py-2 rounded-full text-xs font-semibold transition-colors ${activeTab === 'prefs' ? 'bg-teal-500 text-black' : 'text-gray-700 dark:text-gray-300'}`}>Prefs</button>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'trips' && (
                    <div className="space-y-3 animate-fadeIn">
                        {myTrips.map(trip => (
                            <div key={trip.title} className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold">{trip.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">📍 {trip.location}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusChip(trip.status)}`}>{trip.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {activeTab === 'saved' && (
                    <div className="animate-fadeIn">
                        {savedPosts.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1">
                                {savedPosts.map(post => (
                                    <div key={post.id} className="relative aspect-square group cursor-pointer">
                                        <img src={post.image} alt={post.location} className="w-full h-full object-cover rounded-md" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 rounded-md">
                                            <p className="text-white text-xs font-bold truncate">{post.location}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <BookmarkIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                                <p className="font-semibold">No Saved Posts</p>
                                <p className="text-sm mt-1">Tap the bookmark icon on a post in the feed to save it for later.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'badges' && (
                    <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                        {achievements.map(badge => (
                            <div key={badge.name} className={`bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center ${!badge.unlocked && 'opacity-50'}`}>
                                <badge.icon className={`w-8 h-8 mx-auto mb-2 ${badge.unlocked ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-500'}`} />
                                <h3 className="text-sm font-bold">{badge.name}</h3>
                                <p className="text-xs text-gray-500">{badge.description}</p>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'prefs' && (
                    <div className="animate-fadeIn">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Select your travel styles to get personalized AI recommendations.</p>
                        <div className="flex flex-wrap gap-2">
                           {allPreferences.map(pref => (
                               <button 
                                key={pref}
                                onClick={() => handleTogglePreference(pref)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${preferences.includes(pref) ? 'bg-teal-100 border-teal-400 text-teal-800 dark:bg-teal-500/20 dark:border-teal-400 dark:text-teal-300' : 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}
                               >
                                {pref}
                               </button>
                           ))}
                        </div>
                        <button onClick={handleSavePreferences} className="mt-4 w-full bg-teal-500 text-black font-semibold py-2.5 rounded-lg">Save Preferences</button>
                    </div>
                )}
            </div>

            {/* Settings & Danger Zone */}
            <div className="space-y-4 pt-4">
                 <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl divide-y divide-gray-200 dark:divide-gray-800">
                    <button className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-t-2xl"><span className="flex items-center gap-3"><SettingsIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> Account Settings</span><span className="text-gray-500 dark:text-gray-400">&gt;</span></button>
                    
                    <div className="p-4 flex justify-between items-center hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                        <span className="flex items-center gap-3"><BellIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> Notifications</span>
                         <button className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors ${theme === 'dark' ? 'bg-teal-500 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'}`}>
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                    </div>

                    <div className="p-4 flex justify-between items-center hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                        <span className="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-500 dark:text-gray-400"><circle cx="12" cy="12" r="10"/><path d="m12 16.5-3-3 3-3 3 3-3 3zM12 7.5V4M12 20v-3.5"/></svg> Dark Mode</span>
                        <button onClick={toggleTheme} className={`w-10 h-6 rounded-full p-1 flex items-center transition-colors ${theme === 'dark' ? 'bg-teal-500 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'}`}>
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                    </div>

                    <button className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-100/50 dark:hover:bg-gray-800/50"><span className="flex items-center gap-3"><ShieldIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> Privacy Policy</span><span className="text-gray-500 dark:text-gray-400">&gt;</span></button>
                    <button onClick={onShowHelp} className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-100/50 dark:hover:bg-gray-800/50"><span className="flex items-center gap-3"><HelpCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> Help & Support</span><span className="text-gray-500 dark:text-gray-400">&gt;</span></button>
                    <button onClick={onSignOut} className="w-full text-left p-4 flex justify-between items-center hover:bg-red-500/10 dark:hover:bg-red-500/10 rounded-b-2xl">
                        <span className="flex items-center gap-3 font-semibold text-red-600 dark:text-red-400">
                            <LogOutIcon className="w-5 h-5" /> Sign Out
                        </span>
                    </button>
                </div>
                 <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-2xl p-4 flex justify-between items-center">
                     <div>
                         <h3 className="font-semibold text-red-800 dark:text-red-300">Delete Account</h3>
                         <p className="text-xs text-red-600 dark:text-red-400/80">Permanently delete all your data.</p>
                     </div>
                     <button onClick={onDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                         Delete
                     </button>
                 </div>
            </div>
             <style>{`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              .animate-fadeIn { animation: fadeIn 0.3s ease-in-out forwards; }
            `}</style>
        </div>
    );
};

// --- GUEST VIEW ---

const GuestProfile: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => (
    <div className="flex flex-col items-center justify-center text-center h-full pt-16">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6 border-2 border-gray-200 dark:border-gray-700">
            <ProfileIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold">Create Your Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-2 mb-8">
            Save trips, track your adventures, and get personalized recommendations from our AI.
        </p>
        <button 
            onClick={onSignIn}
            className="w-full max-w-sm flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-md"
        >
            <GoogleIcon className="w-6 h-6" />
            Sign in with Google
        </button>
    </div>
);

// --- MAIN WRAPPER COMPONENT ---

const ProfileScreen: React.FC<ProfileScreenProps> = ({ theme, toggleTheme }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<'profile' | 'help'>('profile');

    // Check localStorage on initial render
    useEffect(() => {
        const loggedInStatus = localStorage.getItem('isLoggedIn');
        if (loggedInStatus === 'true') {
            const savedUser = localStorage.getItem('userData');
            setIsLoggedIn(true);
            setUser(savedUser ? JSON.parse(savedUser) : defaultUser);
        }
    }, []);

    const handleSignIn = () => {
        setIsLoggedIn(true);
        setUser(defaultUser);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(defaultUser));
    };

    const handleSignOut = () => {
        setIsLoggedIn(false);
        setUser(null);
        setCurrentView('profile'); // Reset view on sign out
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.removeItem('travelPreferences');
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
            handleSignOut();
        }
    };
    
    const handleUpdateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
    };

    return (
        <div className="p-4">
            {isLoggedIn && user ? (
                currentView === 'profile' ? (
                    <LoggedInProfile 
                        user={user} 
                        theme={theme}
                        toggleTheme={toggleTheme}
                        onSignOut={handleSignOut} 
                        onDelete={handleDeleteAccount} 
                        onUpdateUser={handleUpdateUser}
                        onShowHelp={() => setCurrentView('help')}
                    />
                ) : (
                    <HelpAndFaq onBack={() => setCurrentView('profile')} />
                )
            ) : (
                <GuestProfile onSignIn={handleSignIn} />
            )}
        </div>
    );
};

export default ProfileScreen;