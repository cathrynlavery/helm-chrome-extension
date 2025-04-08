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
    backgroundColor: '#f8f8f8',
    backgroundSize: 'cover',
    transition: 'all 0.8s ease-in-out'
  };
  
  const darkBackground = {
    backgroundColor: '#0E0E0E',
    backgroundSize: 'cover',
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
      
      <header className={`py-4 px-6 flex items-center justify-between backdrop-blur-sm transition-all duration-700
        ${focusTimer.state.isRunning 
          ? 'bg-transparent' 
          : 'bg-transparent'}`}
      >
        <div className="flex items-center">
          <HelmLogo size={28} />
          <h1 className={`ml-2 text-xl font-medium transition-all duration-500
            ${focusTimer.state.isRunning
              ? 'bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'}`}
          >
            Helm
          </h1>
        </div>
        
        {/* Stats summary - shown in header when not in session */}
        {!focusTimer.state.isRunning && (
          <div className="hidden md:flex items-center space-x-4 text-sm">
            {stats.streaks.current > 0 && (
              <div className="flex items-center text-amber-500 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20">
                <Flame className="h-4 w-4 mr-1" />
                <span className="font-medium">{stats.streaks.current} day streak</span>
              </div>
            )}
          </div>
        )}
        
        {/* Only show dashboard link when not in focus mode */}
        {!focusTimer.state.isRunning && (
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-300"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>
          </Link>
        )}
      </header>
      
      <main className={`flex-grow flex flex-col items-center p-6 pt-12 
        ${focusTimer.state.isRunning ? 'pt-8' : 'pt-12'}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto w-full text-center"
        >
          {/* Inspirational Quote - Only show when not in a focus session */}
          {!focusTimer.state.isRunning && (
            <motion.div 
              key={quote.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-medium mb-3 leading-relaxed text-gray-800 dark:text-gray-200">
                "{quote.text}"
              </h2>
              <p className="text-sm text-muted-foreground">— {quote.author}</p>
            </motion.div>
          )}
          
          {/* Active profile indicator - moved inside focus timer component */}
          
          {/* Focus Timer - Now the centerpiece with enhanced UI */}
          <div className="mb-12 max-w-xl mx-auto">
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
            className="max-w-lg mx-auto"
          >
            <DailyTargets editable={!focusTimer.state.isRunning} />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default FocusSession;