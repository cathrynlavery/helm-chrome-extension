# ⚙️ Helm Chrome Extension — Project Overview & Open Tasks  
**Version:** MVP v1.0  
**Date:** April 8, 2025  
**Project Lead:** Cathryn Lavery  
**Workspace:** Migrating from Replit to Cursor (current state: Replit export)

---

## 🧩 Project Summary

**Helm** is a minimalist, premium-designed Chrome extension and desktop experience to help users:
- Block or allow websites based on focus sessions.
- Set timed, intentional work sessions with UI focus.
- Track streaks and focus goals.
- Toggle between different "Focus Spaces" (work, study, personal, etc.).
- Enjoy premium UI/UX with BestSelf.co aesthetic (clean, spacious, serif/mono font combinations, brass highlights).

---

## 🏗️ Tech Stack

- React + TypeScript  
- TailwindCSS  
- Supabase (planned for auth + data storage)
- Chrome Extension MV3 (service worker in progress)
- Cursor will be used for local development and refactor
- Version control: Currently manual zip exports — will migrate to GitHub post-Cursor cleanup

---

## ✅ What *Is* Working

- General app shell and layout (Dashboard, Idle Focus screen, Focus Session screen)
- Profile creation (Work / Study / Personal Profiles)
- Profile editing and site-blocking logic (block list / allow list toggle working visually)
- Light/dark mode themes
- Profile session types saved in-app memory (not yet persisted)
- Basic streak tracker (front end)
- Design system (colors, fonts, components)

---

## 🛠️ Top Priority Issues to Fix

### 1. Core Button Functionality — Broken
- **Problem:** Start Session, Pause Session, and End Session buttons do *not* work.
- Current implementation has conflicting event handlers / broken refs.
- Replit debugging loop failed, handlers are not bound properly.
- Need clean, direct event handler wiring (remove DOM interceptors).
- ✅ Ideal: Trace event props → state flow → ensure all button clicks fire as expected.

### 2. UI Clean-Up
- [ ] Fix alignment of **Focus Space** title on idle screen (center it properly).
- [ ] Remove rogue element: `absolute top-6 left-6 z-10 opacity-90 ...` (old icon leftover).
- [ ] Emergency Reset button still showing in Dashboard/Idle — **remove** from these screens (should only appear in Focus Session mode).
- [ ] Ensure background color is consistent across **all screens**: `#fbfcfc`.
- [ ] Increase size of Helm icon top left + add "Helm" text properly aligned next to icon.
- [ ] Add working BestSelf logo (file path provided: `client/public/icons/BestSelf-Text-Logo-black.png`) to footer **with working link** to BestSelf.co (currently broken).

### 3. Onboarding Flow (To Build)
- **Goal:** Light, clean onboarding before user starts.
- Collect:
  - Name
  - Email (use Supabase for user creation & verification)
- Purpose:
  - Personalize Dashboard ("Good morning, [Name]")
  - Save profile preferences to Supabase
- Optional: Require email verification to unlock persistent data (optional, but preferred).

### 4. Database Integration
- Connect Supabase for:
  - ✅ Profiles (Work, Study, Personal)
  - ✅ Site allow/block lists
  - ✅ User metadata (name, email)
  - ✅ Focus session logs (session time, streaks, etc.)

---

## ✍️ Nice to Have (Optional Polish, Time Permitting)

- Add small "Helm by BestSelf.co" subtle branding (footer center).
- Refine spacing on Dashboard (luxury feel, spacious).
- Improve accessibility (color contrast for dark mode targets list).
- Smooth out state transitions between Idle → Focus Session → Dashboard.

---

## 🧩 Dev Notes (Helpful Context)

- Replit AI kept introducing regressions — event handlers were overcomplicated with refs and URL interceptors.
- You may find stray console.logs and test buttons left over from debugging.
- Preferred button styling: brass tone, hover states already defined in Tailwind.
- Project file tree is currently Replit-exported but clean.
- Local dev preferred: move to Cursor for cleaner control and terminal visibility.

---

## 🧭 Suggested Next Steps for Cursor Developer

1. ✅ Start by fixing **event handlers** on all buttons.
2. ✅ Clean up rogue elements and tidy CSS.
3. ✅ Implement onboarding flow (basic Name + Email).
4. ✅ Connect Supabase for user + profile

> 📄 Reference: See `project_requirements_document.md` for full product scope, tech stack, and long-term vision. Prioritize tasks in this document for MVP delivery.
