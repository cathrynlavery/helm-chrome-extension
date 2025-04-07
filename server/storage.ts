import { 
  users, type User, type InsertUser,
  focusProfiles, type FocusProfile, type InsertFocusProfile,
  blockedSites, type BlockedSite, type InsertBlockedSite,
  focusSessions, type FocusSession, type InsertFocusSession,
  dailyIntentions, type DailyIntention, type InsertDailyIntention
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Focus Profiles
  getProfiles(): Promise<FocusProfile[]>;
  getProfile(id: number): Promise<FocusProfile | undefined>;
  createProfile(profile: InsertFocusProfile): Promise<FocusProfile>;
  updateProfile(id: number, profile: Partial<InsertFocusProfile>): Promise<FocusProfile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
  setActiveProfile(id: number): Promise<FocusProfile | undefined>;

  // Blocked Sites
  getBlockedSites(profileId: number): Promise<BlockedSite[]>;
  addBlockedSite(site: InsertBlockedSite): Promise<BlockedSite>;
  removeBlockedSite(id: number): Promise<boolean>;

  // Focus Sessions
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: number, session: Partial<FocusSession>): Promise<FocusSession | undefined>;
  getFocusSessions(startDate?: Date, endDate?: Date): Promise<FocusSession[]>;

  // Daily Intentions
  getDailyIntention(date?: Date): Promise<DailyIntention | undefined>;
  setDailyIntention(intention: InsertDailyIntention): Promise<DailyIntention>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, FocusProfile>;
  private blockedSites: Map<number, BlockedSite>;
  private focusSessions: Map<number, FocusSession>;
  private dailyIntentions: Map<number, DailyIntention>;
  
  currentUserId: number;
  currentProfileId: number;
  currentSiteId: number;
  currentSessionId: number;
  currentIntentionId: number;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.blockedSites = new Map();
    this.focusSessions = new Map();
    this.dailyIntentions = new Map();
    
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentSiteId = 1;
    this.currentSessionId = 1;
    this.currentIntentionId = 1;

    // Add some default profiles
    this.createProfile({
      name: "Work Profile",
      description: "For focused work time without social media distractions",
      isActive: true
    });

    this.createProfile({
      name: "Study Profile",
      description: "For focused study time without gaming and entertainment sites",
      isActive: false
    });

    this.createProfile({
      name: "Personal Profile", 
      description: "Block distracting work-related sites during personal time",
      isActive: false
    });

    // Add some default blocked sites
    this.addBlockedSite({ profileId: 1, url: "facebook.com" });
    this.addBlockedSite({ profileId: 1, url: "twitter.com" });
    this.addBlockedSite({ profileId: 1, url: "instagram.com" });
    this.addBlockedSite({ profileId: 2, url: "youtube.com" });
    this.addBlockedSite({ profileId: 2, url: "twitch.tv" });
    this.addBlockedSite({ profileId: 3, url: "linkedin.com" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Profile methods
  async getProfiles(): Promise<FocusProfile[]> {
    return Array.from(this.profiles.values());
  }

  async getProfile(id: number): Promise<FocusProfile | undefined> {
    return this.profiles.get(id);
  }

  async createProfile(profile: InsertFocusProfile): Promise<FocusProfile> {
    const id = this.currentProfileId++;
    // If this profile is active, deactivate all others
    if (profile.isActive) {
      for (const [key, existingProfile] of this.profiles.entries()) {
        this.profiles.set(key, { ...existingProfile, isActive: false });
      }
    }
    
    const newProfile: FocusProfile = { 
      ...profile, 
      id, 
      lastUsed: new Date(),
      createdAt: new Date()
    };
    
    this.profiles.set(id, newProfile);
    return newProfile;
  }

  async updateProfile(id: number, profile: Partial<InsertFocusProfile>): Promise<FocusProfile | undefined> {
    const existingProfile = this.profiles.get(id);
    if (!existingProfile) return undefined;

    // If setting this profile to active, deactivate all others
    if (profile.isActive) {
      for (const [key, existingProfile] of this.profiles.entries()) {
        if (key !== id) {
          this.profiles.set(key, { ...existingProfile, isActive: false });
        }
      }
    }

    const updatedProfile: FocusProfile = { 
      ...existingProfile, 
      ...profile,
      lastUsed: new Date()
    };
    
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteProfile(id: number): Promise<boolean> {
    const success = this.profiles.delete(id);
    
    // Also delete all blocked sites associated with this profile
    for (const [siteId, site] of this.blockedSites.entries()) {
      if (site.profileId === id) {
        this.blockedSites.delete(siteId);
      }
    }
    
    return success;
  }

  async setActiveProfile(id: number): Promise<FocusProfile | undefined> {
    return this.updateProfile(id, { isActive: true });
  }

  // Blocked sites methods
  async getBlockedSites(profileId: number): Promise<BlockedSite[]> {
    return Array.from(this.blockedSites.values())
      .filter(site => site.profileId === profileId);
  }

  async addBlockedSite(site: InsertBlockedSite): Promise<BlockedSite> {
    const id = this.currentSiteId++;
    const newSite: BlockedSite = { 
      ...site, 
      id, 
      createdAt: new Date()
    };
    
    this.blockedSites.set(id, newSite);
    return newSite;
  }

  async removeBlockedSite(id: number): Promise<boolean> {
    return this.blockedSites.delete(id);
  }

  // Focus sessions methods
  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const id = this.currentSessionId++;
    const newSession: FocusSession = { 
      ...session, 
      id, 
      startTime: session.startTime || new Date(),
      endTime: null,
      duration: 0,
      completed: false
    };
    
    this.focusSessions.set(id, newSession);
    return newSession;
  }

  async updateFocusSession(id: number, sessionData: Partial<FocusSession>): Promise<FocusSession | undefined> {
    const session = this.focusSessions.get(id);
    if (!session) return undefined;

    const updatedSession: FocusSession = { ...session, ...sessionData };
    this.focusSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getFocusSessions(startDate?: Date, endDate?: Date): Promise<FocusSession[]> {
    let sessions = Array.from(this.focusSessions.values());
    
    if (startDate) {
      sessions = sessions.filter(session => session.startTime >= startDate);
    }
    
    if (endDate) {
      sessions = sessions.filter(session => session.startTime <= endDate);
    }
    
    return sessions;
  }

  // Daily intentions methods
  async getDailyIntention(date?: Date): Promise<DailyIntention | undefined> {
    const intentions = Array.from(this.dailyIntentions.values());
    
    if (!date) {
      // Get the most recent intention
      return intentions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
    }
    
    // Get intention for specific date
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return intentions.find(intention => {
      const intentionDate = new Date(intention.date);
      intentionDate.setHours(0, 0, 0, 0);
      return intentionDate.getTime() === targetDate.getTime();
    });
  }

  async setDailyIntention(intentionData: InsertDailyIntention): Promise<DailyIntention> {
    const id = this.currentIntentionId++;
    const now = new Date();
    
    const intention: DailyIntention = {
      ...intentionData,
      id,
      date: now
    };
    
    this.dailyIntentions.set(id, intention);
    return intention;
  }
}

export const storage = new MemStorage();
