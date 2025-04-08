import { getActiveFocusSession, startFocusSession, endFocusSession } from './chromeStorage';

export interface TimerState {
  isRunning: boolean;
  timeRemaining: number; // in seconds
  progress: number; // 0 to 1
  totalDuration: number; // in seconds
}

// Default focus session duration (45 minutes)
const DEFAULT_DURATION = 45 * 60;

import { getStorageData, setStorageData } from './chromeStorage';

// Timer class to handle focus session timing
export class FocusTimer {
  private static instance: FocusTimer | null = null;
  private timerId: number | null = null;
  private startTime: number = 0;
  private pausedTimeRemaining: number = DEFAULT_DURATION;
  private totalDuration: number = DEFAULT_DURATION;
  private sessionId: number | null = null;
  private profileId: number | null = null;
  private listeners: Set<(state: TimerState) => void> = new Set();

  // Singleton pattern
  static getInstance(): FocusTimer {
    if (!FocusTimer.instance) {
      FocusTimer.instance = new FocusTimer();
      // Make the instance and its getInstance method globally accessible for emergency recovery
      if (typeof window !== 'undefined') {
        (window as any).FocusTimer = {
          getInstance: () => FocusTimer.getInstance()
        };
      }
    }
    return FocusTimer.instance;
  }

  private constructor() {
    // Initialize and check for active session
    this.init();
  }

  private async init() {
    const activeSession = await getActiveFocusSession();
    
    if (activeSession) {
      this.sessionId = activeSession.id;
      this.profileId = activeSession.profileId;
      
      // Calculate remaining time
      const startTime = new Date(activeSession.startTime).getTime();
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Use the session duration if provided (fallback to default)
      const sessionDuration = activeSession.duration || DEFAULT_DURATION;
      this.totalDuration = sessionDuration;
      this.pausedTimeRemaining = Math.max(sessionDuration - elapsed, 0);
      
      if (this.pausedTimeRemaining > 0) {
        this.start();
      } else {
        // If time already expired, end the session
        await endFocusSession();
      }
    }
  }

