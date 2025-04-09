import { getActiveFocusSession, startFocusSession, endFocusSession } from './chromeStorage';

export type TimerState = {
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  progress: number; // 0 to 1
  totalDuration: number; // in seconds
  profileId: number | null;
};

// Default focus session duration (45 minutes)
const DEFAULT_DURATION = 45 * 60;

import { getStorageData, setStorageData } from './chromeStorage';

type StateChangeListener = (state: TimerState) => void;

// Utility to format time (MM:SS)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Utility to format duration (e.g., 1h 30m)
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let result = '';
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (mins > 0 || hours === 0) {
    result += `${mins}m`;
  }
  return result.trim();
};

export class FocusTimer {
  private intervalId: NodeJS.Timeout | null = null;
  private state: TimerState;
  private listeners: StateChangeListener[] = [];
  private sessionStartTime: number | null = null;
  private pauseStartTime: number | null = null; // Track when pause started
  private totalPausedTime: number = 0; // Track total time paused in seconds

  constructor(initialState?: Partial<TimerState>) {
    this.state = {
      isRunning: false,
      isPaused: false,
      timeRemaining: 0,
      totalDuration: 0,
      progress: 0,
      profileId: null,
      ...initialState,
    };
    console.log("FocusTimer initialized with state:", this.state);
  }

  subscribe(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const currentState = this.getState();
    console.log("FocusTimer: Notifying listeners with state:", currentState);
    this.listeners.forEach(listener => listener(currentState));
  }

  async start(profileId: number, durationSeconds: number): Promise<void> {
    console.log(`FocusTimer: start called - profileId: ${profileId}, duration: ${durationSeconds}s`);
    if (this.state.isRunning && !this.state.isPaused) {
      console.log("FocusTimer: Already running and not paused.");
      return;
    }

    if (this.state.isRunning && this.state.isPaused) {
      // Resuming from pause
      console.log("FocusTimer: Resuming timer.");
      if (this.pauseStartTime) {
        const pausedDuration = (Date.now() - this.pauseStartTime) / 1000;
        this.totalPausedTime += pausedDuration;
        this.pauseStartTime = null; // Clear pause start time
      }
      this.state.isPaused = false;
      this.startIntervalTimer(); // Restart the interval timer
      console.log("FocusTimer: Timer resumed, state:", this.getState());
      this.notifyListeners(); // Ensure listeners are notified after state change
      // No need to update session duration on resume based on chromeStorage
    } else {
      // Starting a new session or starting after being stopped
      console.log("FocusTimer: Starting new or previously stopped timer.");
      this.stop(); // Clear any existing interval
      this.state = {
        ...this.state,
        isRunning: true,
        isPaused: false, // Ensure not paused when starting
        timeRemaining: durationSeconds,
        totalDuration: durationSeconds,
        progress: 0,
        profileId: profileId,
      };
      this.sessionStartTime = Date.now();
      this.totalPausedTime = 0; // Reset paused time for new session
      this.pauseStartTime = null;
      this.startIntervalTimer();
      console.log("FocusTimer: New session started, state:", this.getState());
      this.notifyListeners(); // Ensure listeners are notified after state change

      // Persist session start to storage - only needs profileId
      try {
        await startFocusSession(profileId);
        console.log("FocusTimer: Session start persisted.");
      } catch (error) {
        console.error("FocusTimer: Failed to persist session start:", error);
        // Optionally revert state or notify user
      }
    }
  }

  pause(): void {
    console.log("FocusTimer: pause called");
    if (!this.state.isRunning || this.state.isPaused) {
      console.log("FocusTimer: Not running or already paused.");
      return;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state.isPaused = true;
    this.pauseStartTime = Date.now(); // Record when pause started
    console.log("FocusTimer: Timer paused, state:", this.getState());
    this.notifyListeners(); // Ensure listeners are notified after state change
    // No storage update needed on pause based on chromeStorage
  }

  async end(saveProgress: boolean = true): Promise<void> {
    console.log(`FocusTimer: end called with saveProgress=${saveProgress}`);
    const wasRunningOrPaused = this.state.isRunning; // Check before stopping
    this.stop();

    // Only try to end in storage if a session was actually active
    if (wasRunningOrPaused) {
      try {
        if (saveProgress) {
          await endFocusSession(); // Save progress to storage
          console.log("FocusTimer: Session end persisted with progress saved.");
        } else {
          // Just clear the session without saving progress
          await endFocusSession(false); // Pass false to indicate no progress should be saved
          console.log("FocusTimer: Session ended without saving progress.");
        }
      } catch (error) {
        console.error("FocusTimer: Failed to persist session end:", error);
        // Handle error appropriately
      }
    } else {
      console.warn("FocusTimer: Tried to end session but it wasn't running or paused.");
    }
  }

  stop(): void {
     console.log("FocusTimer: stop called (internal cleanup)");
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state = {
      ...this.state,
      isRunning: false,
      isPaused: false, // Ensure not paused when stopped
      timeRemaining: 0, // Reset time remaining on stop, or keep last value? Resetting seems cleaner.
      progress: 0,
      // Keep profileId until a new session starts? Or clear it? Let's clear for now.
      // profileId: null,
    };
    this.sessionStartTime = null;
    this.pauseStartTime = null;
    this.totalPausedTime = 0;
    console.log("FocusTimer: Timer stopped, state reset:", this.getState());
    this.notifyListeners(); // Ensure listeners are notified after state change
  }

  private tick(): void {
    if (!this.state.isRunning || this.state.isPaused || !this.sessionStartTime) {
      return; // Don't tick if not running, paused, or session hasn't started
    }

    const now = Date.now();
    const elapsedSeconds = (now - this.sessionStartTime) / 1000 - this.totalPausedTime;
    const newTimeRemaining = Math.max(0, this.state.totalDuration - elapsedSeconds);

    this.state.timeRemaining = newTimeRemaining;
    this.state.progress = Math.max(0, Math.min(1, elapsedSeconds / this.state.totalDuration));

    // console.log(`Tick: Elapsed=${elapsedSeconds.toFixed(1)}s, Paused=${this.totalPausedTime.toFixed(1)}s, Remaining=${newTimeRemaining.toFixed(1)}s, Progress=${this.state.progress.toFixed(2)}`);

    if (this.state.timeRemaining <= 0) {
      console.log("FocusTimer: Time reached zero.");
      this.end(); // Automatically end the session when time runs out
    } else {
      this.notifyListeners(); // Notify listeners on each tick
    }
  }

  private startIntervalTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear existing interval just in case
    }
    // Initial tick to update state immediately
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000); // Update every second
    console.log("FocusTimer: Interval timer started.");
  }

  getState(): TimerState {
    // Ensure calculated state is up-to-date if needed, but tick should handle it
     if (this.state.isRunning && !this.state.isPaused && this.sessionStartTime) {
        const now = Date.now();
        const elapsedSeconds = (now - this.sessionStartTime) / 1000 - this.totalPausedTime;
        const currentTimeRemaining = Math.max(0, this.state.totalDuration - elapsedSeconds);
        const currentProgress = Math.max(0, Math.min(1, elapsedSeconds / this.state.totalDuration));

        // Only return updated state if significantly different? Or always return calculated?
        // Let's return the calculated state for accuracy.
         return {
             ...this.state,
             timeRemaining: currentTimeRemaining,
             progress: currentProgress,
         };
     }
    return { ...this.state }; // Return a copy
  }

   // Cleanup function for React components
   cleanup(): void {
    console.log("FocusTimer: Cleanup called.");
    this.stop(); // Ensure timer is stopped
    this.listeners = []; // Clear listeners
  }
}
