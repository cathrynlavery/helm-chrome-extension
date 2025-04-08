import React, { useEffect, useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { FocusTimer } from '../lib/focusTimer';

/**
 * Emergency Control Panel
 * 
 * This component creates a completely independent floating control panel
 * with basic timer controls that will work even if the main UI is unresponsive.
 */
const EmergencyControlPanel: React.FC = () => {
  const { focusTimer, activeProfile } = useFocus();
  const [expanded, setExpanded] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  
  // Update timer state from the actual timer instance to ensure it's accurate
  useEffect(() => {
    const timer = FocusTimer.getInstance();
    const updateState = () => {
      setTimerActive(timer.getState().isRunning);
    };
    
    // Initial state
    updateState();
    
    // Subscribe to timer state changes
    const unsubscribe = timer.subscribe(() => {
      updateState();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleStartPause = async () => {
    try {
      const timer = FocusTimer.getInstance();
      
      if (timerActive) {
        console.log('🆘 Emergency pause triggered');
        timer.pause();
        alert('Timer paused via emergency controls');
      } else {
        if (!activeProfile) {
          alert('Please select a profile before starting');
          return;
        }
        
        console.log('🆘 Emergency start triggered');
        await timer.start(activeProfile.id, 45 * 60); // Default 45 minutes
        alert('Timer started via emergency controls');
      }
    } catch (error) {
      console.error('Failed to control timer:', error);
      alert('Timer control failed. Please refresh the page.');
    }
  };
  
  const handleEndSession = async () => {
    try {
      console.log('🆘 Emergency end session triggered');
      const timer = FocusTimer.getInstance();
      await timer.end();
      alert('Timer ended via emergency controls');
    } catch (error) {
      console.error('Failed to end timer:', error);
      alert('Failed to end timer. Please refresh the page.');
    }
  };
  
  const handleEmergencyReset = async () => {
    try {
      console.log('🆘 Emergency reset triggered');
      const timer = FocusTimer.getInstance();
      await timer.emergencyReset();
      alert('Timer emergency reset successful');
    } catch (error) {
      console.error('Failed to reset timer:', error);
      alert('Failed to reset timer. Please refresh the page.');
    }
  };
  
  if (!expanded) {
    return (
      <div 
        className="fixed right-4 bottom-4 z-[9999] bg-red-600 text-white p-2 rounded-full cursor-pointer shadow-lg"
        onClick={() => setExpanded(true)}
      >
        SOS
      </div>
    );
  }
  
  return (
    <div className="fixed right-4 bottom-4 z-[9999] bg-white p-4 rounded-md shadow-lg border border-red-500">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-red-600">Emergency Controls</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setExpanded(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="flex flex-col space-y-2">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleStartPause}
        >
          {timerActive ? 'Emergency Pause' : 'Emergency Start'}
        </button>
        
        {timerActive && (
          <button 
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleEndSession}
          >
            Emergency End Session
          </button>
        )}
        
        <button 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleEmergencyReset}
        >
          Emergency Reset
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Use only if main controls are unresponsive
      </div>
    </div>
  );
};

export default EmergencyControlPanel;