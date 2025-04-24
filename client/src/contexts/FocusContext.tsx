import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { FocusTimer, TimerState as FocusTimerLibState } from '../lib/focusTimer';
import { getStorageData, setStorageData, FocusProfile as StorageFocusProfile, DailyTarget } from '../lib/chromeStorage';

// Define the TimerState used within this context
interface TimerState {
  isRunning: boolean;
  isPaused: boolean; 
  timeRemaining: number; // in seconds
  totalDuration: number; // in seconds
  progress: number; // 0 to 1
  profileId: number | null;
}

interface FocusStats {
  todayMinutes: number;
  weeklyMinutes: number;
  todayGoal: number; // in minutes
  todayPercentage: number; // percentage of goal completed
  weeklyData: {
    day: string;
    minutes: number;
  }[];
  streaks: {
    current: number;
    best: number;
  };
}

interface FocusContextType {
  profiles: StorageFocusProfile[];
  activeProfile: StorageFocusProfile | null;
  timerState: TimerState;
  stats: FocusStats;
  isLoading: boolean;
  setStats: React.Dispatch<React.SetStateAction<FocusStats>>;
  dailyTargets: DailyTarget[];
  addTarget: (text: string) => void;
  updateTarget: (id: number, updates: Partial<DailyTarget>) => void;
  deleteTarget: (id: number) => void;
  setFocusGoal: (minutes: number) => Promise<void>;
  startTimer: (profileId: number, durationSeconds: number) => Promise<void>;
  pauseTimer: () => void;
  endTimer: (saveProgress?: boolean) => Promise<void>;
  setActiveProfile: (profile: StorageFocusProfile) => void;
  createProfile: (profileData: Omit<StorageFocusProfile, 'id' | 'lastUsed' | 'isActive'>) => Promise<void>;
  updateProfile: (id: number, updates: Partial<StorageFocusProfile>) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
}

// Correct default state object shape
const defaultTimerState: TimerState = {
  isRunning: false,
  isPaused: false,
  timeRemaining: 0,
  totalDuration: 0,
  progress: 0,
  profileId: null,
};

const defaultStats: FocusStats = {
  todayMinutes: 0,
  weeklyMinutes: 0,
  todayGoal: 0,
  todayPercentage: 0,
  weeklyData: [],
  streaks: { current: 0, best: 0 },
};

const FocusContext = createContext<FocusContextType | undefined>(undefined);

interface FocusProviderProps {
  children: React.ReactNode;
}

