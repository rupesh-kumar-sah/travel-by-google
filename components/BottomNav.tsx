import React from 'react';
import { Screen } from '../types';
import { HomeIcon, PlannerIcon, MapIcon, FeedIcon, ProfileIcon } from './Icons';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const navItems = [
  { screen: Screen.Home, label: 'Home', icon: HomeIcon },
  { screen: Screen.Planner, label: 'Planner', icon: PlannerIcon },
  { screen: Screen.Map, label: 'Map', icon: MapIcon },
  { screen: Screen.Feed, label: 'Feed', icon: FeedIcon },
  { screen: Screen.Profile, label: 'Profile', icon: ProfileIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-[#181818]/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700/50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => setActiveScreen(item.screen)}
              className={`flex flex-col items-center justify-center w-full transition-all duration-300 ${isActive ? 'text-teal-500 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
               {isActive && <div className="w-1 h-1 bg-teal-500 dark:bg-teal-400 rounded-full mt-1"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;