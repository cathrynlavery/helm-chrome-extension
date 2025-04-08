import React, { useState, useEffect } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, RefreshCw, CheckCircle, Timer, Flame } from 'lucide-react';
import ProfileSelector from './ProfileSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { formatDuration } from '../lib/focusTimer';

interface FocusTimerProps {
  compact?: boolean;
  showProfileSelector?: boolean;
  streakCount?: number;
}

const PRESET_DURATIONS = [15, 30, 45];

const FocusTimer: React.FC<FocusTimerProps> = ({ 
  compact = false, 
  showProfileSelector = true,
  streakCount 
}) => {
  const { focusTimer, activeProfile, stats } = useFocus();
  const { state, start, pause, reset, end } = focusTimer;
  const [customDuration, setCustomDuration] = useState<number | string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  
  const handleStartPause = async () => {
    if (!activeProfile) return;
    
    if (state.isRunning) {
      pause();
    } else {
      // Convert to minutes
      const duration = typeof selectedDuration === 'number' ? selectedDuration : 45;
      // Convert minutes to seconds for the timer
      await start(activeProfile.id, duration * 60);
    }
  };
  
  const handleReset = () => {
    reset();
  };
  
  const handleEndSession = async () => {
    await end();
  };
  
  const handleSelectDuration = (minutes: number) => {
    setSelectedDuration(minutes);
    setCustomDuration("");
  };
  
  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDuration(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedDuration(numValue);
    }
  };
  
  // Calculate the stroke-dashoffset for the progress circle
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference * (1 - state.progress);
  
  const size = compact ? "w-24 h-24" : "w-48 h-48";
  const fontSizeClass = compact ? "text-xl" : "text-3xl";
  
  // Set up color and style based on focus state
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Start a pulsing animation when the timer is running
  useEffect(() => {
    if (state.isRunning) {
      const interval = setInterval(() => {
        setPulseEffect(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [state.isRunning]);
  
  // Enhanced circle size for the premium look
  const enhancedSize = compact ? "w-32 h-32" : "w-64 h-64";
  const enhancedFontSize = compact ? "text-2xl" : "text-4xl";
  const subTextSize = compact ? "text-xs" : "text-sm";
  
  return (
    <div className={`w-full ${state.isRunning ? 'dark' : ''}`}>
      <div 
        className={`w-full rounded-xl backdrop-blur-xl transition-all duration-700 ease-in-out
          ${state.isRunning 
            ? 'bg-gray-900/95 border border-gray-800 shadow-2xl' 
            : 'bg-white/80 dark:bg-gray-800/80 border border-gray-100/30 dark:border-gray-700/30 shadow-lg'
          }`}
      >
        <div className={`p-8 ${compact ? 'py-6' : 'py-10'}`}>
          {showProfileSelector && !state.isRunning && (
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-medium">Focus Session</h3>
              <ProfileSelector />
            </div>
          )}
          
          {/* Streak indicator moved to top for visibility */}
          {streakCount && streakCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-center mb-6 ${state.isRunning ? 'text-amber-400' : 'text-amber-500'}`}
            >
              <div className={`flex items-center px-3 py-1 rounded-full 
                ${state.isRunning 
                  ? 'bg-amber-950/30 text-amber-300' 
                  : 'bg-amber-50 dark:bg-amber-900/20'}`}
              >
                <Flame className="h-4 w-4 mr-1" />
                <span className="font-medium">{streakCount} Day Streak</span>
              </div>
            </motion.div>
          )}
          
          <AnimatePresence mode="wait">
            {state.isRunning ? (
              <motion.div 
                key="timer-running"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="relative inline-flex items-center justify-center mb-8">
                  {/* Glow effect behind the timer */}
                  <div className={`absolute inset-0 rounded-full blur-lg ${pulseEffect ? 'opacity-25' : 'opacity-15'} bg-amber-400 transition-opacity duration-2000`}></div>
                  
                  {/* Main timer circle */}
                  <svg className={`${enhancedSize} transform -rotate-90 relative z-10`} viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle 
                      className="text-gray-700/30 dark:text-gray-600/30" 
                      strokeWidth="3" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="46" 
                      cx="50" 
                      cy="50"
                    />
                    
                    {/* Glow effect for the progress ring */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    
                    {/* Animated progress with glow */}
                    <motion.circle 
                      className="text-amber-400" 
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor" 
                      filter="url(#glow)"
                      fill="transparent" 
                      r="46" 
                      cx="50" 
                      cy="50" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={strokeDashoffset}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: strokeDashoffset }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </svg>
                  
                  {/* Timer text */}
                  <div className="absolute text-center">
                    <motion.div 
                      className={`${enhancedFontSize} font-bold tracking-tight text-white`}
                      key={focusTimer.formattedTime}
                      initial={{ opacity: 0.5, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {focusTimer.formattedTime}
                    </motion.div>
                    {!compact && (
                      <div className={`${subTextSize} text-gray-300 mt-1 font-medium`}>Time Remaining</div>
                    )}
                  </div>
                </div>
                
                {/* Session label - showing active profile being used */}
                {activeProfile && (
                  <div className="mb-8 text-center">
                    <span className="text-gray-300">{activeProfile.name} Focus</span>
                  </div>
                )}
                
                {/* Controls */}
                <div className="flex justify-center space-x-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleEndSession}
                    className="border-gray-700 bg-gray-800/60 text-white hover:bg-gray-700 hover:text-white transition-all duration-300"
                  >
                    <span className="flex items-center px-2">
                      <span className="mr-2">⏹️</span>
                      End Session
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStartPause}
                    className="border-amber-700/50 bg-amber-900/40 text-amber-200 hover:bg-amber-800/60 hover:text-amber-100 transition-all duration-300"
                  >
                    <span className="flex items-center px-2">
                      {state.isRunning ? (
                        <>
                          <span className="mr-2">⏸️</span>
                          Pause
                        </>
                      ) : (
                        <>
                          <span className="mr-2">▶️</span>
                          Resume
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="timer-setup"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                {/* Idle state circular placeholder */}
                <div className="relative inline-flex items-center justify-center mb-8">
                  <svg className={`${enhancedSize} transform -rotate-90`} viewBox="0 0 100 100">
                    <circle 
                      className="text-gray-200 dark:text-gray-700" 
                      strokeWidth="2" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="46" 
                      cx="50" 
                      cy="50"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className={`${compact ? 'text-lg' : 'text-xl'} text-gray-400 dark:text-gray-300 font-medium mb-2`}>
                      Ready to Focus
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-lg font-medium mb-1">Select Focus Duration</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    How long would you like to focus?
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-sm mx-auto">
                    {PRESET_DURATIONS.map(duration => (
                      <Button
                        key={duration}
                        variant={selectedDuration === duration ? "default" : "outline"}
                        className={`py-6 rounded-lg transition-all shadow-sm hover:shadow 
                          ${selectedDuration === duration 
                            ? "bg-primary text-primary-foreground border-primary shadow-md" 
                            : "border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700"}`
                        }
                        onClick={() => handleSelectDuration(duration)}
                      >
                        {duration} min
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-8 w-full max-w-sm mx-auto">
                    <div className="text-sm text-muted-foreground">Custom:</div>
                    <Input
                      type="number"
                      min="1"
                      max="180"
                      value={customDuration}
                      onChange={handleCustomDurationChange}
                      placeholder="minutes"
                      className="w-28 text-center border-gray-200 dark:border-gray-700 focus:border-amber-300 dark:focus:border-amber-600"
                    />
                    <div className="text-sm text-muted-foreground">min</div>
                  </div>
                </div>
                
                {stats && stats.todayMinutes > 0 && (
                  <div className="mb-6 text-sm text-muted-foreground">
                    Today: {formatDuration(stats.todayMinutes)} focused
                  </div>
                )}
                
                <Button
                  size="lg"
                  onClick={handleStartPause}
                  disabled={!activeProfile}
                  className="py-6 px-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Focus Session
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
