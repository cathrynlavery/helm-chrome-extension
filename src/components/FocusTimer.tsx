import React, { useState } from 'react';
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
import { useLocation } from 'wouter';

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
  const { timerState, startTimer, pauseTimer, endTimer, activeProfile, stats, profiles, setActiveProfile } = useFocus();
  const [customDuration, setCustomDuration] = useState<number | string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [, navigate] = useLocation();
  
  const handleStartPause = async () => {
    console.log('🔍 handleStartPause triggered');
    if (!activeProfile) {
      console.log('⚠️ No active profile selected');
      alert("Please select a focus profile first");
      return;
    }
    
    if (timerState.isRunning) {
      console.log('⏸️ Pausing timer');
      pauseTimer();
    } else {
      console.log('▶️ Starting timer');
      const duration = typeof selectedDuration === 'number' ? selectedDuration : 45;
      await startTimer(activeProfile.id, duration * 60);
    }
  };
  
  const handleEndSession = async () => {
    console.log('🛑 Ending session');
    await endTimer();
    
    // After ending, navigate back to idle focus page
    // This ensures we return to the idle state UI
    navigate('/');
  };
  
  const handleSelectDuration = (minutes: number) => {
    setSelectedDuration(minutes);
    setCustomDuration("");
    setShowCustomInput(false);
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
  const outerRadius = 48.5;
  const circumference = 2 * Math.PI * outerRadius;
  const strokeDashoffset = circumference * (1 - timerState.progress);
  
  // Enhanced circle size for the premium look
  const enhancedSize = compact ? "w-28 h-28" : "w-52 h-52";
  
  return (
    <div className={`w-full ${timerState.isRunning ? 'dark' : ''}`}>
      <div className="flex flex-col items-center max-w-[500px] mx-auto">
        {/* Visual Group 1: Profile + Streak */}
        <div className="flex flex-col items-center mb-5">
          {/* Profile selector */}
          {showProfileSelector && (
            <span className="text-xs uppercase text-zinc-500/90 dark:text-zinc-400/90 tracking-wider">
              Space: 
              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger className="ml-1 inline-flex items-center normal-case text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:text-[#CDAA7A] transition-colors focus:outline-none">
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
                    Manage profiles...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          )}
          
          {/* Streak indicator as part of the visual group */}
          {stats && stats.streaks.current > 0 && (
            <div className={`flex items-center px-3 py-1 rounded-full mt-2
              ${timerState.isRunning 
                ? 'bg-primary/10 text-primary/90 border border-primary/30' 
                : 'bg-[#F8F5EE] dark:bg-zinc-800/60 border border-[#CDAA7A]/30 text-[#CDAA7A]'}`}
            >
              <Flame className="h-3 w-3 mr-1" />
              <span className="ibm-plex-mono-regular text-xs">{stats.streaks.current}-day streak</span>
            </div>
          )}
        </div>

        {/* Visual Group 2: Focus Circle (Hero Element) */}
        <div className={`relative ${enhancedSize} mb-7 group cursor-pointer`}>
          {/* Premium ambient glow for idle state - Enhanced */}
          <div className="absolute inset-0 rounded-full blur-[50px] bg-[#CDAA7A]/10 group-hover:bg-[#CDAA7A]/15 transition-all duration-700"></div>
          
          {/* Main premium glow effect - Enhanced */}
          <div className="absolute -inset-3 rounded-full opacity-60 group-hover:opacity-80 transition-all duration-500">
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#CDAA7A]/20 via-[#CDAA7A]/10 to-transparent blur-2xl"></div>
          </div>
          
          {/* Apple-style soft inner shadow for depth */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_20px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.3)]"></div>
          
          {/* Animated glow pulse effect */}
          <motion.div 
            className="absolute inset-0 rounded-full"
            animate={{ 
              boxShadow: [
                '0 0 0 rgba(205, 170, 122, 0)', 
                '0 0 25px rgba(205, 170, 122, 0.3)', 
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
            {/* Background circle with subtle fill */}
            <circle 
              className="fill-white/5 dark:fill-black/5"
              stroke="none"
              r="46"
              cx="50%" 
              cy="50%"
            />
            
            {/* Secondary inner circle for depth */}
            <circle 
              className={`${timerState.isRunning ? 'text-gray-700/40' : 'text-[#CDAA7A]/15 dark:text-gray-500/40'}`}
              strokeWidth="2" 
              stroke="currentColor" 
              fill="transparent" 
              r="45"
              cx="50%" 
              cy="50%"
            />
            
            {/* Main circle border - enhanced premium gradient stroke */}
            <circle 
              className="text-[#CDAA7A]"
              strokeWidth="4" 
              stroke="url(#circleGradient)" 
              fill="transparent" 
              r="48.5" 
              cx="50%" 
              cy="50%"
              strokeLinecap="round"
            />
            
            {/* Enhanced gradient definition */}
            <defs>
              <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EACB94" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#CDAA7A" stopOpacity="1" />
                <stop offset="70%" stopColor="#BF9137" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#D4B78C" stopOpacity="0.8" />
              </radialGradient>
              
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Progress circle - enhanced with premium styling */}
            {timerState.isRunning && (
              <motion.circle
                className="text-[#CDAA7A]"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="url(#progressGradient)"
                filter="url(#glowFilter)"
                fill="transparent"
                r="48.5"
                cx="50%"
                cy="50%"
                initial={{ strokeDasharray: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5 }}
              />
            )}
            
            {/* Enhanced progress gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EACB94" stopOpacity="1" />
                <stop offset="30%" stopColor="#CDAA7A" stopOpacity="1" />
                <stop offset="70%" stopColor="#BF9137" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#D4B78C" stopOpacity="0.9" />
              </linearGradient>
              
              {/* SVG Filter for premium glow effect */}
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor="#CDAA7A" floodOpacity="0.5" result="glow" />
                <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
                <feMerge>
                  <feMergeNode in="softGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
          
          {/* Timer Text Area - Enhanced Typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {timerState.isRunning ? (
              <>
                <span className="ibm-plex-mono-medium timer-digits text-white text-3xl drop-shadow-md">
                  {formatTime(timerState.timeRemaining)}
                </span>
                <span className="timer-label text-gray-300/90 text-xs mt-1">
                  {timerState.isPaused ? 'Paused' : 'Focusing'}
                </span>
              </>
            ) : (
              // Idle state text with enhanced styling
              <div className="flex flex-col items-center">
                <span className="ibm-plex-mono-medium text-[1.125rem] text-zinc-900 dark:text-zinc-100 drop-shadow-sm">
                  {stats?.todayMinutes > 0 ? `${formatDuration(stats.todayMinutes)}` : "Ready to Focus"}
                </span>
                <span className="text-xs text-zinc-500/80 dark:text-zinc-400/80 mt-1">
                  {stats?.todayMinutes > 0 ? "time reclaimed today" : "Start your first session"}
                </span>
              </div>
            )}
          </div>
          
          {/* Subtle hover animation - scale effect */}
          {!timerState.isRunning && (
            <motion.div 
              className="absolute inset-0 rounded-full"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            />
          )}
        </div>
        
        {/* Visual Group 3: Action Controls */}
        {!timerState.isRunning && (
          <div className="flex flex-col items-center space-y-5">
            {/* Start Session Button - Enhanced prominence */}
            <Button
              onClick={handleStartPause}
              disabled={!activeProfile}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-br from-[#CDAA7A] to-[#BF9137] text-zinc-900 transition-all duration-300 ibm-plex-mono-medium text-sm shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </Button>
            
            {/* Session Duration Selector - Tighter, more cohesive */}
            <div className="flex flex-col items-center w-full">
              <p className="text-xs text-zinc-500/90 dark:text-zinc-400/90 mb-2 uppercase tracking-wider">Session Duration</p>
              
              {/* Tighter button group with dot separators */}
              <div className="inline-flex items-center bg-zinc-100/80 dark:bg-zinc-800/40 backdrop-blur-sm p-1 rounded-xl">
                {PRESET_DURATIONS.map((duration, index) => (
                  <React.Fragment key={duration}>
                    {index > 0 && (
                      <span className="text-zinc-300 dark:text-zinc-600 mx-0.5">•</span>
                    )}
                    <button
                      onClick={() => handleSelectDuration(duration)}
                      className={`py-1 px-2.5 text-xs transition-all duration-200 rounded-lg ibm-plex-mono-regular
                        ${(selectedDuration === duration && !showCustomInput)
                          ? 'bg-[#CDAA7A] text-zinc-900 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/40'}`}
                    >
                      {duration}m
                    </button>
                  </React.Fragment>
                ))}
                
                <span className="text-zinc-300 dark:text-zinc-600 mx-0.5">•</span>
                
                {/* Custom option as part of the button group */}
                <button 
                  onClick={toggleCustomInput}
                  className={`py-1 px-2.5 text-xs transition-all duration-200 rounded-lg flex items-center ibm-plex-mono-regular
                    ${showCustomInput || (!PRESET_DURATIONS.includes(selectedDuration) && selectedDuration > 0)
                      ? 'bg-[#CDAA7A] text-zinc-900 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/40'}`}
                >
                  {!PRESET_DURATIONS.includes(selectedDuration) && selectedDuration > 0 && !showCustomInput 
                    ? `${selectedDuration}m`
                    : <>Custom <ChevronDown className="h-2.5 w-2.5 ml-0.5" /></>
                  }
                </button>
              </div>
            </div>
            
            {/* Today's focused stats - below duration selector */}
            {stats && stats.todayMinutes > 0 && (
              <div className="text-xs ibm-plex-mono-regular text-zinc-500/80 dark:text-zinc-400/80 mt-1">
                {formatDuration(stats.todayMinutes)} focused today
              </div>
            )}
          </div>
        )}
        
        {/* Running or Paused State: Show Pause/Resume and End */} 
        {timerState.isRunning && (
          <div className="flex justify-center space-x-3 mt-5">
            {/* Pause/Resume Button */}
            <Button
              variant="outline" 
              onClick={handleStartPause}
              className="py-2.5 px-5 rounded-xl border-2 border-[#CDAA7A]/60 hover:border-[#CDAA7A] bg-transparent hover:bg-[#CDAA7A]/10 text-[#CDAA7A] transition-all duration-300 ibm-plex-mono-regular text-xs hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              {timerState.isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5 mr-1.5" />
                  Pause
                </>
              )}
            </Button>
            
            {/* End Session Button */}
            <Button
              variant="outline"
              onClick={handleEndSession}
              className="py-2.5 px-5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-[#CDAA7A]/60 hover:bg-[#CDAA7A]/5 text-zinc-500 dark:text-zinc-400 hover:text-[#CDAA7A] transition-all duration-300 ibm-plex-mono-regular text-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <StopCircle className="h-3.5 w-3.5 mr-1.5" />
              End Session
            </Button>
          </div>
        )}
        
        {/* Expandable custom duration input */}
        <AnimatePresence>
          {showCustomInput && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center space-x-2 w-full mt-2"
            >
              <Input
                id="custom-duration-input"
                type="number"
                value={customDuration}
                onChange={handleCustomDurationChange}
                placeholder="minutes"
                className="w-20 text-center py-1 px-2 border border-zinc-200 dark:border-zinc-700/50 focus:border-[#CDAA7A]/50 rounded-lg bg-white/90 dark:bg-zinc-800/40 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomDurationConfirm();
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={handleCustomDurationConfirm}
                className="h-6 px-2 rounded-lg bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-zinc-900 text-xs shadow-sm"
              >
                <Check className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FocusTimer; 