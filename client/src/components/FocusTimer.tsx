import React, { useState, useEffect } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Button } from '@/components/ui/button';
import { Pause, Play, StopCircle } from 'lucide-react';
import ProfileSelector from './ProfileSelector';

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
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Ensure component is fully mounted before attaching event handlers
  useEffect(() => {
    setIsMounted(true);
    console.log("FocusTimer component mounted");
    
    // Cleanup on unmount
    return () => {
      console.log("FocusTimer component unmounting");
      setIsMounted(false);
    };
  }, []);
  
  // Manually attach click handlers on mount
  useEffect(() => {
    if (!isMounted) return;
    
    const attachClickHandlers = () => {
      console.log("Attaching click handlers to buttons");
      
      // End session button
      const endButton = document.getElementById('end-session-button');
      if (endButton) {
        console.log("Found end button, attaching handler");
        endButton.addEventListener('click', handleEndSession);
      }
      
      // Pause/resume button
      const pauseButton = document.getElementById('pause-resume-button');
      if (pauseButton) {
        console.log("Found pause button, attaching handler");
        pauseButton.addEventListener('click', handleStartPause);
      }
      
      // Start session button
      const startButton = document.getElementById('start-session-button');
      if (startButton) {
        console.log("Found start button, attaching handler");
        startButton.addEventListener('click', handleStartPause);
      }
      
      // Duration buttons
      [15, 30, 45, 60].forEach(min => {
        const button = document.getElementById(`duration-${min}`);
        if (button) {
          console.log(`Found duration button ${min}, attaching handler`);
          button.addEventListener('click', () => handleSelectDuration(min));
        }
      });
    };
    
    // Delay to ensure DOM is ready
    setTimeout(attachClickHandlers, 500);
    
    return () => {
      // Clean up event listeners
      const endButton = document.getElementById('end-session-button');
      if (endButton) endButton.removeEventListener('click', handleEndSession);
      
      const pauseButton = document.getElementById('pause-resume-button');
      if (pauseButton) pauseButton.removeEventListener('click', handleStartPause);
      
      const startButton = document.getElementById('start-session-button');
      if (startButton) startButton.removeEventListener('click', handleStartPause);
      
      [15, 30, 45, 60].forEach(min => {
        const button = document.getElementById(`duration-${min}`);
        if (button) button.removeEventListener('click', () => handleSelectDuration(min));
      });
    };
  }, [isMounted, state.isRunning]);
  
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
    console.log('Duration selected:', minutes);
    setSelectedDuration(minutes);
  };
  
  // Generate a simple render for testing
  if (state.isRunning) {
    return (
      <div className="w-full p-8 border border-amber-200 bg-white/5 rounded-xl" style={{position: 'relative', zIndex: 5}}>
        <div className="text-center mb-8">
          <h2 className="text-3xl mb-4 font-semibold">{focusTimer.formattedTime}</h2>
          <p>Time Remaining</p>
        </div>
        
        {activeProfile && (
          <div className="text-center mb-6">
            <h3 className="text-xl">{activeProfile.name}</h3>
          </div>
        )}
        
        <div className="flex justify-center gap-4 my-6">
          <button 
            id="end-session-button"
            className="px-6 py-3 bg-red-500 text-white rounded-lg flex items-center gap-2 interactive"
            onClick={handleEndSession}
          >
            <StopCircle size={20} />
            End Session
          </button>
          
          <button 
            id="pause-resume-button"
            className="px-6 py-3 bg-amber-500 text-white rounded-lg flex items-center gap-2 interactive"
            onClick={handleStartPause}
          >
            <Pause size={20} />
            Pause
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full p-8 border border-amber-100 rounded-xl" style={{position: 'relative', zIndex: 5}}>
      {showProfileSelector && (
        <div className="mb-8">
          <ProfileSelector />
        </div>
      )}
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Select Focus Duration
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {[15, 30, 45, 60].map((minutes) => (
            <button
              key={minutes}
              id={`duration-${minutes}`}
              className={`px-5 py-2 ${selectedDuration === minutes 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-100 text-gray-800'} rounded-lg interactive`}
              onClick={() => handleSelectDuration(minutes)}
            >
              {minutes} min
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <button
          id="start-session-button"
          className="px-8 py-4 bg-green-500 text-white rounded-lg flex items-center gap-2 mx-auto interactive"
          onClick={handleStartPause}
        >
          <Play size={20} />
          Start Focus Session
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;