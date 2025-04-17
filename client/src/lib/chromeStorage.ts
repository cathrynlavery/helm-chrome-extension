// Chrome storage API wrapper for async/await
/// <reference types="chrome"/>

// Create a type-safe check for chrome API availability in a development environment
// Define our custom extension of the Window interface without redefining chrome property
declare global {
  interface Window {
    // Omit chrome property to avoid conflicts with Chrome Extension types
  }
}
export interface DailyTarget {
  id: number;
  text: string;
  completed: boolean;
  date: string; // ISO string date
}

export interface StorageData {
  focusProfiles: FocusProfile[];
  activeFocusSession: FocusSession | null;
  dailyIntention: string;
  dailyTargets: DailyTarget[];
  focusGoal: number; // daily focus goal in minutes
  weeklyFocusGoal: number; // weekly focus goal in minutes
  focusHistory: Record<string, number>; // date string to minutes
  streaks: {
    current: number;
    best: number;
    lastActiveDate: string | null;
  };
}

export interface FocusProfile {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  blockedSites: string[];
  lastUsed: string;
  accessStyle: 'allowlist' | 'blocklist';
}

export interface FocusSession {
  id: number;
  profileId: number;
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
  isActive: boolean;
}

const defaultData: StorageData = {
  focusProfiles: [
    {
      id: 1,
      name: "Work Profile",
      description: "For focused work time without social media distractions",
      isActive: true,
      blockedSites: ["facebook.com", "twitter.com", "instagram.com"],
      lastUsed: new Date().toISOString(),
      accessStyle: 'blocklist'
    },
  ],
  activeFocusSession: null,
  dailyIntention: "Complete the product research for my team meeting",
  dailyTargets: [
    {
      id: 1,
      text: "Finish quarterly report",
      completed: false,
      date: getDateString(new Date())
    },
    {
      id: 2,
      text: "Review presentation slides",
      completed: true,
      date: getDateString(new Date())
    },
    {
      id: 3,
      text: "Respond to client emails",
      completed: false,
      date: getDateString(new Date())
    }
  ],
  focusGoal: 240, // 4 hours in minutes
  weeklyFocusGoal: 1200, // 20 hours in minutes
  focusHistory: {
    [getDateString(new Date())]: 0,
  },
  streaks: {
    current: 0,
    best: 0,
    lastActiveDate: null
  }
};

// Helper function to get date string in YYYY-MM-DD format
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to check if we're in a Chrome extension context
const isChromeExtension = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.chrome !== 'undefined' && 
         !!window.chrome.storage;
};

