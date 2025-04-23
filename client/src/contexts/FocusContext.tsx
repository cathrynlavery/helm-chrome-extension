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
  const [profiles, setProfiles] = useState<StorageFocusProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<StorageFocusProfile | null>(null);
  // Use correct initial state
  const [timerState, setTimerState] = useState<TimerState>(defaultTimerState);
  const [stats, setStats] = useState<FocusStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTargets, setDailyTargets] = useState<DailyTarget[]>([]);
  
  // Memoize the FocusTimer instance
  const focusTimer = useMemo(() => {
    console.log("Creating new FocusTimer instance");
    // Pass initial state if needed, or handle restoration later
    return new FocusTimer(); 
  }, []);

  // Load initial data - (logic remains largely the same, ensure it uses FocusTimerLibState where applicable internally if needed for restoration)
  useEffect(() => {
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

  // Subscribe to timer updates
  useEffect(() => {
     console.log("FocusContext: Subscribing to timer updates.");
     // The state from the timer library might have a different shape (FocusTimerLibState)
    const unsubscribe = focusTimer.subscribe((timerLibState: FocusTimerLibState) => {
      console.log("FocusContext: Received timer state update from lib:", timerLibState);
      // Map the library state to the context state
      setTimerState({
        isRunning: timerLibState.isRunning,
        isPaused: timerLibState.isPaused, // Get isPaused from the lib state
        timeRemaining: timerLibState.timeRemaining,
        totalDuration: timerLibState.totalDuration,
        progress: timerLibState.progress,
        profileId: timerLibState.profileId,
      });
    });

    return () => {
      console.log("FocusContext: Unsubscribing from timer updates.");
      unsubscribe();
    };
  }, [focusTimer]); 
  
 // ... (rest of the handlers remain the same)
 
   // Timer control functions
   const startTimerHandler = useCallback(async (profileId: number, durationSeconds: number) => {
    console.log(`FocusContext: startTimer called - profileId: ${profileId}, duration: ${durationSeconds}s`);
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
  
  const [hasEnded, setHasEnded] = useState(false);
const sendMessageToExtension = useCallback((message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime?.sendMessage) {
        return reject(new Error("chrome.runtime.sendMessage is not available"));
      }
      try {
        chrome.runtime.sendMessage("aajfaclleggpdbjjlpdpmcmpopigibfo", message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const endTimerHandler = useCallback(async (saveProgress: boolean = true) => {
    if (hasEndedRef.current || !timerState.isRunning) return;
    hasEndedRef.current = true;

    console.log("⏹ Ending timer with saveProgress=", saveProgress);
    await focusTimer.end(saveProgress);

    try {
      const result = await sendMessageToExtension({ type: "STOP_FOCUS_SESSION" });
      console.log("✅ Extension responded:", result);
    } catch (e) {
      console.error("❌ Failed to notify extension:", e);
    }

    const data = await getStorageData();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const lastActive = data.streaks?.lastActiveDate;
    let currentStreak = data.streaks?.current || 0;
    let bestStreak = data.streaks?.best || 0;

    if (lastActive !== today) {
      if (lastActive === yesterday) currentStreak += 1;
      else currentStreak = 1;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
      data.streaks = { current: currentStreak, best: bestStreak, lastActiveDate: today };
      await setStorageData(data);
      setStats((prev) => ({ ...prev, streaks: { current: currentStreak, best: bestStreak } }));
    }

    const todayMinutes = data.focusHistory?.[today] || 0;
    const weeklyMinutes = Object.values(data.focusHistory || {}).reduce((sum, mins) => sum + mins, 0);
    const focusGoal = data.focusGoal || 240;
    const todayPercentage = Math.min(100, Math.round((todayMinutes / focusGoal) * 100));
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const weeklyData = days.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateStr = date.toISOString().split("T")[0];
      return { day, minutes: data.focusHistory?.[dateStr] || 0 };
    });

    setStats((prev) => ({
      ...prev,
      todayMinutes,
      weeklyMinutes,
      todayGoal: focusGoal,
      todayPercentage,
      weeklyData,
    }));
  }, [focusTimer, sendMessageToExtension, setStats, timerState.isRunning]);

  useEffect(() => {
    const unsubscribe = focusTimer.subscribe((state: FocusTimerLibState) => {
      setTimerState({
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        timeRemaining: state.timeRemaining,
        totalDuration: state.totalDuration,
        progress: state.progress,
        profileId: state.profileId,
      });

      if (!state.isRunning && !state.isPaused && state.timeRemaining === 0 && !hasEndedRef.current) {
        console.log("⏱ Detected timer end via state — calling endTimer");
        endTimerHandler(true);
      }
    });
    return () => unsubscribe();
  }, [focusTimer, endTimerHandler]);


  
  // Profile management functions
  const setActiveProfileHandler = useCallback(async (profile: StorageFocusProfile) => {
    console.log(`FocusContext: Setting active profile to: ${profile.name}`);
    setActiveProfileState(profile);
    // Persist this change
    const data = await getStorageData();
    const updatedProfiles = data.focusProfiles.map(p => ({ ...p, isActive: p.id === profile.id }));
    // await setStorageData({ ...data, focusProfiles: updatedProfiles });
  }, []);

  const createProfileHandler = useCallback(async (profileData: Omit<StorageFocusProfile, 'id' | 'lastUsed' | 'isActive'>) => {
    console.log("FocusContext: Creating profile:", profileData.name);
    const data = await getStorageData();
    const maxId = data.focusProfiles.reduce((max, p) => Math.max(max, p.id), 0);
    const newProfile: StorageFocusProfile = {
      ...profileData,
      id: maxId + 1,
      lastUsed: new Date().toISOString(),
      isActive: false, // New profiles are not active by default
    };
    const updatedProfiles = [...data.focusProfiles, newProfile];
    // await setStorageData({ ...data, focusProfiles: updatedProfiles });
    setProfiles(updatedProfiles);
  }, []);

  const updateProfileHandler = useCallback(async (id: number, updates: Partial<StorageFocusProfile>) => {
     console.log(`FocusContext: Updating profile ${id} with:`, updates);
    const data = await getStorageData();
    let activeProfileChanged = false;
    const updatedProfiles = data.focusProfiles.map(p => {
      if (p.id === id) {
        const updatedProfile = { ...p, ...updates };
         // If this profile is being set active, ensure others are inactive
         if (updates.isActive && updates.isActive === true) {
            // Deactivate all other profiles first
            data.focusProfiles.forEach(prof => { if (prof.id !== id) prof.isActive = false; });
             // Ensure the current one being updated is marked active
            updatedProfile.isActive = true;
             setActiveProfileState(updatedProfile);
             activeProfileChanged = true;
         }
         // Handle case where the active profile is being deactivated
         else if (updates.isActive === false && p.isActive) {
              setActiveProfileState(null); // Or set to another default? Needs thought.
              activeProfileChanged = true; // Mark that active status might need recalculation
         }
        return updatedProfile;
      }
       // If another profile was set active by the update loop, ensure this one is not
       if (activeProfileChanged && updates.isActive && updates.isActive === true && p.id !== id) {
          return { ...p, isActive: false };
       }
      return p;
    });

    // Post-map check to ensure only one profile is active if the update logic didn't guarantee it
    const currentlyActiveProfiles = updatedProfiles.filter(p => p.isActive);
    if (currentlyActiveProfiles.length > 1) {
        console.warn("Multiple active profiles detected after update, correcting...");
        // Prioritize the explicitly updated one if it exists and was meant to be active
        const intendedActive = updatedProfiles.find(p => p.id === id && updates.isActive === true);
        updatedProfiles.forEach(p => p.isActive = (p.id === (intendedActive?.id || currentlyActiveProfiles[0].id)));
    } else if (currentlyActiveProfiles.length === 0 && updatedProfiles.length > 0) {
        console.warn("No active profile detected after update, setting first as active.");
        updatedProfiles[0].isActive = true; // Default to first if none are active
    }

    const finalActiveProfile = updatedProfiles.find(p => p.isActive) || null;
    setActiveProfileState(finalActiveProfile);

    // await setStorageData({ ...data, focusProfiles: updatedProfiles });
    setProfiles(updatedProfiles);
  }, []);

  const deleteProfileHandler = useCallback(async (id: number) => {
    console.log(`FocusContext: Deleting profile ${id}`);
    const data = await getStorageData();
    const updatedProfiles = data.focusProfiles.filter(p => p.id !== id);
    let newActiveProfile: StorageFocusProfile | null = null;
    // If the deleted profile was active, select another one (e.g., the first one)
    if (activeProfile?.id === id) {
      newActiveProfile = updatedProfiles.length > 0 ? updatedProfiles[0] : null;
      if (newActiveProfile) {
        // Ensure the new active profile is marked as active in the list being saved
        updatedProfiles.forEach(p => p.isActive = (p.id === newActiveProfile!.id));
      }
      setActiveProfileState(newActiveProfile);
    }
    // await setStorageData({ ...data, focusProfiles: updatedProfiles });
    setProfiles(updatedProfiles);
  }, [activeProfile]);

  // Focus goal handler
  const setFocusGoalHandler = useCallback(async (minutes: number) => {
    console.log(`FocusContext: Setting focus goal to ${minutes} minutes`);
    
    // Update stats with new goal and percentage
    const todayPercentage = stats.todayMinutes > 0 ? Math.min(100, Math.round((stats.todayMinutes / minutes) * 100)) : 0;
    
    setStats({
      ...stats,
      todayGoal: minutes,
      todayPercentage
    });
    
    // Persist to storage
    const data = await getStorageData();
    // await setStorageData({ ...data, focusGoal: minutes });
  }, [stats]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      console.log("FocusContext: Cleaning up FocusTimer instance.");
      focusTimer.cleanup();
    };
  }, [focusTimer]);

  // Daily targets handlers
  const addTargetHandler = useCallback(async (text: string) => {
    console.log(`FocusContext: Adding daily target: ${text}`);
    const newTarget: DailyTarget = {
      id: Date.now(),
      text,
      completed: false,
      date: new Date().toISOString().split('T')[0]
    };
    
    const updatedTargets = [...dailyTargets, newTarget];
    setDailyTargets(updatedTargets);
    
    // Persist to storage
    const data = await getStorageData();
    // await setStorageData({ ...data, dailyTargets: updatedTargets });
  }, [dailyTargets]);
  
  const updateTargetHandler = useCallback(async (id: number, updates: Partial<DailyTarget>) => {
    console.log(`FocusContext: Updating daily target ${id} with:`, updates);
    const updatedTargets = dailyTargets.map(target => 
      target.id === id ? { ...target, ...updates } : target
    );
    
    setDailyTargets(updatedTargets);
    
    // Persist to storage
    const data = await getStorageData();
    // await setStorageData({ ...data, dailyTargets: updatedTargets });
  }, [dailyTargets]);
  
  const deleteTargetHandler = useCallback(async (id: number) => {
    console.log(`FocusContext: Deleting daily target ${id}`);
    const updatedTargets = dailyTargets.filter(target => target.id !== id);
    
    setDailyTargets(updatedTargets);
    
    // Persist to storage
    const data = await getStorageData();
    // await setStorageData({ ...data, dailyTargets: updatedTargets });
  }, [dailyTargets]);

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