  // Subscribe to timer updates
  subscribe(callback: (state: TimerState) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current state
    callback(this.getState());
    
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  // Start the timer
  async start(profileId?: number, duration: number = DEFAULT_DURATION): Promise<void> {
    console.log('FocusTimer.start called, profileId:', profileId, 'duration:', duration);
    
    // If already running, do nothing
    if (this.timerId) {
      console.log('Timer already running, not starting again');
      return;
    }
    
    // If specific profile provided, use it
    if (profileId) {
      console.log('Setting profile and duration:', profileId, duration);
      this.profileId = profileId;
      this.totalDuration = duration;
      this.pausedTimeRemaining = duration;
      
      // Create a new focus session
      try {
        console.log('Creating new focus session');
        const session = await startFocusSession(profileId);
        this.sessionId = session.id;
        console.log('Focus session created with ID:', this.sessionId);
      } catch (error) {
        console.error('Error creating focus session:', error);
      }
    }
    
    // Start the timer
    this.startTime = Date.now();
    console.log('Starting timer at:', new Date(this.startTime).toISOString());
    this.timerId = window.setInterval(() => this.tick(), 1000);
    console.log('Created interval with ID:', this.timerId);
    
    // Notify listeners
    this.notifyListeners();
  }

  // Pause the timer
  pause(): void {
    console.log('FocusTimer.pause called, timerId:', this.timerId);
    if (this.timerId) {
      console.log('Clearing interval:', this.timerId);
      // Store the interval ID before clearing it
      const intervalId = this.timerId;
      // Clear the interval
      window.clearInterval(intervalId);
      this.timerId = null;
      
      // Calculate remaining time precisely
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.pausedTimeRemaining = Math.max(this.pausedTimeRemaining - elapsed, 0);
      console.log('Updated pausedTimeRemaining:', this.pausedTimeRemaining);
      
      // Set the start time for when we resume
      this.startTime = Date.now();
      
      // Force update the UI immediately
      setTimeout(() => {
        this.notifyListeners();
        console.log('Timer paused, notified listeners');
      }, 0);
    } else {
      console.log('No timer running to pause');
    }
  }

  // Reset the timer
  reset(duration: number = DEFAULT_DURATION): void {
    console.log('FocusTimer.reset called');
    if (this.timerId) {
      console.log('Clearing interval for reset:', this.timerId);
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    
    this.totalDuration = duration;
    this.pausedTimeRemaining = duration;
    console.log('Timer reset to duration:', duration);
    this.notifyListeners();
  }

  // End the current focus session
  async end(): Promise<void> {
    console.log('FocusTimer.end called');
    if (this.timerId) {
      console.log('Clearing interval for end:', this.timerId);
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    
    if (this.sessionId) {
      console.log('Ending focus session with ID:', this.sessionId);
      try {
        await endFocusSession();
        console.log('Focus session ended successfully');
      } catch (error) {
        console.error('Error ending focus session:', error);
        // Force clear active session in storage as fallback
        try {
          const data = await getStorageData();
          if (data.activeFocusSession) {
            console.log('Clearing active focus session from storage directly');
            data.activeFocusSession = null;
            await setStorageData(data);
          }
        } catch (innerError) {
          console.error('Fallback storage clearing also failed:', innerError);
        }
      }
      this.sessionId = null;
    } else {
      console.log('No active session to end');
    }
    
    this.profileId = null;
    this.totalDuration = DEFAULT_DURATION;
    this.pausedTimeRemaining = DEFAULT_DURATION;
    console.log('Timer state reset to defaults');
    this.notifyListeners();
    
    // Force a page reload as last resort if we're on the focus session page
    if (window.location.pathname === '/' || window.location.pathname === '/focus-session') {
      console.log('Redirecting to dashboard after ending session');
      window.location.href = '/dashboard';
    }
  }

  // Get the current timer state
  getState(): TimerState {
    let timeRemaining = this.pausedTimeRemaining;
    
    // If running, calculate actual time remaining
    if (this.timerId) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      timeRemaining = Math.max(this.pausedTimeRemaining - elapsed, 0);
    }
    
    return {
      isRunning: Boolean(this.timerId),
      timeRemaining,
      progress: 1 - (timeRemaining / this.totalDuration),
      totalDuration: this.totalDuration
    };
  }

  // Get formatted time remaining (MM:SS)
  getFormattedTimeRemaining(): string {
    const { timeRemaining } = this.getState();
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.floor(timeRemaining % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Timer tick function
  private tick(): void {
    const { timeRemaining } = this.getState();
    
    // Log every 15 seconds to avoid console spam
    if (Math.floor(timeRemaining) % 15 === 0) {
      console.log('Tick: time remaining:', timeRemaining.toFixed(1), 'seconds');
    }
    
    // If time is up, stop the timer and end the session
    if (timeRemaining <= 0) {
      console.log('Timer completed, ending session');
      this.end();
      return;
    }
    
    // Notify listeners
    this.notifyListeners();
  }

  // Notify all listeners with the current state
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  // Get active profile ID
  getActiveProfileId(): number | null {
    return this.profileId;
  }
  
  // Emergency reset function to force clear any stuck timers
  async emergencyReset(): Promise<void> {
    console.log('EMERGENCY RESET triggered');
    
    // Clear any running timers
    if (this.timerId) {
      console.log('Clearing interval for emergency reset:', this.timerId);
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    
    // Reset all internal state
    this.sessionId = null;
    this.profileId = null;
    this.totalDuration = DEFAULT_DURATION;
    this.pausedTimeRemaining = DEFAULT_DURATION;
    
    try {
      // Force clear active session in storage
      const data = await getStorageData();
      if (data.activeFocusSession) {
        console.log('Clearing active focus session from storage');
        data.activeFocusSession = null;
        await setStorageData(data);
      }
      
      // Force clear localStorage as a last resort
      localStorage.removeItem('helmData');
    } catch (error) {
      console.error('Error during emergency reset of storage:', error);
    }
    
    // Notify listeners with reset state
    this.notifyListeners();
    console.log('Emergency reset completed');
  }
}

// Format seconds to MM:SS
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Format minutes to human readable string (e.g. "2h 15m")
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}
