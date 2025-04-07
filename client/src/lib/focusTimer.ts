import { getActiveFocusSession, startFocusSession, endFocusSession } from './chromeStorage';

export interface TimerState {
  isRunning: boolean;
  timeRemaining: number; // in seconds
  progress: number; // 0 to 1
  totalDuration: number; // in seconds
}

// Default focus session duration (45 minutes)
const DEFAULT_DURATION = 45 * 60;

// Timer class to handle focus session timing
export class FocusTimer {
  private static instance: FocusTimer | null = null;
  private timerId: number | null = null;
  private startTime: number = 0;
  private pausedTimeRemaining: number = DEFAULT_DURATION;
  private sessionId: number | null = null;
  private profileId: number | null = null;
  private listeners: Set<(state: TimerState) => void> = new Set();

  // Singleton pattern
  static getInstance(): FocusTimer {
    if (!FocusTimer.instance) {
      FocusTimer.instance = new FocusTimer();
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
      this.pausedTimeRemaining = Math.max(DEFAULT_DURATION - elapsed, 0);
      
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
    // If already running, do nothing
    if (this.timerId) return;
    
    // If specific profile provided, use it
    if (profileId) {
      this.profileId = profileId;
      this.pausedTimeRemaining = duration;
      
      // Create a new focus session
      const session = await startFocusSession(profileId);
      this.sessionId = session.id;
    }
    
    // Start the timer
    this.startTime = Date.now();
    this.timerId = window.setInterval(() => this.tick(), 1000);
    
    // Notify listeners
    this.notifyListeners();
  }

  // Pause the timer
  pause(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      
      // Calculate remaining time
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.pausedTimeRemaining = Math.max(this.pausedTimeRemaining - elapsed, 0);
      
      // Notify listeners
      this.notifyListeners();
    }
  }

  // Reset the timer
  reset(duration: number = DEFAULT_DURATION): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    
    this.pausedTimeRemaining = duration;
    this.notifyListeners();
  }

  // End the current focus session
  async end(): Promise<void> {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    
    if (this.sessionId) {
      await endFocusSession();
      this.sessionId = null;
    }
    
    this.pausedTimeRemaining = DEFAULT_DURATION;
    this.notifyListeners();
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
      progress: 1 - (timeRemaining / DEFAULT_DURATION),
      totalDuration: DEFAULT_DURATION
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
    
    // If time is up, stop the timer and end the session
    if (timeRemaining <= 0) {
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
