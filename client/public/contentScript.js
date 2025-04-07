// Content script for Helm extension
// This runs on each page to check for blocked sites

(function() {
  // Check if this page is supposed to be blocked
  chrome.runtime.sendMessage({ action: 'checkIfBlocked', url: window.location.href }, (response) => {
    if (response && response.blocked) {
      // If blocked, replace the entire page content with blocked message
      document.body.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column; font-family: system-ui, sans-serif;">
          <div style="text-align: center; max-width: 500px; padding: 2rem;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 80px; height: 80px; margin: 0 auto 2rem;">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">This site is blocked</h1>
            <p style="margin-bottom: 2rem; color: #666;">${window.location.hostname}</p>
            <div style="background: #f9fafb; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem;">
              <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Remember your intention:</h2>
              <p style="font-style: italic;">${response.dailyIntention || 'Stay focused on your goals'}</p>
            </div>
            <div style="margin-bottom: 2rem;">
              <p style="color: #666; margin-bottom: 0.5rem;">You're currently in a focus session with:</p>
              <p style="font-weight: 500; color: #3A56E4; font-size: 1.25rem;">${response.profileName || 'Active Profile'}</p>
            </div>
            <div>
              <button style="background: white; border: 1px solid #ddd; padding: 0.5rem 1rem; border-radius: 0.25rem; margin-right: 0.5rem; cursor: pointer;" id="helm-go-back">Go Back</button>
              <button style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; margin-right: 0.5rem; cursor: pointer;" id="helm-allow">Allow for 5 minutes</button>
              <button style="background: #3A56E4; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;" id="helm-dashboard">Open Dashboard</button>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners for buttons
      document.getElementById('helm-go-back')?.addEventListener('click', () => {
        history.back();
      });
      
      document.getElementById('helm-allow')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'allowForFiveMinutes', url: window.location.href });
      });
      
      document.getElementById('helm-dashboard')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openDashboard' });
      });
    }
  });
})();
