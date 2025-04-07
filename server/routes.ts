import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertFocusProfileSchema, 
  insertBlockedSiteSchema, 
  insertFocusSessionSchema,
  insertDailyIntentionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Focus Profiles
  app.get("/api/profiles", async (req, res) => {
    const profiles = await storage.getProfiles();
    res.json(profiles);
  });

  app.get("/api/profiles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid profile ID" });
    }

    const profile = await storage.getProfile(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const profileData = insertFocusProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.patch("/api/profiles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid profile ID" });
    }

    try {
      const profileData = insertFocusProfileSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateProfile(id, profileData);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete("/api/profiles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid profile ID" });
    }

    const success = await storage.deleteProfile(id);
    if (!success) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(204).end();
  });

  app.post("/api/profiles/:id/activate", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid profile ID" });
    }

    const activeProfile = await storage.setActiveProfile(id);
    if (!activeProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(activeProfile);
  });

  // Blocked Sites
  app.get("/api/profiles/:profileId/sites", async (req, res) => {
    const profileId = parseInt(req.params.profileId);
    if (isNaN(profileId)) {
      return res.status(400).json({ message: "Invalid profile ID" });
    }

    const sites = await storage.getBlockedSites(profileId);
    res.json(sites);
  });

  app.post("/api/profiles/:profileId/sites", async (req, res) => {
    const profileId = parseInt(req.params.profileId);
    if (isNaN(profileId)) {
      return res.status(400).json({ message: "Invalid profile ID" });
    }

    try {
      const siteData = insertBlockedSiteSchema.parse({
        ...req.body,
        profileId
      });
      
      const site = await storage.addBlockedSite(siteData);
      res.status(201).json(site);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid site data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add blocked site" });
    }
  });

  app.delete("/api/sites/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid site ID" });
    }

    const success = await storage.removeBlockedSite(id);
    if (!success) {
      return res.status(404).json({ message: "Site not found" });
    }

    res.status(204).end();
  });

  // Focus Sessions
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertFocusSessionSchema.parse(req.body);
      const session = await storage.createFocusSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create focus session" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    try {
      const session = await storage.updateFocusSession(id, req.body);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (req.query.start && typeof req.query.start === 'string') {
      startDate = new Date(req.query.start);
    }
    
    if (req.query.end && typeof req.query.end === 'string') {
      endDate = new Date(req.query.end);
    }
    
    const sessions = await storage.getFocusSessions(startDate, endDate);
    res.json(sessions);
  });

  // Daily Intentions
  app.get("/api/intention", async (req, res) => {
    let date: Date | undefined;
    
    if (req.query.date && typeof req.query.date === 'string') {
      date = new Date(req.query.date);
    }
    
    const intention = await storage.getDailyIntention(date);
    
    if (!intention) {
      return res.status(404).json({ message: "No intention found" });
    }
    
    res.json(intention);
  });

  app.post("/api/intention", async (req, res) => {
    try {
      const intentionData = insertDailyIntentionSchema.parse(req.body);
      const intention = await storage.setDailyIntention(intentionData);
      res.status(201).json(intention);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid intention data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to set daily intention" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
