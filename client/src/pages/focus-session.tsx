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
  
  // Background gradient styles
  const backgroundStyle = {
    backgroundImage: 'linear-gradient(170deg, rgba(55, 65, 81, 0.03) 0%, rgba(17, 24, 39, 0.06) 100%)',
    backgroundSize: 'cover',
  };
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={backgroundStyle}
    >
      <header className="py-4 px-6 flex items-center justify-between backdrop-blur-sm bg-white/50 dark:bg-black/20 shadow-sm">
        <div className="flex items-center">
          <HelmLogo size={28} />
          <h1 className="ml-2 text-xl font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Helm
          </h1>
        </div>
        
        {/* Stats summary */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          {stats.streaks.current > 0 && (
            <div className="flex items-center text-amber-500 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20">
              <Flame className="h-4 w-4 mr-1" />
              <span className="font-medium">{stats.streaks.current} day streak</span>
            </div>
          )}
        </div>
        
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            View Dashboard
          </Button>
        </Link>
      </header>
      
      <main className="flex-grow flex flex-col items-center p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto w-full text-center"
        >
          {/* Inspirational Quote - Only show when not in a focus session */}
          {!focusTimer.state.isRunning && (
            <motion.div 
              key={quote.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h2 className="text-2xl font-medium mb-2 leading-relaxed text-gray-800 dark:text-gray-200">
                "{quote.text}"
              </h2>
              <p className="text-sm text-muted-foreground">— {quote.author}</p>
            </motion.div>
          )}
          
          {/* Active profile indicator */}
          {activeProfile && !focusTimer.state.isRunning && (
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                Using {activeProfile.name} profile
              </span>
            </div>
          )}
          
          {/* Focus Timer */}
          <div className="mb-8 max-w-md mx-auto">
            <FocusTimer 
              streakCount={stats.streaks.current} 
              showProfileSelector={!focusTimer.state.isRunning}
            />
          </div>
          
          {/* Daily Targets - non-editable during focus session */}
          <div className="max-w-md mx-auto">
            <DailyTargets editable={!focusTimer.state.isRunning} />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default FocusSession;