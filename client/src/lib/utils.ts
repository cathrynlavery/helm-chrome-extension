import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const saveFocusSession = (minutes: number) => {
  const today = new Date().toISOString().slice(0, 10); 
  const key = `focus-${today}`;

  const stored = localStorage.getItem(key);
  const previous = stored ? parseInt(stored, 10) : 0;

  localStorage.setItem(key, (previous + minutes).toString());
};

export const getTodayFocusMinutes = (): number => {
  const today = new Date().toISOString().slice(0, 10);
  const stored = localStorage.getItem(`focus-${today}`);
  return stored ? parseInt(stored, 10) : 0;
};


export const getDefaultHelmData = (): any => {
  const today = new Date().toISOString().split("T")[0];

  return {
    focusProfiles: [],
    activeFocusSession: null,
    dailyIntention: "",
    dailyTargets: [],
    focusGoal: 240,
    weeklyFocusGoal: 1200,
    focusHistory: {
      [today]: 0,
    },
    streaks: {
      current: 0,
      best: 0,
      lastActiveDate: null,
    },
  };
};
