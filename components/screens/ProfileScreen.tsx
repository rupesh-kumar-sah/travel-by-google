
import React from 'react';

const user = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    avatarInitials: 'JD',
    level: 'Adventurer Level 3',
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

const QuickActionButton: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
    <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
        <div className="text-2xl">{icon}</div>
        <span className="text-sm">{label}</span>
    </div>
);

const ProfileScreen: React.FC = () => {
    const getStatusChip = (status: string) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-500/20 text-blue-300';
            case 'Saved': return 'bg-yellow-500/20 text-yellow-300';
            case 'Completed': return 'bg-green-500/20 text-green-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    }
    return (
        <div className="p-4 space-y-6">
            <div className="bg-gradient-to-br from-teal-900/50 to-gray-900/50 border border-teal-500/30 rounded-2xl p-5 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-4xl font-bold mb-3">
                    {user.avatarInitials}
                </div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-400">{user.email}</p>
                <span className="mt-2 text-xs bg-teal-500/30 text-teal-200 px-3 py-1 rounded-full">{user.level}</span>
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
                <h2 className="text-xl font-bold mb-3">Preferences</h2>
                <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl divide-y divide-gray-800">
                    <div className="p-4 flex justify-between items-center">
                        <label htmlFor="dark-mode" className="flex items-center gap-3">🌙 Dark Mode</label>
                        <input type="checkbox" id="dark-mode" className="toggle-switch" defaultChecked/>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                        <label htmlFor="notifications" className="flex items-center gap-3">🔔 Notifications</label>
                        <input type="checkbox" id="notifications" className="toggle-switch" defaultChecked/>
                    </div>
                     <div className="p-4 flex justify-between items-center">
                        <span className="flex items-center gap-3">🌐 Language</span>
                        <span className="text-gray-400">English &gt;</span>
                    </div>
                </div>
            </div>
            
             <div>
                <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                    <QuickActionButton icon="🔖" label="Saved Places" />
                    <QuickActionButton icon="❤️" label="Favorites" />
                    <QuickActionButton icon="📍" label="Check-ins" />
                    <QuickActionButton icon="⚙️" label="Settings" />
                </div>
            </div>
             <style>{`
                .toggle-switch {
                    appearance: none;
                    width: 40px;
                    height: 22px;
                    background-color: #374151;
                    border-radius: 9999px;
                    position: relative;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .toggle-switch:checked {
                    background-color: #14B8A6;
                }
                .toggle-switch::before {
                    content: '';
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    background-color: white;
                    border-radius: 9999px;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.2s;
                }
                .toggle-switch:checked::before {
                    transform: translateX(18px);
                }
             `}</style>
        </div>
    );
};

export default ProfileScreen;
