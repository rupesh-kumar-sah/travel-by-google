import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/screens/HomeScreen';
import PlannerScreen from './components/screens/PlannerScreen';
import MapScreen from './components/screens/MapScreen';
import FeedScreen from './components/screens/FeedScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import BottomNav from './components/BottomNav';
import AIAssistant from './components/AIAssistant';
import { Screen } from './types';

export default function App() {
  const [appState, setAppState] = useState('splash'); // splash, onboarding, main
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Home);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState('onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    setAppState('main');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.Home:
        return <HomeScreen />;
      case Screen.Planner:
        return <PlannerScreen />;
      case Screen.Map:
        return <MapScreen />;
      case Screen.Feed:
        return <FeedScreen />;
      case Screen.Profile:
        return <ProfileScreen theme={theme} toggleTheme={toggleTheme} />;
      default:
        return <HomeScreen />;
    }
  };

  if (appState === 'splash') {
    return <SplashScreen />;
  }

  if (appState === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen w-screen max-w-md mx-auto bg-gray-50 dark:bg-[#0D0D0D] flex flex-col font-sans overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
        {renderScreen()}
      </main>
      <AIAssistant />
      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
}