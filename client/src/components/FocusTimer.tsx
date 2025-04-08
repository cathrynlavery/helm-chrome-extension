import React, { useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Button } from '@/components/ui/button';
import { Pause, Play, StopCircle } from 'lucide-react';
import ProfileSelector from './ProfileSelector';
import { AnimatePresence, motion } from 'framer-motion';

interface FocusTimerProps {
  compact?: boolean;
  showProfileSelector?: boolean;
  streakCount?: number;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ 
  compact = false, 
  showProfileSelector = true,
  streakCount 
}) => {
  const { focusTimer, activeProfile } = useFocus();
  const { state, start, pause, end } = focusTimer;
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  
  const handleStartPause = async () => {
    console.log('handleStartPause triggered', state.isRunning ? 'PAUSE' : 'START');
    
    if (!activeProfile) {
      console.log('No active profile, cannot start/pause');
      alert("Please select a focus profile first");
      return;
    }
    
    if (state.isRunning) {
      try {
        pause();
        console.log('Timer paused successfully');
      } catch (err) {
        console.error('Error pausing timer:', err);
        alert("Failed to pause timer. Please try again.");
      }
    } else {
      try {
        console.log('Starting timer with duration:', selectedDuration, 'minutes');
        await start(activeProfile.id, selectedDuration * 60);
        console.log('Timer started successfully');
      } catch (error) {
        console.error('Error starting timer:', error);
        alert("Failed to start timer. Please try again.");
      }
    }
  };
  
  const handleEndSession = async () => {
    console.log('End Session called');
    try {
      await end();
      console.log('Session ended successfully');
    } catch (error) {
      console.error('Error ending session:', error);
      alert("Failed to end session. Please try again.");
    }
  };
  
  const handleSelectDuration = (minutes: number) => {
    setSelectedDuration(minutes);
  };
  
  return (
    <div className="w-full">
      <div className="w-full p-8">
        {showProfileSelector && !state.isRunning && (
          <div className="flex items-center justify-between mb-12">
            <div className="profile-label">
              <ProfileSelector />
            </div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {state.isRunning ? (
            <motion.div 
              key="timer-running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="text-center">
                  <div className="text-4xl">
                    {focusTimer.formattedTime}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Time Remaining
                  </div>
                </div>
              </div>
              
              {activeProfile && (
                <div className="mb-8 text-center">
                  <div className="text-center">
                    <span className="text-xl">{activeProfile.name}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center space-x-6 mb-6">
                <Button 
                  id="end-session-button"
                  onClick={handleEndSession}
                  className="rounded-lg"
                >
                  <StopCircle className="h-5 w-5 mr-2" />
                  End Session
                </Button>
                
                <Button 
                  id="pause-resume-button"
                  onClick={handleStartPause}
                  className="rounded-lg"
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
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="timer-setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold mb-4">
                  Select Focus Duration
                </h2>
                <div className="flex space-x-4 justify-center">
                  {[15, 30, 45, 60].map((minutes) => (
                    <Button
                      key={minutes}
                      onClick={() => handleSelectDuration(minutes)}
                      variant={selectedDuration === minutes ? "default" : "outline"}
                      className="rounded-lg"
                    >
                      {minutes} min
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                id="start-session-button"
                onClick={handleStartPause}
                className="mt-6 rounded-lg"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Focus Session
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FocusTimer;