export const FocusProvider: React.FC<FocusProviderProps> = ({ children }) => {
  // 1. First, define all state variables
  const [profiles, setProfiles] = useState<StorageFocusProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<StorageFocusProfile | null>(null);
  const [timerState, setTimerState] = useState<TimerState>(defaultTimerState);
  const [stats, setStats] = useState<FocusStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTargets, setDailyTargets] = useState<DailyTarget[]>([]);
  const [hasEnded, setHasEnded] = useState(false);
  
  // 2. Create any memoized values
  const focusTimer = useMemo(() => {
    console.log("Creating new FocusTimer instance");
    return new FocusTimer(); 
  }, []);

  // 3. Define the sendMessageToExtension helper
  const EXTENSION_ID = "aajfaclleggpdbjjlpdpmcmpopigibfo";

  const sendMessageToExtension = useCallback((message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime?.sendMessage) {
        return reject(new Error("chrome.runtime.sendMessage is not available"));
      }
  
      try {
        console.log("📤 Sending external message to extension:", message);
        chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Extension error:", chrome.runtime.lastError.message);
            reject(chrome.runtime.lastError);
          } else {
            console.log("✅ Extension responded:", response);
            resolve(response);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }, []);
  
  // 4. Define ALL handler functions before any useEffects that use them
  const endTimerHandler = useCallback(async (saveProgress: boolean = true) => {
    console.log("⏹ Ending timer with saveProgress=", saveProgress);
    
    // Use this flag to prevent duplicate executions
    if (hasEnded) {
      console.log("Timer already ended, skipping duplicate end call");
      return;
    }
    
    // Set hasEnded first to prevent race conditions
    setHasEnded(true);
    
    // End the timer in the focus timer lib
    await focusTimer.end(saveProgress);

    // IMPORTANT: Get storage data and update focus history
    const data = await getStorageData();
    
    // Check if we have a valid session duration to record
    const sessionDuration = Math.floor((timerState.totalDuration - timerState.timeRemaining) / 60);
    console.log(`Session completed: ${sessionDuration} minutes`);
    
    if (sessionDuration > 0 && saveProgress) {
      // Get today's date in YYYY-MM-DD format for the history key
      const today = new Date().toISOString().split('T')[0];
      
      // Update focus history for today
      if (!data.focusHistory) {
        data.focusHistory = {};
      }
      
      // Initialize today's minutes if not present
      if (!data.focusHistory[today]) {
        data.focusHistory[today] = 0;
      }
      
      // Add session minutes to today's total
      console.log(`🧠 Adding ${sessionDuration} minutes to focusHistory for ${today}`);
      data.focusHistory[today] += sessionDuration;
      
      // Update streak if needed
      const lastActiveDate = data.lastActiveDate || '';
      console.log(`📆 Streak check — lastActiveDate: ${lastActiveDate}`);
      
      if (lastActiveDate !== today) {
        // Check if yesterday was the last active date (for continuing streak)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        if (lastActiveDate === yesterdayString) {
          // Continue streak
          data.currentStreak = (data.currentStreak || 0) + 1;
          console.log(`🔥 Continuing streak: ${data.currentStreak} days`);
        } else {
          // Reset streak
          data.currentStreak = 1;
          console.log(`🔄 Resetting streak to 1 day`);
        }
        
        // Update last active date to today
        data.lastActiveDate = today;
      }
      
      // Save the updated data
      console.log("💾 Saving updated storage data...");
      await setStorageData(data);
      
      // Update stats in React state
      setStats(prev => {
        const todayMinutes = data.focusHistory[today] || 0;
        const todayGoal = data.focusGoal || 0;
        const todayPercentage = todayGoal > 0 ? Math.min(100, Math.round((todayMinutes / todayGoal) * 100)) : 0;
        
        return {
          ...prev,
          todayMinutes,
          todayGoal,
          todayPercentage,
          currentStreak: data.currentStreak || 0
        };
      });
    }

    // Send message to extension with session data
    if (timerState.totalDuration > 0) {
      try {
        const sessionData = {
          profileId: timerState.profileId,
          duration: timerState.totalDuration,
          timeCompleted: timerState.totalDuration - timerState.timeRemaining
        };
        
        console.log("📊 Session data being sent to extension:", sessionData);
        const result = await sendMessageToExtension({ 
          type: "STOP_FOCUS_SESSION",
          data: sessionData
        });
        console.log("✅ Extension responded:", result);
      } catch (e) {
        console.error("❌ Failed to notify extension:", e);
      }
    } else {
      console.warn("⚠️ Not sending session data to extension - invalid duration", timerState);
    }

    console.log("✅ Session successfully ended and saved");
  }, [focusTimer, sendMessageToExtension, hasEnded, timerState]);

  // Define other handler functions...
  const startTimerHandler = useCallback(async (profileId: number, durationSeconds: number) => {
    console.log(`FocusContext: startTimer called - profileId: ${profileId}, duration: ${durationSeconds}s`);
    // Reset hasEnded flag when starting a new session
    setHasEnded(false);
    await focusTimer.start(profileId, durationSeconds);
    // Explicitly update React state after starting/resuming
    const currentState = focusTimer.getState();
    setTimerState({
      isRunning: currentState.isRunning,
      isPaused: currentState.isPaused,
      timeRemaining: currentState.timeRemaining,
      totalDuration: currentState.totalDuration,
      progress: currentState.progress,
      profileId: currentState.profileId,
    });
  }, [focusTimer]);

  const pauseTimerHandler = useCallback(() => {
    console.log("FocusContext: pauseTimer called");
    focusTimer.pause();
    // Explicitly update React state after pausing
    const currentState = focusTimer.getState();
    setTimerState({
      isRunning: currentState.isRunning,
      isPaused: currentState.isPaused,
      timeRemaining: currentState.timeRemaining,
      totalDuration: currentState.totalDuration,
      progress: currentState.progress,
      profileId: currentState.profileId,
    });
  }, [focusTimer]);

  // Define all the missing handlers
  const addTargetHandler = useCallback(async (text: string) => {
    const data = await getStorageData();
    const newTarget: DailyTarget = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedTargets = [...(data.dailyTargets || []), newTarget];
    data.dailyTargets = updatedTargets;
    await setStorageData(data);
    setDailyTargets(updatedTargets);
  }, []);

  const updateTargetHandler = useCallback(async (id: number, updates: Partial<DailyTarget>) => {
    const data = await getStorageData();
    const updatedTargets = (data.dailyTargets || []).map(target => 
      target.id === id ? { ...target, ...updates } : target
    );
    data.dailyTargets = updatedTargets;
    await setStorageData(data);
    setDailyTargets(updatedTargets);
  }, []);

  const deleteTargetHandler = useCallback(async (id: number) => {
    const data = await getStorageData();
    const updatedTargets = (data.dailyTargets || []).filter(target => target.id !== id);
    data.dailyTargets = updatedTargets;
    await setStorageData(data);
    setDailyTargets(updatedTargets);
  }, []);

  const setActiveProfileHandler = useCallback(async (profile: StorageFocusProfile) => {
    const data = await getStorageData();
    const updatedProfiles = (data.focusProfiles || []).map(p => ({
      ...p,
      isActive: p.id === profile.id,
      lastUsed: p.id === profile.id ? new Date().toISOString() : p.lastUsed
    }));
    
    data.focusProfiles = updatedProfiles;
    await setStorageData(data);
    setProfiles(updatedProfiles);
    setActiveProfileState(profile);
  }, []);

  const createProfileHandler = useCallback(async (profileData: Omit<StorageFocusProfile, 'id' | 'lastUsed' | 'isActive'>) => {
    const data = await getStorageData();
    const newProfile: StorageFocusProfile = {
      ...profileData,
      id: Date.now(),
      lastUsed: new Date().toISOString(),
      isActive: false
    };
    
    const updatedProfiles = [...(data.focusProfiles || []), newProfile];
    data.focusProfiles = updatedProfiles;
    await setStorageData(data);
    setProfiles(updatedProfiles);
  }, []);

  const updateProfileHandler = useCallback(async (id: number, updates: Partial<StorageFocusProfile>) => {
    const data = await getStorageData();
    const updatedProfiles = (data.focusProfiles || []).map(profile => 
      profile.id === id ? { ...profile, ...updates } : profile
    );
    
    data.focusProfiles = updatedProfiles;
    await setStorageData(data);
    setProfiles(updatedProfiles);
    
    // Update active profile if needed
    if (activeProfile?.id === id) {
      const updatedActiveProfile = updatedProfiles.find(p => p.id === id) || null;
      setActiveProfileState(updatedActiveProfile);
    }
  }, [activeProfile]);

  const deleteProfileHandler = useCallback(async (id: number) => {
    const data = await getStorageData();
    const updatedProfiles = (data.focusProfiles || []).filter(profile => profile.id !== id);
    
    data.focusProfiles = updatedProfiles;
    await setStorageData(data);
    setProfiles(updatedProfiles);
    
    // Clear active profile if it was deleted
    if (activeProfile?.id === id) {
      setActiveProfileState(null);
    }
  }, [activeProfile]);

  const setFocusGoalHandler = useCallback(async (minutes: number) => {
    const data = await getStorageData();
    data.focusGoal = minutes;
    await setStorageData(data);
    
    // Update stats with new goal
    setStats(prev => ({
      ...prev,
      todayGoal: minutes,
      todayPercentage: minutes > 0 ? Math.min(100, Math.round((prev.todayMinutes / minutes) * 100)) : 0
    }));
  }, []);

  // 5. NOW define useEffects that use those handlers
  useEffect(() => {
    // Load initial data effect
    const loadData = async () => {
      console.log("FocusContext: Loading initial data...");
      setIsLoading(true);
      try {
        const data = await getStorageData();
        console.log("FocusContext: Raw data loaded from storage:", data);
        setProfiles(data.focusProfiles || []);
        setDailyTargets(data.dailyTargets || []);
        const currentActiveProfile = data.focusProfiles?.find(p => p.isActive) || null;
        setActiveProfileState(currentActiveProfile);
        console.log("FocusContext: Active profile set:", currentActiveProfile?.name);
        
        const today = new Date().toISOString().split('T')[0];
        const todayMinutes = data.focusHistory?.[today] || 0;
        const weeklyMinutes = Object.values(data.focusHistory || {}).reduce((sum, mins) => sum + mins, 0);
        
        // Get the goal or use default
        const focusGoal = data.focusGoal || 240; // Default to 4 hours
        const todayPercentage = focusGoal > 0 ? Math.min(100, Math.round((todayMinutes / focusGoal) * 100)) : 0;
        
        // Generate weekly data
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const weeklyData = days.map((day, index) => {
          const date = new Date();
          // Get data for the past 7 days
          date.setDate(date.getDate() - (6 - index));
          const dateStr = date.toISOString().split('T')[0];
          return {
            day,
            minutes: data.focusHistory?.[dateStr] || 0
          };
        });
        
        setStats({
          todayMinutes,
          weeklyMinutes,
          todayGoal: focusGoal,
          todayPercentage,
          weeklyData,
          streaks: data.streaks || { current: 0, best: 0 },
        });
        
        const activeSession = data.activeFocusSession;
        if (activeSession && activeSession.isActive) {
          console.log("FocusContext: Restoring active session:", activeSession);
          // Note: FocusTimer class now handles its own restoration potentially
          // We might just need to get the initial state from storage and pass it to the constructor
          // Or rely on the timer class's own start/restore logic if it reads from storage
          // For now, let's assume the timer class `start` handles restoration based on profileId/duration
          
          // Calculate initial intended duration for restoration
          // This logic might need refinement depending on how session duration is stored/managed
          let intendedDuration = 45 * 60; // Default fallback
          if (activeSession.duration > 0) {
              intendedDuration = activeSession.duration; 
          } else if (currentActiveProfile) {
              // Logic to determine intended duration if not explicitly stored
              // Maybe based on profile settings or a default?
              // Let's stick to a simple default for now
              console.warn("Active session found but duration is 0, using default.")
          }

          // Pass the *original* intended duration to start for correct calculations
          await focusTimer.start(activeSession.profileId, intendedDuration);
          console.log("FocusContext: Timer restored and started via focusTimer.start");

        } else {
           console.log("FocusContext: No active session found in storage.");
           setTimerState(defaultTimerState); // Ensure default state if no active session
        }

      } catch (error) {
        console.error("FocusContext: Error loading data:", error);
        setProfiles([]);
        setActiveProfileState(null);
        setTimerState(defaultTimerState);
        setStats(defaultStats);
      } finally {
        setIsLoading(false);
        console.log("FocusContext: Initial data loading finished.");
      }
    };

    loadData();
  // Assuming focusTimer instance is stable due to useMemo
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); 

  // Timer state update subscription
  useEffect(() => {
    console.log("FocusContext: Subscribing to timer updates.");
    
    // Use a regular variable instead of useRef
    const isProcessingUpdate = { current: false };
    
    const unsubscribe = focusTimer.subscribe((timerLibState: FocusTimerLibState) => {
      // Prevent recursive updates
      if (isProcessingUpdate.current) {
        console.log("Skipping recursive timer update");
        return;
      }
      
      isProcessingUpdate.current = true;
      console.log("FocusContext: Received timer state update from lib:", timerLibState);
      
      // Use functional state update to avoid dependencies on previous state
      setTimerState({
        isRunning: timerLibState.isRunning,
        isPaused: timerLibState.isPaused,
        timeRemaining: timerLibState.timeRemaining,
        totalDuration: timerLibState.totalDuration,
        progress: timerLibState.progress,
        profileId: timerLibState.profileId,
      });
      
      // Reset the processing flag after a short delay
      setTimeout(() => {
        isProcessingUpdate.current = false;
      }, 0);
    });

    return () => {
      console.log("FocusContext: Unsubscribing from timer updates.");
      unsubscribe();
    };
  }, [focusTimer]);

  // Separate effect for handling timer completion
  useEffect(() => {
    // Don't put the subscription logic here - just check the current state
    if (!timerState.isRunning && !timerState.isPaused && 
        timerState.timeRemaining === 0 && timerState.totalDuration > 0) {
      if (!hasEnded) {
        console.log("⏱ Auto-ending session from timerState check");
        endTimerHandler(true);
      }
    }
  }, [timerState, hasEnded, endTimerHandler]);

  // ... other effects ...

  // 6. Finally create the context value and return the provider
  const contextValue = useMemo(() => ({
    profiles,
    activeProfile,
    timerState,
    stats,
    isLoading,
    setStats,
    dailyTargets,
    addTarget: addTargetHandler,
    updateTarget: updateTargetHandler,
    deleteTarget: deleteTargetHandler,
    startTimer: startTimerHandler,
    pauseTimer: pauseTimerHandler,
    endTimer: endTimerHandler,
    setActiveProfile: setActiveProfileHandler,
    createProfile: createProfileHandler,
    updateProfile: updateProfileHandler,
    deleteProfile: deleteProfileHandler,
    setFocusGoal: setFocusGoalHandler,
  }), [profiles, activeProfile, timerState, stats, isLoading, dailyTargets, addTargetHandler, updateTargetHandler, deleteTargetHandler, startTimerHandler, pauseTimerHandler, endTimerHandler, setActiveProfileHandler, createProfileHandler, updateProfileHandler, deleteProfileHandler, setFocusGoalHandler]);

  return (
    <FocusContext.Provider value={contextValue}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
