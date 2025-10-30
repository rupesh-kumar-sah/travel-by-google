import React, { useState, useEffect } from 'react';
import { User } from '../../types';
// FIX: Import `ProfileIcon` to be used in the GuestProfile component.
import { GoogleIcon, LogOutIcon, TrashIcon, ProfileIcon } from '../Icons';

// Mock user data for when the user "logs in"
const mockUser: User = {
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

const getStatusChip = (status: string) => {
    switch (status) {
        case 'Upcoming': return 'bg-blue-500/20 text-blue-300';
        case 'Saved': return 'bg-yellow-500/20 text-yellow-300';
        case 'Completed': return 'bg-green-500/20 text-green-300';
        default: return 'bg-gray-700 text-gray-300';
    }
}

// Logged-in user view
const LoggedInProfile: React.FC<{ user: User; onSignOut: () => void; onDelete: () => void }> = ({ user, onSignOut, onDelete }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold">My Profile</h1>
             <button onClick={onSignOut} className="flex items-center gap-2 text-sm bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-gray-300 hover:bg-gray-700 transition-colors">
                 <LogOutIcon className="w-4 h-4" />
                 <span>Sign Out</span>
             </button>
        </div>

        <div className="bg-gradient-to-br from-teal-900/50 to-gray-900/50 border border-teal-500/30 rounded-2xl p-5 flex flex-col items-center text-center">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mb-3 border-2 border-teal-400" />
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-400">{user.email}</p>
            <span className="mt-2 text-xs bg-yellow-500/30 text-yellow-200 px-3 py-1 rounded-full border border-yellow-500/50">{user.level}</span>
            <div className="flex justify-around w-full mt-4 pt-4 border-t border-gray-700/50">
                <div>
                    <p className="text-xl font-bold">{user.stats.trips}</p>
                    <p className="text-xs text-gray-400">Trips</p>
                </div>
                <div>
                    <p className="text-xl font-bold">{user.stats.countries}</p>
                    <p className="text-xs text-gray-400">Countries</p>
                </div>
                <div>
                    <p className="text-xl font-bold">{user.stats.days}</p>
                    <p className="text-xs text-gray-400">Days</p>
                </div>
            </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">My Trips</h2>
                <a href="#" className="text-sm text-teal-400">View all</a>
            </div>
            <div className="space-y-3">
                {myTrips.map(trip => (
                    <div key={trip.title} className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold">{trip.title}</h3>
                                <p className="text-sm text-gray-400">📍 {trip.location}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusChip(trip.status)}`}>{trip.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">🕒 {trip.date}</p>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h2 className="text-xl font-bold mb-3">Settings</h2>
            <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl divide-y divide-gray-800">
                <a href="#" className="p-4 flex justify-between items-center hover:bg-gray-800/50"><span>⚙️ Account Settings</span><span className="text-gray-400">&gt;</span></a>
                <a href="#" className="p-4 flex justify-between items-center hover:bg-gray-800/50"><span>💳 Manage Subscription</span><span className="text-gray-400">&gt;</span></a>
                <a href="#" className="p-4 flex justify-between items-center hover:bg-gray-800/50"><span>🔒 Privacy Policy</span><span className="text-gray-400">&gt;</span></a>
                 <a href="#" className="p-4 flex justify-between items-center hover:bg-gray-800/50"><span>❓ Help & Support</span><span className="text-gray-400">&gt;</span></a>
            </div>
        </div>
        
        <div>
             <h2 className="text-xl font-bold text-red-400 mb-3">Danger Zone</h2>
             <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-4 flex justify-between items-center">
                 <div>
                     <h3 className="font-semibold text-red-300">Delete Account</h3>
                     <p className="text-xs text-red-400/80">Permanently delete all your data.</p>
                 </div>
                 <button onClick={onDelete} className="bg-red-500/80 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                     Delete
                 </button>
             </div>
        </div>
    </div>
);

// Guest view
const GuestProfile: React.FC<{ onSignIn: () => void }> = ({ onSignIn }) => (
    <div className="flex flex-col items-center justify-center text-center h-full pt-16">
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6 border-2 border-gray-700">
            <ProfileIcon className="w-12 h-12 text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold">Create Your Profile</h1>
        <p className="text-gray-400 max-w-xs mt-2 mb-8">
            Save trips, track your adventures, and get personalized recommendations from our AI.
        </p>
        <button 
            onClick={onSignIn}
            className="w-full max-w-sm flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
            <GoogleIcon className="w-6 h-6" />
            Sign in with Google
        </button>
    </div>
);


const ProfileScreen: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    // Check localStorage on initial render
    useEffect(() => {
        const loggedInStatus = localStorage.getItem('isLoggedIn');
        if (loggedInStatus === 'true') {
            setIsLoggedIn(true);
            setUser(mockUser);
        }
    }, []);

    const handleSignIn = () => {
        setIsLoggedIn(true);
        setUser(mockUser);
        localStorage.setItem('isLoggedIn', 'true');
    };

    const handleSignOut = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
            handleSignOut(); // For this mock, deleting is the same as signing out
        }
    };

    return (
        <div className="p-4">
            {isLoggedIn && user ? (
                <LoggedInProfile user={user} onSignOut={handleSignOut} onDelete={handleDeleteAccount} />
            ) : (
                <GuestProfile onSignIn={handleSignIn} />
            )}
        </div>
    );
};

export default ProfileScreen;