// Initialize with default data if not already set
export const initStorage = async (): Promise<void> => {
  try {
    if (isChromeExtension() && window.chrome?.storage?.local) {
      const data = await window.chrome.storage.local.get('helmData');
      if (!data.helmData) {
        await window.chrome.storage.local.set({ helmData: defaultData });
      }
    } else {
      // If not running in a Chrome extension context, use localStorage for development
      if (!localStorage.getItem('helmData')) {
        localStorage.setItem('helmData', JSON.stringify({
          ...defaultData,
          // Ensure dailyTargets exists in default data
          dailyTargets: defaultData.dailyTargets || []
        }));
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    // Fallback to ensure we have data
    localStorage.setItem('helmData', JSON.stringify({
      ...defaultData,
      dailyTargets: defaultData.dailyTargets || []
    }));
  }
};

// Get all data
export const getStorageData = async (key: string = 'helmData'): Promise<StorageData> => {
  try {
    if (isChromeExtension() && window.chrome?.storage?.local) {
      const data = await window.chrome.storage.local.get(key);
      return data[key] as StorageData;
    } else {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultData;
    }
  } catch (error) {
    console.error('Error getting storage data:', error);
    return defaultData;
  }
};

// Set all data
export const setStorageData = async (key: string, data: StorageData): Promise<void> => {
  try {
    if (isChromeExtension() && window.chrome?.storage?.local) {
      await window.chrome.storage.local.set({ [key]: data });
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error setting storage data:', error);
  }
};


// Helper functions for specific data
export const getFocusProfiles = async (): Promise<FocusProfile[]> => {
  const data = await getStorageData();
  return data.focusProfiles;
};

export const getActiveProfile = async (): Promise<FocusProfile | undefined> => {
  const profiles = await getFocusProfiles();
  return profiles.find(p => p.isActive);
};

export const updateProfile = async (
  id: number, 
  updates: Partial<FocusProfile>
): Promise<FocusProfile | undefined> => {
  const data = await getStorageData();
  const index = data.focusProfiles.findIndex(p => p.id === id);
  
  if (index === -1) return undefined;
  
  // If setting this profile to active, deactivate all others
  if (updates.isActive) {
    data.focusProfiles.forEach(p => {
      if (p.id !== id) p.isActive = false;
    });
  }
  
  // Update the profile
  data.focusProfiles[index] = {
    ...data.focusProfiles[index],
    ...updates,
    lastUsed: new Date().toISOString()
  };
  
  // await setStorageData(data);
  return data.focusProfiles[index];
};

export const createProfile = async (
  profile: Omit<FocusProfile, 'id' | 'lastUsed'>
): Promise<FocusProfile> => {
  const data = await getStorageData();
  
  // If setting this profile to active, deactivate all others
  if (profile.isActive) {
    data.focusProfiles.forEach(p => p.isActive = false);
  }
  
  // Generate new ID (max ID + 1)
  const maxId = data.focusProfiles.reduce((max, p) => Math.max(max, p.id), 0);
  const newProfile: FocusProfile = {
    ...profile,
    id: maxId + 1,
    lastUsed: new Date().toISOString()
  };
  
  data.focusProfiles.push(newProfile);
  // await setStorageData(data);
  return newProfile;
};

export const deleteProfile = async (id: number): Promise<boolean> => {
  const data = await getStorageData();
  const index = data.focusProfiles.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  data.focusProfiles.splice(index, 1);
  // await setStorageData(data);
  return true;
};

export const getDailyIntention = async (): Promise<string> => {
  const data = await getStorageData();
  return data.dailyIntention;
};

export const setDailyIntention = async (intention: string): Promise<void> => {
  const data = await getStorageData();
  data.dailyIntention = intention;
  // await setStorageData(data);
};

export const startFocusSession = async (profileId: number): Promise<FocusSession> => {
  const data = await getStorageData();
  
  // Make sure the profile is set as active
  const profileIndex = data.focusProfiles.findIndex(p => p.id === profileId);
  if (profileIndex !== -1) {
    data.focusProfiles.forEach((p, i) => {
      p.isActive = i === profileIndex;
    });
    
    data.focusProfiles[profileIndex].lastUsed = new Date().toISOString();
  }
  
  const session: FocusSession = {
    id: Date.now(),
    profileId,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    isActive: true
  };
  
  data.activeFocusSession = session;
  // await setStorageData(data);
  return session;
};

export const endFocusSession = async (saveProgress: boolean = true): Promise<FocusSession | null> => {
  console.log(`chromeStorage.endFocusSession called with saveProgress=${saveProgress}`);
  
  try {
    const data = await getStorageData();
    
    if (!data.activeFocusSession) {
      console.log('No active focus session found in storage');
      return null;
    }
    
    const endTime = new Date();
    const startTime = new Date(data.activeFocusSession.startTime);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    console.log('Ending session that started at:', startTime);
    console.log('Session duration in seconds:', durationSeconds);
    
    const endedSession: FocusSession = {
      ...data.activeFocusSession,
      endTime: endTime.toISOString(),
      duration: durationSeconds,
      isActive: false
    };
    
    // Update focus history only if saveProgress is true
    if (saveProgress) {
      const dateString = getDateString(new Date());
      const minutesFocused = Math.floor(durationSeconds / 60);
      
      data.focusHistory[dateString] = (data.focusHistory[dateString] || 0) + minutesFocused;
      
      // Update streak
      const today = getDateString(new Date());
      if (data.streaks.lastActiveDate !== today) {
        const yesterday = getDateString(new Date(Date.now() - 86400000));
        
        if (data.streaks.lastActiveDate === yesterday) {
          // Continuing streak
          data.streaks.current += 1;
          if (data.streaks.current > data.streaks.best) {
            data.streaks.best = data.streaks.current;
          }
        } else {
          // Streak broken
          data.streaks.current = 1;
        }
        
        data.streaks.lastActiveDate = today;
      }
    } else {
      console.log('Session ended without saving progress to focus history or streaks');
    }
    
    // Clear active session
    data.activeFocusSession = null;
    
    // Save updated data
    // await setStorageData(data);
    
    return endedSession;
  } catch (error) {
    console.error('Error ending focus session:', error);
    return null;
  }
};

export const getActiveFocusSession = async (): Promise<FocusSession | null> => {
  const data = await getStorageData();
  return data.activeFocusSession;
};

export const getFocusHistory = async (): Promise<Record<string, number>> => {
  const data = await getStorageData();
  return data.focusHistory;
};

export const getFocusGoal = async (): Promise<number> => {
  const data = await getStorageData();
  return data.focusGoal;
};

export const setFocusGoal = async (minutes: number): Promise<number> => {
  const data = await getStorageData();
  data.focusGoal = minutes;
  // await setStorageData(data);
  return minutes;
};

export const getWeeklyFocusGoal = async (): Promise<number> => {
  const data = await getStorageData();
  return data.weeklyFocusGoal;
};

export const getStreaks = async (): Promise<{current: number, best: number}> => {
  const data = await getStorageData();
  return {
    current: data.streaks.current,
    best: data.streaks.best
  };
};

// Daily targets functions
export const getDailyTargets = async (): Promise<DailyTarget[]> => {
  const data = await getStorageData();
  const today = getDateString(new Date());
  
  // Filter to only today's targets
  return data.dailyTargets.filter(target => target.date === today);
};

export const addDailyTarget = async (text: string): Promise<DailyTarget> => {
  const data = await getStorageData();
  const today = getDateString(new Date());
  
  // Generate new ID (max ID + 1)
  const maxId = data.dailyTargets.reduce((max, t) => Math.max(max, t.id), 0);
  
  const newTarget: DailyTarget = {
    id: maxId + 1,
    text,
    completed: false,
    date: today
  };
  
  data.dailyTargets.push(newTarget);
  // await setStorageData(data);
  return newTarget;
};

export const updateDailyTarget = async (id: number, updates: Partial<DailyTarget>): Promise<DailyTarget | undefined> => {
  const data = await getStorageData();
  const index = data.dailyTargets.findIndex(t => t.id === id);
  
  if (index === -1) return undefined;
  
  data.dailyTargets[index] = {
    ...data.dailyTargets[index],
    ...updates
  };
  
  // await setStorageData(data);
  return data.dailyTargets[index];
};

export const deleteDailyTarget = async (id: number): Promise<boolean> => {
  const data = await getStorageData();
  const index = data.dailyTargets.findIndex(t => t.id === id);
  
  if (index === -1) return false;
  
  data.dailyTargets.splice(index, 1);
  // await setStorageData(data);
  return true;
};
