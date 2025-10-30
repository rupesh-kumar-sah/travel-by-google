
import React from 'react';
import { MountainIcon } from './Icons';

const SplashScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-900 via-black to-gray-900 animate-fadeIn">
      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute w-48 h-48 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gray-500/10 rounded-full blur-3xl"></div>
        
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl mb-4 border border-white/20">
          <MountainIcon className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wider">TravelNepal.ai</h1>
        <p className="text-lg text-gray-300 mt-1">Your AI Travel Companion</p>
      </div>
      <div className="absolute bottom-10 text-gray-500 text-sm">Loading your adventure...</div>
    </div>
  );
};

export default SplashScreen;
