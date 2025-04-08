import React, { useState, useEffect } from 'react';
import { useFocus } from '../contexts/FocusContext';

/**
 * URL Control Panel
 * 
 * This component provides special link-based controls that work
 * with our URL hash control system
 */
const UrlControlPanel: React.FC = () => {
  const { activeProfile, focusTimer } = useFocus();
  const [expanded, setExpanded] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  
  // Update state based on timer changes
  useEffect(() => {
    if (focusTimer) {
      setTimerRunning(focusTimer.state.isRunning);
    }
  }, [focusTimer.state.isRunning]);
  
  // Function to safely create control links
  const createControlLink = (
    action: string, 
    label: string, 
    params: Record<string, string | number> = {},
    colorClass: string = 'bg-blue-500 hover:bg-blue-600'
  ) => {
    // Build the hash
    let hash = `action=${action}`;
    for (const [key, value] of Object.entries(params)) {
      hash += `&${key}=${value}`;
    }
    
    return (
      <a
        href={`#${hash}`}
        className={`block p-3 m-2 ${colorClass} text-white text-center rounded-md shadow`}
        onClick={(e) => {
          // No need to prevent default - let the hashchange event handle it
          console.log(`Link clicked: ${hash}`);
        }}
      >
        {label}
      </a>
    );
  };
  
  if (!expanded) {
    return (
      <div 
        className="fixed left-4 top-4 z-[9999] bg-purple-600 text-white p-3 rounded-md shadow-lg cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        URL Controls
      </div>
    );
  }
  
  return (
    <div className="fixed left-4 top-4 z-[9999] bg-gray-800 text-white p-4 rounded-md shadow-lg border border-purple-500 max-w-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-purple-400">URL Control Panel</h3>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={() => setExpanded(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="text-sm mb-2 text-gray-300">
        These links directly control the timer by changing the URL hash
      </div>
      
      <div className="flex flex-col">
        {!timerRunning && activeProfile && (
          <div>
            <div className="mt-2 mb-1 text-purple-300 font-semibold">
              Start Timer with {activeProfile.name}:
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[15, 25, 45].map(duration => (
                <a
                  key={duration}
                  href={`#action=start&profile=${activeProfile.id}&duration=${duration}`}
                  className="bg-green-600 hover:bg-green-700 text-white text-center py-2 px-1 rounded text-sm"
                >
                  {duration} min
                </a>
              ))}
            </div>
          </div>
        )}
        
        {timerRunning && (
          <div className="flex flex-col">
            <div className="text-purple-300 font-semibold mt-2 mb-1">
              Timer Controls:
            </div>
            {createControlLink('pause', 'Pause Timer', {}, 'bg-yellow-500 hover:bg-yellow-600')}
            {createControlLink('end', 'End Session', {}, 'bg-red-500 hover:bg-red-600')}
          </div>
        )}
        
        <div className="border-t border-gray-600 my-2 pt-2">
          {createControlLink('emergency', 'Emergency Reset', {}, 'bg-red-700 hover:bg-red-800')}
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          If nothing else works, try these controls
        </div>
      </div>
    </div>
  );
};

export default UrlControlPanel;