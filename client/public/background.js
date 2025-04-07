// Background script for Helm extension
// This runs in the background and handles site blocking and focus sessions

// Listen for tab updates to check if site should be blocked
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only check when the page is loading
  if (changeInfo.status === 'loading' && tab.url) {
    await checkIfShouldBlock(tabId, tab.url);
  }
});

// Check if the URL should be blocked based on active profile
async function checkIfShouldBlock(tabId, url) {
  try {
    // Skip extension pages and Chrome settings
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
      return;
    }

    // Get current data from storage
    const data = await chrome.storage.local.get('helmData');
    if (!data.helmData) return;

    const { focusProfiles, activeFocusSession } = data.helmData;

    // If no active focus session, don't block anything
    if (!activeFocusSession || !activeFocusSession.isActive) {
      return;
    }

    // Find active profile
    const activeProfile = focusProfiles.find(p => p.isActive);
    if (!activeProfile) return;

    // Check if URL is in the blocked list
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');

    // Check if any blocked site matches the hostname
    const isBlocked = activeProfile.blockedSites.some(site => {
      return hostname === site || hostname.endsWith('.' + site);
    });

    if (isBlocked) {
      // Redirect to blocked page
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('index.html#/blocked?url=' + encodeURIComponent(url))
      });
    }
  } catch (error) {
    console.error('Error checking if site should be blocked:', error);
  }
}

// Listen for alarms to handle focus session timers
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'focusSessionEnd') {
    // Focus session has ended, update storage
    try {
      const data = await chrome.storage.local.get('helmData');
      if (!data.helmData || !data.helmData.activeFocusSession) return;

      const endTime = new Date();
      const startTime = new Date(data.helmData.activeFocusSession.startTime);
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      const minutesFocused = Math.floor(durationSeconds / 60);

      // Update focus history
      const dateString = getDateString(new Date());
      data.helmData.focusHistory[dateString] = (data.helmData.focusHistory[dateString] || 0) + minutesFocused;

      // Update streak
      const today = getDateString(new Date());
      if (data.helmData.streaks.lastActiveDate !== today) {
        const yesterday = getDateString(new Date(Date.now() - 86400000));
        
        if (data.helmData.streaks.lastActiveDate === yesterday) {
          // Continuing streak
          data.helmData.streaks.current += 1;
          data.helmData.streaks.best = Math.max(data.helmData.streaks.best, data.helmData.streaks.current);
        } else {
          // Broken streak, start over
          data.helmData.streaks.current = 1;
        }
        
        data.helmData.streaks.lastActiveDate = today;
      }

      // End session
      data.helmData.activeFocusSession = null;

      // Save updated data
      await chrome.storage.local.set(data);

      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'Focus Session Complete',
        message: `You focused for ${minutesFocused} minutes. Great job!`,
        priority: 2
      });
    } catch (error) {
      console.error('Error handling focus session end:', error);
    }
  }
});

// Helper to get date string in YYYY-MM-DD format
function getDateString(date) {
  return date.toISOString().split('T')[0];
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startFocusSession') {
    const { profileId, duration } = message;
    startFocusSession(profileId, duration);
    sendResponse({ success: true });
  }
  else if (message.action === 'endFocusSession') {
    endFocusSession();
    sendResponse({ success: true });
  }
  return true; // Required for async response
});

// Start a focus session
async function startFocusSession(profileId, durationMinutes = 45) {
  try {
    const data = await chrome.storage.local.get('helmData');
    if (!data.helmData) return;

    // Find the profile
    const profileIndex = data.helmData.focusProfiles.findIndex(p => p.id === profileId);
    if (profileIndex === -1) return;

    // Set profile as active
    data.helmData.focusProfiles.forEach((p, i) => {
      p.isActive = i === profileIndex;
    });
    
    data.helmData.focusProfiles[profileIndex].lastUsed = new Date().toISOString();

    // Create focus session
    data.helmData.activeFocusSession = {
      id: Date.now(),
      profileId,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      isActive: true
    };

    // Save to storage
    await chrome.storage.local.set(data);

    // Create alarm for session end
    chrome.alarms.create('focusSessionEnd', {
      delayInMinutes: durationMinutes
    });
  } catch (error) {
    console.error('Error starting focus session:', error);
  }
}

// End a focus session
async function endFocusSession() {
  try {
    // Clear the alarm
    chrome.alarms.clear('focusSessionEnd');

    const data = await chrome.storage.local.get('helmData');
    if (!data.helmData || !data.helmData.activeFocusSession) return;

    const endTime = new Date();
    const startTime = new Date(data.helmData.activeFocusSession.startTime);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const minutesFocused = Math.floor(durationSeconds / 60);

    // Update focus history
    const dateString = getDateString(new Date());
    data.helmData.focusHistory[dateString] = (data.helmData.focusHistory[dateString] || 0) + minutesFocused;

    // End session
    data.helmData.activeFocusSession = null;

    // Save updated data
    await chrome.storage.local.set(data);
  } catch (error) {
    console.error('Error ending focus session:', error);
  }
}
