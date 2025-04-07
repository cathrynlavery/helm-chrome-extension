import React, { useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Pause, Play, RefreshCw, CheckCircle, Timer, Flame } from 'lucide-react';
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
  
  return (
    <Card className="w-full backdrop-blur-sm bg-background/95 border-neutral-100/30 shadow-lg">
      <CardContent className={`p-6 ${compact ? 'py-4' : 'py-8'}`}>
        {showProfileSelector && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Focus Session</h3>
            <ProfileSelector />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {state.isRunning ? (
            <motion.div 
              key="timer-running"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg className={`${size} transform -rotate-90`} viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle 
                    className="text-muted-foreground/20" 
                    strokeWidth="6" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="44" 
                    cx="50" 
                    cy="50"
                  />
                  {/* Animated progress */}
                  <motion.circle 
                    className="text-primary" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    stroke="currentColor" 
                    fill="transparent" 
                    r="44" 
                    cx="50" 
                    cy="50" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeDashoffset }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </svg>
                <div className="absolute text-center">
                  <motion.div 
                    className={`${fontSizeClass} font-bold tracking-tight`}
                    key={focusTimer.formattedTime}
                    initial={{ opacity: 0.5, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {focusTimer.formattedTime}
                  </motion.div>
                  {!compact && (
                    <div className="text-sm text-muted-foreground mt-1">remaining</div>
                  )}
                </div>
              </div>
              
              {streakCount && streakCount > 0 && (
                <div className="mb-4 flex items-center text-amber-500">
                  <Flame className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Streak: {streakCount}</span>
                </div>
              )}
              
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  size={compact ? "sm" : "default"}
                  onClick={handleEndSession}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  End Session
                </Button>
                
                <Button
                  variant="outline"
                  size={compact ? "sm" : "default"}
                  onClick={handleStartPause}
                >
                  {state.isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="timer-setup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-1">Select Focus Duration</h3>
                <p className="text-sm text-muted-foreground">
                  How long would you like to focus?
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4 w-full max-w-xs">
                {PRESET_DURATIONS.map(duration => (
                  <Button
                    key={duration}
                    variant={selectedDuration === duration ? "default" : "outline"}
                    className={`py-6 ${selectedDuration === duration ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => handleSelectDuration(duration)}
                  >
                    {duration} min
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mb-6 w-full max-w-xs">
                <div className="text-sm text-muted-foreground">Custom:</div>
                <Input
                  type="number"
                  min="1"
                  max="180"
                  value={customDuration}
                  onChange={handleCustomDurationChange}
                  placeholder="minutes"
                  className="w-24"
                />
                <div className="text-sm text-muted-foreground">min</div>
              </div>
              
              {stats && stats.todayMinutes > 0 && (
                <div className="mb-4 text-sm text-muted-foreground">
                  Today: {formatDuration(stats.todayMinutes)} focused
                </div>
              )}
              
              {streakCount && streakCount > 0 && (
                <div className="mb-4 flex items-center text-amber-500">
                  <Flame className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Streak: {streakCount}</span>
                </div>
              )}
              
              <Button
                size="lg"
                onClick={handleStartPause}
                disabled={!activeProfile}
                className="py-2 px-8 bg-primary hover:bg-primary/90"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Focus Session
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default FocusTimer;
