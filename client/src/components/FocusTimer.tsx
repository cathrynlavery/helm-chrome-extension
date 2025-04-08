import React, { useState, useEffect } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, RefreshCw, CheckCircle, Timer, Flame, StopCircle } from 'lucide-react';
import ProfileSelector from './ProfileSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { formatDuration, FocusTimer as FocusTimerClass, TimerState } from '../lib/focusTimer';
import DynamicIcon from './DynamicIcon';

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
  
  // Emergency reset functionality moved to global component
  
  const handleStartPause = async () => {
    console.log('🔍 handleStartPause triggered, active profile:', activeProfile?.name);
    if (!activeProfile) {
      console.log('⚠️ No active profile, cannot start/pause');
      alert("Please select a focus profile first");
      return;
    }
    
    console.log('📊 Current timer state:', {
      isRunning: state.isRunning,
      timeRemaining: state.timeRemaining,
      progress: state.progress
    });
    
    if (state.isRunning) {
      console.log('⏸️ PAUSING TIMER');
      try {
        // Direct access to timer instance for most reliable pause
        const timer = FocusTimerClass.getInstance();
        timer.pause();
        console.log('✅ Timer pause function called via direct timer instance');
      } catch (err) {
        console.error('❌ ERROR PAUSING TIMER:', err);
        
        // Fallback to context method
        try {
          pause();
          console.log('✅ Timer pause function called via context (fallback)');
        } catch (innerErr) {
          console.error('💥 CRITICAL: Even fallback pause failed:', innerErr);
          alert("Failed to pause timer. Try the emergency reset button.");
        }
      }
    } else {
      // Convert to minutes
      const duration = typeof selectedDuration === 'number' ? selectedDuration : 45;
      console.log('▶️ STARTING TIMER with duration:', duration, 'minutes');
      
      // Convert minutes to seconds for the timer
      try {
        console.log('📝 Calling start() with:', activeProfile.id, duration * 60);
        await start(activeProfile.id, duration * 60);
        console.log('✅ Timer start function completed');
      } catch (error) {
        console.error('❌ ERROR STARTING TIMER:', error);
        alert("Failed to start timer. Please try again.");
      }
    }
  };
  
  const handleReset = () => {
    console.log('🔄 Reset called');
    reset();
    console.log('✅ Timer reset completed');
  };
  
  const handleEndSession = async () => {
    console.log('🛑 END SESSION called');
    console.log('📊 Current timer state before end:', {
      isRunning: state.isRunning,
      timeRemaining: state.timeRemaining,
      progress: state.progress
    });
    
    // Direct approach with timer instance first (most reliable)
    try {
      const timer = FocusTimerClass.getInstance();
      console.log('📝 Calling end() via direct timer instance');
      await timer.end();
      console.log('✅ End session function completed via direct timer instance');
      return; // Exit early on success
    } catch (directError) {
      console.error('❌ ERROR ENDING SESSION (direct method):', directError);
    }
    
    // Fallback to context method
    try {
      console.log('📝 Calling end() function via context (fallback)');
      await end();
      console.log('✅ End session function completed via context');
    } catch (contextError) {
      console.error('❌ ERROR ENDING SESSION (context method):', contextError);
      
      // Last resort: emergency reset
      console.log('⚠️ Attempting emergency reset as final fallback');
      try {
        const timer = FocusTimerClass.getInstance();
        await timer.emergencyReset();
        console.log('🆘 Emergency reset completed as final fallback');
      } catch (innerError) {
        console.error('💥 CRITICAL: Even emergency reset failed:', innerError);
        alert("Failed to end session. Please try refreshing the page.");
      }
    }
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
  
  // Force component to update when timer state changes
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Add a timer state listener to force update
  useEffect(() => {
    // Subscribe to timer state changes with higher priority
    const timer = FocusTimerClass.getInstance();
    
    const unsubscribe = timer.subscribe((timerState: TimerState) => {
      console.log('🔄 Timer state changed, forcing update:', {
        isRunning: timerState.isRunning,
        timeRemaining: Math.floor(timerState.timeRemaining),
        progress: timerState.progress.toFixed(2)
      });
      // Force update to make sure React re-renders
      setForceUpdate(prev => prev + 1);
    });
    
    // Log the registration
    console.log('⚡️ Registered direct timer listener to force component updates');
    
    return () => {
      unsubscribe();
      console.log('🛑 Removed direct timer listener');
    };
  }, []);
  
  // Enhanced circle size for the premium look
  const enhancedSize = compact ? "w-32 h-32" : "w-64 h-64";
  const enhancedFontSize = compact ? "text-2xl" : "text-4xl";
  const subTextSize = compact ? "text-xs" : "text-sm";
  
  return (
    <div className={`w-full ${state.isRunning ? 'dark' : ''}`}>
      {/* DynamicIcon positioned absolutely at the top-left of the component */}
      <DynamicIcon />
      
      <div 
        className={`w-full rounded-xl transition-all duration-700 ease-in-out
          ${state.isRunning 
            ? 'bg-transparent' 
            : 'bg-transparent'
          }`}
      >
        <div className={`p-8 ${compact ? 'py-6' : 'py-12'}`}>
          {showProfileSelector && !state.isRunning && (
            <div className="flex items-center justify-between mb-12">
              {/* Profile name as heading instead of "Focus Session" */}
              <div className="profile-label">
                <ProfileSelector />
              </div>
            </div>
          )}
          
          {/* Streak indicator only appears once, at the top for visibility */}
          {streakCount && streakCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-center mb-10 ${state.isRunning ? 'text-primary/90' : 'text-primary'}`}
            >
              <div className={`flex items-center px-4 py-2 rounded-full 
                ${state.isRunning 
                  ? 'bg-primary/10 text-primary/90 border border-primary/20' 
                  : 'bg-primary/10 border border-primary/20'}`}
              >
                <Flame className="h-4 w-4 mr-2" />
                <span className="ibm-plex-mono-medium">{streakCount} Day Streak</span>
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
                  {/* Enhanced glow effect layers behind the timer */}
                  <div className={`absolute w-full h-full rounded-full blur-3xl ${pulseEffect ? 'opacity-20' : 'opacity-10'} bg-primary transition-opacity duration-2000`}></div>
                  <div className={`absolute w-3/4 h-3/4 rounded-full blur-xl ${pulseEffect ? 'opacity-30' : 'opacity-20'} bg-primary transition-opacity duration-2000`}></div>
                  
                  {/* Main timer circle */}
                  <svg className={`${enhancedSize} transform -rotate-90 relative z-10`} viewBox="0 0 100 100">
                    {/* Background circle - almost invisible */}
                    <circle 
                      className="text-gray-800/10" 
                      strokeWidth="1" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="47" 
                      cx="50" 
                      cy="50"
                    />
                    
                    {/* Enhanced glow effects */}
                    <defs>
                      <filter id="outerGlow" height="300%" width="300%" x="-100%" y="-100%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feFlood floodColor="#CDAA7A" floodOpacity="0.8" result="glowColor" />
                        <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
                        <feMerge>
                          <feMergeNode in="softGlow"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Animated progress with enhanced glow */}
                    <motion.circle 
                      className="text-primary" 
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      stroke="currentColor" 
                      filter="url(#outerGlow)"
                      fill="transparent" 
                      r="47" 
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
                      className={`${enhancedFontSize} timer-digits text-white`}
                      key={focusTimer.formattedTime}
                      initial={{ opacity: 0.5, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {focusTimer.formattedTime}
                    </motion.div>
                    {!compact && (
                      <div className={`${subTextSize} timer-label text-gray-300 mt-1`}>Time Remaining</div>
                    )}
                  </div>
                </div>
                
                {/* Session label - showing active profile name above timer */}
                {activeProfile && (
                  <div className="mb-8 text-center">
                    <div className="profile-label text-center">
                      <span className="text-[1.25rem] heading-text text-gray-100">{activeProfile.name}</span>
                    </div>
                  </div>
                )}
                
                {/* Controls */}
                <div className="flex flex-col items-center">
                  <div className="flex justify-center space-x-6 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('END SESSION BUTTON CLICKED');
                        handleEndSession();
                      }}
                      className="inline-flex items-center justify-center cursor-pointer text-zinc-900 dark:text-zinc-100 rounded-[16px] py-6 px-6 border border-zinc-300 dark:border-zinc-600 hover:border-primary/70 hover:bg-primary/20 hover:text-zinc-900 dark:hover:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ibm-plex-mono-medium"
                    >
                      <StopCircle className="h-5 w-5 mr-2" />
                      End Session
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        console.log('PAUSE/RESUME BUTTON CLICKED', state.isRunning ? 'PAUSING' : 'RESUMING');
                        handleStartPause();
                      }}
                      className="inline-flex items-center justify-center cursor-pointer text-zinc-900 dark:text-zinc-100 rounded-[16px] py-6 px-6 border border-zinc-300 dark:border-zinc-600 hover:border-primary/70 hover:bg-primary/20 hover:text-zinc-900 dark:hover:text-zinc-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ibm-plex-mono-medium"
                    >
                      {state.isRunning ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Resume
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Note: Emergency Reset functionality now moved to global component */}
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
                {/* Idle state circular placeholder with enhanced ambient glow */}
                <div className="relative inline-flex items-center justify-center mb-12 group">
                  {/* Ambient soft glow behind circle with pulse animation when duration selected */}
                  <div className={`absolute w-full h-full rounded-full blur-3xl ${selectedDuration ? 'opacity-10 pulse-glow' : 'opacity-5'} bg-primary group-hover:opacity-15 transition-all duration-700`}></div>
                  <div className={`absolute w-3/4 h-3/4 rounded-full blur-xl ${selectedDuration ? 'opacity-5' : 'opacity-0'} bg-primary transition-all duration-700`}></div>
                  
                  <svg className={`${enhancedSize} transform -rotate-90 transition-all duration-500 group-hover:scale-[1.02]`} viewBox="0 0 100 100">
                    {/* Background circle with subtle inner shadow */}
                    <defs>
                      <filter id="innerShadow">
                        <feGaussianBlur stdDeviation="2" result="blur"/>
                        <feOffset dx="0" dy="0" result="offsetBlur"/>
                        <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
                      </filter>
                    </defs>
                    <circle 
                      className={`${selectedDuration ? 'text-gray-300 dark:text-gray-600' : 'text-gray-200 dark:text-gray-700'}`}
                      strokeWidth="1.2" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="47" 
                      cx="50" 
                      cy="50"
                      filter="url(#innerShadow)"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className={`${compact ? 'text-xl' : 'text-xl'} ibm-plex-mono-medium 
                      ${selectedDuration
                        ? 'text-zinc-900 dark:text-zinc-900 transition-all duration-500'
                        : 'text-zinc-900 dark:text-zinc-900'} mb-2`}>
                      Ready to Focus
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-8 max-w-sm mx-auto">
                  {/* Removed "Select Focus Duration" label per requirements */}
                  
                  <div className="grid grid-cols-3 gap-4 mb-8 w-full mx-auto">
                    {PRESET_DURATIONS.map(duration => (
                      <Button
                        key={duration}
                        variant={selectedDuration === duration ? "default" : "outline"}
                        className={`py-6 rounded-[16px] transition-all duration-400 ibm-plex-mono-medium
                          ${selectedDuration === duration 
                            ? "bg-primary text-zinc-900 border-none hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]" 
                            : "bg-transparent border-gray-200 dark:border-gray-700/50 hover:border-primary/60 hover:bg-primary/20 dark:hover:bg-primary/20 hover:text-zinc-900 dark:hover:text-zinc-900 hover:scale-[1.02]"}`
                        }
                        onClick={() => handleSelectDuration(duration)}
                      >
                        {duration} min
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-4 w-full mx-auto">
                    {/* higher contrast gray */}
                    <div className="ibm-plex-mono-regular text-sm text-[#8E8E8E]">Custom:</div>
                    <Input
                      type="number"
                      min="1"
                      max="180"
                      value={customDuration}
                      onChange={handleCustomDurationChange}
                      placeholder="minutes"
                      className="w-28 text-center rounded-[16px] ibm-plex-mono-regular py-6 px-4 border-gray-200 dark:border-gray-700/50 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent"
                    />
                    {/* higher contrast gray */}
                    <div className="ibm-plex-mono-regular text-sm text-[#8E8E8E]">min</div>
                  </div>
                </div>
                
                <Button
                  size="lg"
                  onClick={() => handleStartPause()}
                  disabled={!activeProfile}
                  className="py-7 px-12 rounded-[16px] mb-6 bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] text-zinc-900 transition-all duration-300 ibm-plex-mono-medium text-base pulse-animation focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Session
                </Button>
                
                {stats && stats.todayMinutes > 0 && (
                  <div className="mb-10 text-sm ibm-plex-mono-regular">
                    {/* higher contrast gray */}
                    <span className="text-[#8E8E8E]">Today: {formatDuration(stats.todayMinutes)} focused</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
