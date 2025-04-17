import React, { useState, useEffect, useRef } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, StopCircle, Flame, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { formatDuration, formatTime } from '../lib/focusTimer';
import DynamicIcon from './DynamicIcon';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Slider,
} from "@/components/ui/slider";
import {
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStorageData, setStorageData } from '@/lib/chromeStorage';

interface FocusTimerProps {
  compact?: boolean;
  showProfileSelector?: boolean;
  streakCount?: number;
}

const PRESET_DURATIONS = [15, 30, 45];

// Messages to rotate for empty state
const EMPTY_STATE_MESSAGES = [
  "Ready to reclaim time",
  "Make today count",
  "Tap to begin your focus",
  "No time reclaimed yet"
];

const FocusTimer: React.FC<FocusTimerProps> = ({ 
  compact = false, 
  showProfileSelector = true,
  streakCount 
}) => {
  const { timerState, startTimer, pauseTimer, activeProfile, stats, profiles, setActiveProfile } = useFocus();
  const [customDuration, setCustomDuration] = useState<number | string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [emptyStateMessageIndex, setEmptyStateMessageIndex] = useState(
    Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)
  );
  const [hasPausedOnce, setHasPausedOnce] = useState(false);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState(300); // 5 minutes in seconds
  const [isInPauseCountdown, setIsInPauseCountdown] = useState(false);
  const [showResumeConfirmation, setShowResumeConfirmation] = useState(false);
  const [buttonScale, setButtonScale] = useState<number | string | null>(null);
  
  // Debug logs for timer state
  console.log("Timer State:", timerState.isRunning, timerState.isPaused);
  console.log("Has Paused Once:", hasPausedOnce);
  
  // Rotate through empty state messages
  useEffect(() => {
    if (!timerState.isRunning && stats?.todayMinutes === 0) {
      const intervalId = setInterval(() => {
        setEmptyStateMessageIndex((prevIndex) => 
          (prevIndex + 1) % EMPTY_STATE_MESSAGES.length
        );
      }, 5000); // Change message every 5 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [timerState.isRunning, stats?.todayMinutes]);
  
  // Effect to handle pause countdown
  useEffect(() => {
    let pauseInterval: NodeJS.Timeout;
    
    if (isInPauseCountdown && timerState.isPaused) {
      pauseInterval = setInterval(() => {
        setPauseTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto-resume when pause time is up
            handleStartPause();
            toast.success("Break time is over! Session resumed.");
            return 300; // Reset for next session
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (pauseInterval) {
        clearInterval(pauseInterval);
      }
    };
  }, [isInPauseCountdown, timerState.isPaused]);
  useEffect(() => {
    if (timerState.isRunning && timerState.timeRemaining === 0) {
      const handleComplete = async () => {
        console.log("⏱️ Session complete. Saving data...");
        await endTimer(true); // Завершуємо зберігаючи прогрес
  
        const today = new Date().toISOString().split('T')[0];
        const storage = await getStorageData();
  
        const minutesToAdd = Math.floor(timerState.totalDuration / 60);
  
        storage.focusHistory[today] = (storage.focusHistory[today] || 0) + minutesToAdd;
  
        // 🔥 Оновлюємо streak
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (storage.streaks.lastActiveDate !== today) {
          if (storage.streaks.lastActiveDate === yesterday) {
            storage.streaks.current += 1;
            storage.streaks.best = Math.max(storage.streaks.current, storage.streaks.best);
          } else {
            storage.streaks.current = 1;
          }
          storage.streaks.lastActiveDate = today;
        }
  
        await setStorageData('helmData', storage);
        console.log("✅ Focus session stats updated.");
      };
  
      handleComplete();
    }
  }, [timerState.timeRemaining, timerState.isRunning]);
  const handleStartPause = async () => {
    console.log("handleStartPause called", { 
      isRunning: timerState.isRunning, 
      isPaused: timerState.isPaused,
      hasPausedOnce
    });
    
    if (!activeProfile) return;

    if (timerState.isRunning) {
      if (timerState.isPaused) {
        // Resuming from pause
        console.log("Resuming from pause");
        setIsInPauseCountdown(false);
        setPauseTimeRemaining(300); // Reset pause timer
        await startTimer(activeProfile.id, selectedDuration * 60); // Use startTimer to resume
        setShowResumeConfirmation(true);
        setTimeout(() => setShowResumeConfirmation(false), 5000); // Hide after 5 seconds
        toast.success("Session resumed. Stay focused!");
      } else {
        // Attempting to pause
        console.log("Attempting to pause");
        if (hasPausedOnce) {
          toast.error("You've already used your pause for this session!");
          return;
        }
        setHasPausedOnce(true);
        setIsInPauseCountdown(true);
        await pauseTimer(); // Call pauseTimer to pause the session
        toast.info("Session paused. You have 5 minutes to resume.");
      }
    } else {
      // Starting new session
      console.log("Starting new session");
      setHasPausedOnce(false);
      setPauseTimeRemaining(300);
      setIsInPauseCountdown(false);
      setShowResumeConfirmation(false);
      await startTimer(activeProfile.id, selectedDuration * 60);
    }
  };
  
  const handleSelectDuration = (duration: number) => {
    setSelectedDuration(duration);
    setIsCustomDuration(!PRESET_DURATIONS.includes(duration));
    
    // Add micro-interaction effect
    setButtonScale(duration);
    setTimeout(() => setButtonScale(null), 300);
  };
  
  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDuration(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedDuration(numValue);
    }
  };

  const handleCustomDurationConfirm = () => {
    const numValue = parseInt(customDuration as string);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedDuration(numValue);
      setShowCustomInput(false);
    }
  };
  
  const toggleCustomInput = () => {
    setShowCustomInput(!showCustomInput);
    if (!showCustomInput) {
      // Focus the input when showing
      setTimeout(() => {
        const input = document.getElementById('custom-duration-input');
        if (input) {
          input.focus();
        }
      }, 0);
    }
  };
  
  const handleSelectProfile = async (id: number) => {
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      await setActiveProfile(profile);
      setIsProfileOpen(false);
    }
  };
  
  // Calculate the stroke-dashoffset for the progress circle
  const outerRadius = 50;
  const stroke = 5;
  const progressStroke = 5.5;
  const innerRadius = outerRadius - stroke / 2;
  const circumference = 2 * Math.PI * innerRadius;
  const strokeDashoffset = circumference * (1 - timerState.progress);
  
  const size = compact ? "w-24 h-24" : "w-48 h-48";
  const fontSizeClass = compact ? "text-xl" : "text-3xl";
  
  // Set up color and style based on focus state
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Start a pulsing animation when the timer is running
  useEffect(() => {
    if (timerState.isRunning) {
      const interval = setInterval(() => {
        setPulseEffect(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [timerState.isRunning]);
  
  // Enhanced circle size for the premium look
  const enhancedSize = compact ? "w-32 h-32" : "w-60 h-60";
  const enhancedFontSize = compact ? "text-xl" : "text-base";
  const subTextSize = compact ? "text-xs" : "text-xs";
  
  const progress = timerState.isRunning ? timerState.progress : 0;
  const progressOffset = circumference - (progress * circumference);
  const formattedMinutes = Math.floor(timerState.timeRemaining / 60).toString().padStart(2, '0');
  const formattedSeconds = Math.floor(timerState.timeRemaining % 60).toString().padStart(2, '0');

  function getSVGPathForCircle(r: number) {
    return `M ${outerRadius},${outerRadius} m 0,-${r} a ${r},${r} 0 1,1 0,${2*r} a ${r},${r} 0 1,1 0,-${2*r}`;
  }
  
  // Format pause time remaining
  const formatPauseTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Add a ref for the parent container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Add event listeners for debugging
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleContainerClick = (e: MouseEvent) => {
      console.log("Container click event captured", e);
    };
    
    container.addEventListener('click', handleContainerClick, true); // true for capturing phase
    
    return () => {
      container.removeEventListener('click', handleContainerClick, true);
    };
  }, []);

  return (
    <div className={`w-full ${timerState.isRunning ? 'dark' : ''}`}>
      <div ref={containerRef} className="flex flex-col items-center max-w-[500px] mx-auto">
        {/* Visual Group 1: Profile + Streak */}
        <div className="flex flex-col items-center mb-6">
          {/* Profile selector with improved styling */}
          {showProfileSelector && (
            <span className="text-xs uppercase text-zinc-500/90 dark:text-zinc-400/90 tracking-wider">
              Space: 
              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger className="ml-1.5 inline-flex items-center normal-case text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:text-[#CDAA7A] transition-colors focus:outline-none">
                  {activeProfile?.name || 'Select Profile'}
                  <ChevronDown className="ml-0.5 h-3 w-3" />
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="center" className="w-48 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl border border-[#CDAA7A]/30 shadow-lg">
                  {profiles.map(profile => (
                    <DropdownMenuItem 
                      key={profile.id}
                      className="cursor-pointer ibm-plex-mono-regular text-zinc-800 dark:text-zinc-200 hover:text-[#CDAA7A] hover:bg-[#CDAA7A]/10 transition-colors text-xs"
                      onClick={() => handleSelectProfile(profile.id)}
                    >
                      {profile.name}
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator className="bg-[#CDAA7A]/20" />
                  
                  <DropdownMenuItem className="text-[#CDAA7A] cursor-pointer ibm-plex-mono-regular hover:text-[#CDAA7A]/80 hover:bg-[#CDAA7A]/10 transition-colors text-xs">
                    <a href="/dashboard" >Manage profiles...</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          )}
          
          {/* Streak indicator with enhanced styling */}
          {stats && stats.streaks.current > 0 && (
            <div className={`flex items-center px-3.5 py-1.5 rounded-full mt-2.5
              ${timerState.isRunning 
                ? 'bg-primary/10 text-primary/90 border border-primary/30' 
                : 'bg-[#F8F5EE] dark:bg-zinc-800/60 border border-[#CDAA7A]/30 text-[#CDAA7A]'}`}
            >
              <Flame className="h-3.5 w-3.5 mr-1.5" />
              <span className="ibm-plex-mono-regular text-xs">{stats.streaks.current}-day streak</span>
            </div>
          )}
        </div>

        {/* Visual Group 2: Focus Circle (Hero Element) with premium enhancements */}
        <div className={`relative ${enhancedSize} mb-8 group cursor-pointer flex justify-center items-center`}>
          {/* Premium ambient glow with larger radius and enhanced opacity */}
          <div className="absolute inset-0 rounded-full blur-[60px] bg-[#CDAA7A]/20 group-hover:bg-[#CDAA7A]/25 transition-all duration-700"></div>
          
          {/* Outer glow ring for layered effect */}
          <div className="absolute -inset-5 rounded-full opacity-70 group-hover:opacity-90 transition-all duration-500">
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#CDAA7A]/25 via-[#CDAA7A]/15 to-transparent blur-3xl"></div>
          </div>
          
          {/* Apple-style soft inner shadow for depth - enhanced */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_3px_25px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_3px_25px_rgba(0,0,0,0.35)]"></div>
          
          {/* Animated glow pulse effect - enhanced */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            animate={{ 
              boxShadow: [
                '0 0 0 rgba(205, 170, 122, 0)', 
                '0 0 35px rgba(205, 170, 122, 0.4)', 
                '0 0 0 rgba(205, 170, 122, 0)'
              ]
            }}
            transition={{ 
              duration: 3, 
              ease: "easeInOut", 
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
          
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle with subtle gradient fill */}
            <circle 
              className="fill-white/5 dark:fill-black/5"
              stroke="none"
              r="48"
              cx="50%" 
              cy="50%"
            />
            
            {/* Secondary inner circle for layered depth */}
            <circle 
              className={`${timerState.isRunning ? 'text-gray-700/40' : 'text-[#CDAA7A]/15 dark:text-gray-500/40'}`}
              strokeWidth="2.5" 
              stroke="currentColor" 
              fill="transparent" 
              r="47"
              cx="50%" 
              cy="50%"
            />
            
            {/* Enhanced gradient definition with more vibrant colors */}
            <defs>
              <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F6E0B5" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#EACB94" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#CDAA7A" stopOpacity="1" />
                <stop offset="70%" stopColor="#BF9137" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#D4B78C" stopOpacity="0.85" />
              </linearGradient>
              
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              {/* Premium Progress Gradient */}
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#CDAA7A" stopOpacity="1" />
                <stop offset="50%" stopColor="#E4CA8C" stopOpacity="1" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.9" />
              </linearGradient>
              
              {/* Enhanced glow filter for progress indicator */}
              <filter id="progressGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor="#CDAA7A" floodOpacity="0.7" result="glowColor" />
                <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
                <feMerge>
                  <feMergeNode in="softGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Progress indicator for active timer */}
            {timerState.isRunning && (
              <path
                d={getSVGPathForCircle(innerRadius)}
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth={progressStroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                className="transition-all duration-300"
                filter="url(#progressGlow)"
                transform="rotate(-90, 50, 50)"
              />
            )}
          </svg>
          
          {/* Timer Text Area - Enhanced Typography (Synchronized between idle and active) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {timerState.isRunning ? (
              <motion.div 
                className="flex flex-col items-center"
                initial={{ scale: 0.95, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span 
                  className="ibm-plex-mono-medium text-[2.5rem] text-white drop-shadow-md font-bold"
                  key={timerState.timeRemaining}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {formattedMinutes}:{formattedSeconds}
                </motion.span>
                <span className="text-xs text-gray-300/90 mt-1.5">
                  {timerState.isPaused ? (
                    <>
                      Paused - {formatPauseTime(pauseTimeRemaining)} remaining
                    </>
                  ) : (
                    'Focusing'
                  )}
                </span>
              </motion.div>
            ) : (
              // Idle state text with enhanced styling
              <motion.div 
                className="flex flex-col items-center"
                initial={{ scale: 0.95, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {stats?.todayMinutes > 0 ? (
                  <>
                    <motion.span 
                      className="ibm-plex-mono-medium text-[2.75rem] text-zinc-900 dark:text-zinc-100 drop-shadow-sm font-bold"
                      key={stats.todayMinutes}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {formatDuration(stats.todayMinutes)}
                    </motion.span>
                    <span className="text-xs text-zinc-500/80 dark:text-zinc-400/80 mt-1.5">
                      time reclaimed today
                    </span>
                  </>
                ) : (
                  <motion.div
                    className="flex flex-col items-center text-center px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    key={emptyStateMessageIndex}
                  >
                    <motion.span 
                      className="ibm-plex-mono-medium text-lg text-zinc-900 dark:text-zinc-100 drop-shadow-sm"
                      initial={{ opacity: 0.7, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {EMPTY_STATE_MESSAGES[emptyStateMessageIndex]}
                    </motion.span>
                    <span className="text-xs text-zinc-500/80 dark:text-zinc-400/80 mt-1.5">
                      Start your first session
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
          
          {/* Enhanced hover animation with scale effect */}
          {!timerState.isRunning && (
            <motion.div 
              className="absolute inset-0 rounded-full"
              whileHover={{ 
                scale: 1.02,
                filter: "brightness(1.05)",
                transition: { duration: 0.4 }
              }}
            />
          )}
        </div>
        
        {/* Visual Group 3: Action Controls - Enhanced */}
        <div className="mt-6 md:mt-6 sm:mt-4 flex flex-col items-center">
          {/* Duration Selection - Only show when timer is not running */}
          {!timerState.isRunning && (
            <div className="w-full">
              <div className="mb-2 text-center">
                <h3 className="text-xs uppercase font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
                  Session Duration
                </h3>
              </div>
              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {PRESET_DURATIONS.map((duration) => (
                  <motion.button
                    key={duration}
                    onClick={() => handleSelectDuration(duration)}
                    className={`px-4 py-1.5 rounded-xl text-sm transition-all duration-200 ease-in-out ${
                      selectedDuration === duration
                        ? "bg-transparent border-2 border-[#CDAA7A] text-zinc-900 font-medium shadow-sm hover:shadow-md hover:border-[#D4AF37] relative"
                        : "bg-zinc-100/10 hover:bg-zinc-100/15 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/40 border border-zinc-200/20 dark:border-zinc-700/30"
                    }`}
                    animate={buttonScale === duration ? { scale: 0.95 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {duration} min
                    {selectedDuration === duration && (
                      <motion.div 
                        className="absolute inset-0 rounded-xl bg-[#CDAA7A]/5 blur-sm -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ))}
                
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.button
                      className={`px-4 py-1.5 rounded-xl text-sm transition-all duration-200 ease-in-out ${
                        isCustomDuration
                          ? "bg-transparent border-2 border-[#CDAA7A] text-zinc-900 font-medium shadow-sm hover:shadow-md hover:border-[#D4AF37] relative"
                          : "bg-zinc-100/10 hover:bg-zinc-100/15 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/40 border border-zinc-200/20 dark:border-zinc-700/30"
                      }`}
                      animate={buttonScale === 'custom' ? { scale: 0.95 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleSelectDuration(selectedDuration)}
                    >
                      Custom
                      {isCustomDuration && (
                        <motion.div 
                          className="absolute inset-0 rounded-xl bg-[#CDAA7A]/5 blur-sm -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-center">Custom Duration</h4>
                      <div>
                        <Slider
                          min={1}
                          max={90}
                          step={1}
                          value={[selectedDuration]}
                          onValueChange={(values) => handleSelectDuration(values[0])}
                          className="my-6"
                        />
                        <div className="text-center">
                          <span className="font-semibold text-lg">{selectedDuration}</span>
                          <span className="text-sm ml-1">minutes</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          
          {/* Premium styled control buttons */}
          <div className="w-full max-w-xs mx-auto">
            {!timerState.isRunning ? (
              <button
                onClick={handleStartPause}
                disabled={!activeProfile}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#CDAA7A] to-[#E4CA8C] hover:from-[#D4AF37] hover:to-[#CDAA7A] text-zinc-900 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
              >
                <PlayCircle className="h-5 w-5 mr-2 text-zinc-900/80" />
                Start Session
              </button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  {timerState.isPaused ? (
                    // Show Resume Session button when timer is paused
                    <button
                      onClick={handleStartPause}
                      data-testid="resume-button"
                      className="w-full py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer bg-white/10 hover:bg-white/15 text-white border border-white/20"
                    >
                      <PlayCircle className="h-5 w-5 mr-2 text-white/80" />
                      Resume Session
                    </button>
                  ) : hasPausedOnce ? (
                    // Show disabled state when pause has already been used
                    <button
                      disabled
                      data-testid="pause-disabled-button"
                      className="w-full py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center cursor-not-allowed bg-white/5 text-white/60 border border-white/10"
                    >
                      <PauseCircle className="h-5 w-5 mr-2 text-white/40" />
                      Pause already used — stay focused!
                    </button>
                  ) : (
                    // Show active Pause Session button
                    <button
                      onClick={handleStartPause}
                      data-testid="pause-button"
                      className="w-full py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer bg-white/10 hover:bg-white/15 text-white border border-white/20"
                    >
                      <PauseCircle className="h-5 w-5 mr-2 text-white/80" />
                      Pause Session
                    </button>
                  )}
                  
                  {showResumeConfirmation && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-center text-[#CDAA7A] font-medium"
                    >
                      Break taken — stay focused to complete your session
                    </motion.p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
function endTimer(arg0: boolean) {
  throw new Error('Function not implemented.');
}

