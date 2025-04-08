/**
 * URL-based Control System
 * 
 * This implements a completely alternative approach to controlling the timer
 * by using URL hash fragments that get processed on page load/hash change.
 * 
 * Example URLs:
 * - #action=start&profile=1&duration=45
 * - #action=pause
 * - #action=end
 * - #action=reset
 */

import { FocusTimer } from './focusTimer';

// Parse URL parameters
function parseUrlParams(): Record<string, string> {
  const hash = window.location.hash.substring(1);
  const params: Record<string, string> = {};
  
  if (!hash) return params;
  
  const parts = hash.split('&');
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  }
  
  return params;
}

// Clear the URL hash after processing
function clearUrlHash() {
  // Use history.replaceState to avoid adding to browser history
  window.history.replaceState(
    null, 
    document.title, 
    window.location.pathname + window.location.search
  );
}

// Process actions based on URL parameters
async function processUrlAction(params: Record<string, string>) {
  const action = params.action;
  if (!action) return;
  
  console.log('URL Control: Processing action:', action, params);
  
  const timer = FocusTimer.getInstance();
  
  try {
    switch (action) {
      case 'start': {
        const profileId = parseInt(params.profile || '0', 10);
        const duration = parseInt(params.duration || '45', 10) * 60; // Convert to seconds
        
        if (profileId <= 0) {
          alert('URL Control: Invalid profile ID');
          return;
        }
        
        console.log(`URL Control: Starting timer with profile ${profileId} for ${duration/60} minutes`);
        await timer.start(profileId, duration);
        alert(`URL Control: Timer started successfully`);
        break;
      }
      
      case 'pause':
        console.log('URL Control: Pausing timer');
        timer.pause();
        alert('URL Control: Timer paused successfully');
        break;
        
      case 'end':
        console.log('URL Control: Ending timer');
        await timer.end();
        alert('URL Control: Timer ended successfully');
        break;
        
      case 'reset':
        console.log('URL Control: Resetting timer');
        timer.reset();
        alert('URL Control: Timer reset successfully');
        break;
        
      case 'emergency':
        console.log('URL Control: Emergency reset');
        await timer.emergencyReset();
        alert('URL Control: Emergency reset successful');
        break;
        
      default:
        console.log('URL Control: Unknown action:', action);
    }
  } catch (error) {
    console.error('URL Control: Error processing action:', error);
    alert(`URL Control: Error processing ${action} - ${error}`);
  }
}

// Set up event listeners for URL changes
export function initUrlControlSystem() {
  console.log('URL Control: Initializing URL control system');
  
  // Process URL parameters on initial load
  const initialParams = parseUrlParams();
  if (Object.keys(initialParams).length > 0) {
    processUrlAction(initialParams).then(() => clearUrlHash());
  }
  
  // Listen for hashchange events
  window.addEventListener('hashchange', () => {
    const params = parseUrlParams();
    if (Object.keys(params).length > 0) {
      processUrlAction(params).then(() => clearUrlHash());
    }
  });
  
  // Add control action generator
  window.urlControl = {
    start: (profileId: number, durationMinutes: number = 45) => {
      window.location.hash = `action=start&profile=${profileId}&duration=${durationMinutes}`;
    },
    pause: () => { 
      window.location.hash = 'action=pause';
    },
    end: () => {
      window.location.hash = 'action=end';
    },
    reset: () => {
      window.location.hash = 'action=reset';
    },
    emergency: () => {
      window.location.hash = 'action=emergency';
    }
  };
  
  // Log that URL controls are available
  console.log(
    '%c URL Control Ready! %c Use window.urlControl methods in console %c',
    'background: #ff5722; color: white; padding: 2px; border-radius: 2px;',
    'background: #3f51b5; color: white; padding: 2px; border-radius: 2px;',
    ''
  );
  console.log(
    '%c Example: %c window.urlControl.start(1, 45) %c',
    'color: #d32f2f;',
    'color: #0288d1; font-family: monospace;',
    ''
  );
}

// Extend the Window interface to include urlControl
declare global {
  interface Window {
    urlControl: {
      start: (profileId: number, durationMinutes?: number) => void;
      pause: () => void;
      end: () => void;
      reset: () => void;
      emergency: () => void;
    };
  }
}