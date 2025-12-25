import React, { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
import ChatInterface from './components/ChatInterface';
import Stories from './components/Stories';
import AdminDashboard from './components/AdminDashboard';
import Podcasts from './components/Podcasts';
import MusicPlayer from './components/MusicPlayer';
import AuthModal from './components/AuthModal';
import { AppState, UserProfile } from './types';
import { initializeChat } from './services/geminiService';
import { IconMoon, IconSun } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Basic routing logic based on pathname
    const path = window.location.pathname;
    if (path === '/admin') {
      setAppState(AppState.ADMIN);
    }

    try {
        initializeChat();
    } catch (e) {
        console.error("Failed to init chat", e);
    }

    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Load User Profile
    const savedUser = localStorage.getItem('user_profile');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogin = (name: string, isGuest: boolean) => {
      const newUser: UserProfile = { name, isGuest };
      setUser(newUser);
      if (!isGuest) {
          localStorage.setItem('user_profile', JSON.stringify(newUser));
      }
      setShowAuthModal(false);
  };

  const handleLogout = () => {
      // Logout immediately without confirmation for better UX on mobile
      setUser(null);
      localStorage.removeItem('user_profile');
  };

  const handleRequireAuth = () => {
      setShowAuthModal(true);
  };

  const handleStartChat = () => setAppState(AppState.CHAT);
  const handleOpenStories = () => setAppState(AppState.STORIES);
  const handleOpenPodcasts = () => setAppState(AppState.PODCASTS);
  const handleOpenMusic = () => setAppState(AppState.MUSIC);
  const handleBackToWelcome = () => setAppState(AppState.WELCOME);

  const renderContent = () => {
    switch (appState) {
      case AppState.ADMIN:
        return <AdminDashboard onBack={handleBackToWelcome} />;
      case AppState.STORIES:
        return <Stories 
            onBack={handleBackToWelcome} 
            currentUser={user}
            onRequireAuth={handleRequireAuth}
        />;
      case AppState.PODCASTS:
        return <Podcasts onBack={handleBackToWelcome} />;
      case AppState.MUSIC:
        return <MusicPlayer onBack={handleBackToWelcome} />;
      case AppState.CHAT:
        return <ChatInterface 
            onBack={handleBackToWelcome} 
            currentUser={user}
        />;
      case AppState.WELCOME:
      default:
        return <Welcome 
            onStart={handleStartChat} 
            onOpenStories={handleOpenStories}
            onOpenPodcasts={handleOpenPodcasts}
            onOpenMusic={handleOpenMusic}
            currentUser={user}
            onRequireAuth={handleRequireAuth}
            onLogout={handleLogout}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-950 text-soft-text dark:text-slate-200 font-sans selection:bg-sky-200 dark:selection:bg-slate-700 transition-colors duration-300">
      {/* Fixed Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-sky-400 hover:scale-110 transition-all active:scale-95"
        title={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      >
        {isDarkMode ? (
          <IconSun className="w-5 h-5" />
        ) : (
          <IconMoon className="w-5 h-5" />
        )}
      </button>

      {renderContent()}

      {showAuthModal && (
          <AuthModal onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default App;