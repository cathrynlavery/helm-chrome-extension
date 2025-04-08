// Emergency reset script to clear any active sessions
console.log('Emergency reset script loaded');

function clearFocusSession() {
  try {
    // Clear localStorage
    console.log('Clearing localStorage data...');
    localStorage.removeItem('focusProfiles');
    localStorage.removeItem('activeFocusSession');
    localStorage.removeItem('dailyIntention');
    localStorage.removeItem('dailyTargets');
    localStorage.removeItem('focusGoal');
    localStorage.removeItem('weeklyFocusGoal');
    localStorage.removeItem('focusHistory');
    localStorage.removeItem('streaks');
    
    // Force page reload
    console.log('Reloading page...');
    window.location.reload();
    
    console.log('Emergency reset completed');
    return true;
  } catch (error) {
    console.error('Emergency reset failed:', error);
    return false;
  }
}

// Expose to global scope
window.emergencyReset = clearFocusSession;

// Add emergency reset button to page
window.addEventListener('DOMContentLoaded', () => {
  const emergencyButton = document.createElement('button');
  emergencyButton.textContent = 'EMERGENCY RESET';
  emergencyButton.style.position = 'fixed';
  emergencyButton.style.bottom = '10px';
  emergencyButton.style.left = '10px';
  emergencyButton.style.zIndex = '999999';
  emergencyButton.style.padding = '10px 20px';
  emergencyButton.style.backgroundColor = 'red';
  emergencyButton.style.color = 'white';
  emergencyButton.style.fontWeight = 'bold';
  emergencyButton.style.border = 'none';
  emergencyButton.style.borderRadius = '4px';
  emergencyButton.style.cursor = 'pointer';
  
  emergencyButton.onclick = clearFocusSession;
  
  document.body.appendChild(emergencyButton);
  console.log('Emergency reset button added to page');
});

// Also add URL hash listener for emergency reset
window.addEventListener('hashchange', function() {
  if (window.location.hash === '#emergency-reset') {
    console.log('Emergency reset triggered via URL hash');
    clearFocusSession();
    history.replaceState(null, document.title, window.location.pathname);
  }
});