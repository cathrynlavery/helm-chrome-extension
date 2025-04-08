import React, { useState, useEffect } from 'react';
import { useFocus } from '../contexts/FocusContext';
import FocusTimer from '../components/FocusTimer';
import { DailyTargets } from '../components/DailyTargets';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BarChart2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRandomQuote } from '../lib/quotes';
import HelmLogo from '../components/HelmLogo';

const FocusSession: React.FC = () => {
  const { activeProfile, isLoading, stats, focusTimer } = useFocus();
  const [quote, setQuote] = useState(getRandomQuote());
  
  // Rotate quote every 2 minutes when not in focus session
  useEffect(() => {
    if (!focusTimer.state.isRunning) {
      const interval = setInterval(() => {
        setQuote(getRandomQuote());
      }, 120000);
      
      return () => clearInterval(interval);
    }
  }, [focusTimer.state.isRunning]);
  
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
  
  // Enhanced seamless background styles that transition from light to dark
  const lightBackground = {
    background: 'radial-gradient(circle at center, #F7F5F0 0%, #ECE7DF 100%)',
    transition: 'all 0.8s ease-in-out'
  };
  
  const darkBackground = {
    background: '#0E0E0E',
    transition: 'all 0.8s ease-in-out'
  };
  
  const backgroundStyle = focusTimer.state.isRunning ? darkBackground : lightBackground;
  
  return (
    <div 
      className={`min-h-screen flex flex-col ${focusTimer.state.isRunning ? 'dark' : ''}`}
      style={backgroundStyle}
    >
      <div className="noise-overlay"></div>
      
      {/* Ambient glow behind timer - only visible in focus mode */}
      {focusTimer.state.isRunning && (
        <div 
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.08) 0%, rgba(0, 0, 0, 0) 70%)'
          }}
        ></div>
      )}
      
      <header className={`py-6 px-6 md:px-8 flex items-center justify-between backdrop-blur-sm transition-all duration-700
        ${focusTimer.state.isRunning 
          ? 'bg-transparent' 
          : 'bg-transparent'}`}
      >
        <div className="flex items-center group cursor-pointer hover:opacity-85 transition-opacity pl-1 md:pl-2">
          <HelmLogo size={32} className="group-hover:scale-105 transition-transform duration-300" />
          <h1 className={`ml-3 text-xl ibm-plex-mono-regular tracking-wide transition-all duration-500
            ${focusTimer.state.isRunning
              ? 'text-[#CDAA7A]'
              : 'text-[#333333] dark:text-[#333333]'}`}
          >
            Helm
          </h1>
        </div>
        
        {/* Stats summary removed - now only shown in the main timer component */}
        
        {/* Only show dashboard link when not in focus mode */}
        {!focusTimer.state.isRunning && (
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center bg-transparent border border-[#CDAA7A]/40 hover:border-[#CDAA7A]/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-[12px] ibm-plex-mono-regular py-5 px-6 mr-1 md:mr-2"
            >
              <BarChart2 className="h-4 w-4 mr-2 text-[#CDAA7A]" />
              <span className="text-[#333333] dark:text-[#333333]">View Dashboard</span>
            </Button>
          </Link>
        )}
      </header>
      
      <main className={`flex-grow flex flex-col items-center p-6 
        ${focusTimer.state.isRunning ? 'pt-8' : 'pt-16'}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto w-full text-center"
        >
          {/* Quote moved below Daily Targets */}
          
          {/* Active profile indicator - moved inside focus timer component */}
          
          {/* Focus Timer - Now the centerpiece with enhanced UI */}
          <div className="mb-16 max-w-xl mx-auto">
            <FocusTimer 
              streakCount={stats.streaks.current} 
              showProfileSelector={!focusTimer.state.isRunning}
            />
          </div>
          
          {/* Only show daily targets when in focus mode or on initial load */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            <DailyTargets editable={!focusTimer.state.isRunning} />
          </motion.div>
          
          {/* Single Inspirational Quote below targets - Only show when not in a focus session */}
          {!focusTimer.state.isRunning && (
            <motion.div 
              key={quote.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 max-w-xl mx-auto"
            >
              <p className="libre-baskerville-italic text-lg leading-relaxed text-gray-700 dark:text-gray-300 opacity-70">
                "{quote.text}"
              </p>
              <p className="libre-baskerville-regular text-sm text-muted-foreground opacity-60 mt-2">— {quote.author}</p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default FocusSession;