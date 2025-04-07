import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  FocusProfile, 
  FocusSession, 
  initStorage, 
  getFocusProfiles, 
  getActiveProfile,
  getDailyIntention,
  setDailyIntention as setStorageIntention,
  updateProfile,
  createProfile as createStorageProfile,
  deleteProfile as deleteStorageProfile,
  getFocusHistory,
  getFocusGoal,
  getWeeklyFocusGoal,
  getStreaks,
  getActiveFocusSession
} from '../lib/chromeStorage';
import { FocusTimer, TimerState } from '../lib/focusTimer';

interface FocusContextType {
  profiles: FocusProfile[];
  activeProfile: FocusProfile | null;
  dailyIntention: string;
  isLoading: boolean;
  focusTimer: {
    state: TimerState;
    start: (profileId?: number) => Promise<void>;
    pause: () => void;
    reset: () => void;
    end: () => Promise<void>;
    formattedTime: string;
  };
  stats: {
    todayMinutes: number;
    todayGoal: number;
    todayPercentage: number;
    weeklyData: { day: string, minutes: number }[];
    streaks: { current: number, best: number };
  };
  setDailyIntention: (intention: string) => Promise<void>;
  setActiveProfile: (id: number) => Promise<void>;
  createProfile: (profile: Omit<FocusProfile, 'id' | 'lastUsed'>) => Promise<void>;
  updateProfile: (id: number, updates: Partial<FocusProfile>) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const FocusContext = createContext<FocusContextType | null>(null);

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};

interface FocusProviderProps {
  children: ReactNode;
}

export const FocusProvider: React.FC<FocusProviderProps> = ({ children }) => {
  const [profiles, setProfiles] = useState<FocusProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<FocusProfile | null>(null);
  const [dailyIntention, setDailyIntentionState] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    timeRemaining: 45 * 60,
    progress: 0,
    totalDuration: 45 * 60
  });
  const [stats, setStats] = useState({
    todayMinutes: 0,
    todayGoal: 240,
    todayPercentage: 0,
    weeklyData: [] as { day: string, minutes: number }[],
    streaks: { current: 0, best: 0 }
  });
  
  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      await initStorage();
      await refreshData();
      setIsLoading(false);
    };
    
    loadData();
    
    // Subscribe to timer updates
    const timer = FocusTimer.getInstance();
    const unsubscribe = timer.subscribe(setTimerState);
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Load and update all data
  const refreshData = async () => {
    try {
      // Get profiles
      const allProfiles = await getFocusProfiles();
      setProfiles(allProfiles);
      
      // Get active profile
      const active = await getActiveProfile();
      setActiveProfile(active || null);
      
      // Get daily intention
      const intention = await getDailyIntention();
      setDailyIntentionState(intention);
      
      // Get focus history and stats
      const history = await getFocusHistory();
      const dailyGoal = await getFocusGoal();
      const userStreaks = await getStreaks();
      
      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayMinutes = history[today] || 0;
      const todayPercentage = Math.min(Math.round((todayMinutes / dailyGoal) * 100), 100);
      
      // Get weekly data
      const weeklyData = getWeeklyStats(history);
      
      setStats({
        todayMinutes,
        todayGoal: dailyGoal,
        todayPercentage,
        weeklyData,
        streaks: userStreaks
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  // Helper to get weekly stats in the right format
  const getWeeklyStats = (history: Record<string, number>) => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const result = [];
    
    // Get dates for the last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      result.push({
        day: days[6 - i],
        minutes: history[dateString] || 0
      });
    }
    
    return result;
  };
  
  // Set daily intention
  const handleSetDailyIntention = async (intention: string) => {
    await setStorageIntention(intention);
    setDailyIntentionState(intention);
  };
  
  // Set active profile
  const handleSetActiveProfile = async (id: number) => {
    await updateProfile(id, { isActive: true });
    await refreshData();
  };
  
  // Create new profile
  const handleCreateProfile = async (profile: Omit<FocusProfile, 'id' | 'lastUsed'>) => {
    await createStorageProfile(profile);
    await refreshData();
  };
  
  // Update profile
  const handleUpdateProfile = async (id: number, updates: Partial<FocusProfile>) => {
    await updateProfile(id, updates);
    await refreshData();
  };
  
  // Delete profile
  const handleDeleteProfile = async (id: number) => {
    await deleteStorageProfile(id);
    await refreshData();
  };
  
  // Timer functions
  const timer = FocusTimer.getInstance();
  
  const formattedTime = `${Math.floor(timerState.timeRemaining / 60)}:${Math.floor(timerState.timeRemaining % 60).toString().padStart(2, '0')}`;
  
  // Context value
  const value: FocusContextType = {
    profiles,
    activeProfile,
    dailyIntention,
    isLoading,
    focusTimer: {
      state: timerState,
      start: timer.start.bind(timer),
      pause: timer.pause.bind(timer),
      reset: timer.reset.bind(timer),
      end: timer.end.bind(timer),
      formattedTime
    },
    stats,
    setDailyIntention: handleSetDailyIntention,
    setActiveProfile: handleSetActiveProfile,
    createProfile: handleCreateProfile,
    updateProfile: handleUpdateProfile,
    deleteProfile: handleDeleteProfile,
    refreshData
  };
  
  return (
    <FocusContext.Provider value={value}>
      {children}
    </FocusContext.Provider>
  );
};
