import React, { useState, useEffect } from 'react';
import { useFocus } from '../contexts/FocusContext';
import FocusTimer from '../components/FocusTimer';
import { DailyTargets } from '../components/DailyTargets';
import { Button } from '@/components/ui/button';
import { BarChart2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRandomQuote } from '../lib/quotes';
import HelmLogo from '../components/HelmLogo';
import BestSelfLogo from '../components/BestSelfLogo';
import { useLocation } from 'wouter';

const FocusSession: React.FC = () => {
  const { activeProfile, isLoading, stats, timerState } = useFocus();
  const [quote, setQuote] = useState(getRandomQuote());
  const [, navigate] = useLocation();
  
  // Rotate quote every 2 minutes when not in focus session
  useEffect(() => {
    if (!timerState.isRunning) {
      const interval = setInterval(() => {
        setQuote(getRandomQuote());
      }, 120000);
      
      return () => clearInterval(interval);
    }
  }, [timerState.isRunning]);
  
  // Update the dashboard navigation handler
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('🏠 Dashboard button clicked, navigating to dashboard');
    
    try {
      // Use wouter's navigate function for consistent routing
      navigate('/dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback
      window.location.hash = '#/dashboard';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading...</h2>
          <p className="text-muted-foreground">Setting up your focus environment</p>
        </div>
      </div>
    );
  }
  
  // Consistent background style across dashboard and focus session screens
  const lightBackground = {
    background: '#fbfcfc',
    transition: 'all 0.8s ease-in-out'
  };
  
  const darkBackground = {
    background: '#0E0E0E',
    transition: 'all 0.8s ease-in-out'
  };
  
  const backgroundStyle = timerState.isRunning ? darkBackground : lightBackground;
  
  return (
    <div 
      className={`min-h-screen flex flex-col justify-between ${timerState.isRunning ? 'dark' : ''} transition-all duration-300 ease-out`}
      style={{
        ...backgroundStyle,
        background: timerState.isRunning 
          ? backgroundStyle.background 
          : 'linear-gradient(to bottom, #fbfcfc, #fdfdfd)',
      }}
    >
      <div className="noise-overlay"></div>
      
      {/* Ambient glow behind timer - only visible in focus mode */}
      {timerState.isRunning && (
        <div 
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.08) 0%, rgba(0, 0, 0, 0) 70%)'
          }}
        ></div>
      )}
      
      <header className={`py-6 px-8 md:px-10 flex items-center justify-between backdrop-blur-sm transition-all duration-700 z-10
        ${timerState.isRunning 
          ? 'bg-transparent' 
          : 'bg-transparent'}`}
      >
        {/* Helm Logo aligned with main content */}
        <div className="flex items-center gap-3">
          <HelmLogo 
            size={30} 
            className={`text-[#333333] dark:text-[#CDAA7A] transition-colors duration-300`}
          />
          <span className={`ibm-plex-mono-medium text-lg ${
            timerState.isRunning 
              ? 'text-[#E0E0E0]' 
              : 'text-[#1A1A1A]'
          }`}>
            Helm
          </span>
        </div>
        
        {/* Only show dashboard link when not in focus mode */}
        {!timerState.isRunning && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDashboardClick}
            className="flex items-center bg-transparent border border-[#CDAA7A]/40 hover:border-[#CDAA7A]/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-[12px] ibm-plex-mono-regular py-3 px-5 z-20 relative text-sm"
          >
            <BarChart2 className="h-4 w-4 mr-2 text-[#CDAA7A]" />
            <span className="text-[#333333] dark:text-[#333333]">View Dashboard</span>
          </Button>
        )}
      </header>
      
      <main className={`flex-1 flex flex-col items-center min-h-[75vh] px-6 max-w-[540px] mx-auto w-full transition-all duration-300 ease-out 
        ${!timerState.isRunning ? 'pt-8 pb-12' : 'pt-6 pb-8 justify-center'}`}>
        <FocusTimer />
        
        {/* Hairline divider for Apple-style separation */}
        {!timerState.isRunning && (
          <div className="w-full max-w-xl mx-auto py-5">
            <div className="h-[1px] w-full bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]"></div>
          </div>
        )}
        
        {/* Today's Targets section - Only show when not in focus mode */}
        {!timerState.isRunning && (
          <div className="w-full max-w-xl mx-auto mt-2">
            <DailyTargets />
            
            {/* Quote of the day */}
            <div className="mt-8 text-center">
              <blockquote className="italic text-gray-600 dark:text-gray-300 libre-baskerville-italic text-base">
                "{quote.text}"
              </blockquote>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ibm-plex-mono-regular">— {quote.author}</p>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-5 px-8 md:px-10 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/30">
        <div className="flex items-center gap-2">
          <BestSelfLogo />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">by BestSelf.co</span>
        </div>
      </footer>
    </div>
  );
};

export default FocusSession;