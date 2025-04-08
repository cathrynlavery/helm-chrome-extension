// Direct profile controls without relying on React event system
console.log('Direct profile controls script loaded');

// Function to get profiles from Chrome storage or localStorage
async function getProfiles() {
  try {
    // Try to get from chrome storage first
    if (window.chrome && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['focusProfiles'], (result) => {
          if (result.focusProfiles) {
            resolve(result.focusProfiles);
          } else {
            // Fallback to localStorage
            const storedData = localStorage.getItem('focusProfiles');
            resolve(storedData ? JSON.parse(storedData) : []);
          }
        });
      });
    } else {
      // Fallback to localStorage
      const storedData = localStorage.getItem('focusProfiles');
      return storedData ? JSON.parse(storedData) : [];
    }
  } catch (error) {
    console.error('Error getting profiles:', error);
    return [];
  }
}

// Function to render profile selection UI
async function createProfileUI() {
  try {
    const profiles = await getProfiles();
    if (!profiles || profiles.length === 0) {
      console.log('No profiles found');
      return;
    }
    
    console.log('Creating direct profile UI with profiles:', profiles);
    
    // Create container
    const container = document.createElement('div');
    container.id = 'direct-profile-controls';
    container.style.position = 'fixed';
    container.style.top = '100px';
    container.style.right = '20px';
    container.style.background = '#fff';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '8px';
    container.style.padding = '15px';
    container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    container.style.zIndex = '999999';
    container.style.maxWidth = '300px';
    
    // Add header
    const header = document.createElement('h3');
    header.textContent = 'Direct Profile Controls';
    header.style.margin = '0 0 10px 0';
    header.style.fontSize = '16px';
    header.style.fontWeight = 'bold';
    container.appendChild(header);
    
    // Add description
    const description = document.createElement('p');
    description.textContent = 'Use these links to directly manage profiles:';
    description.style.margin = '0 0 10px 0';
    description.style.fontSize = '14px';
    container.appendChild(description);
    
    // Create profile list
    const list = document.createElement('ul');
    list.style.margin = '0';
    list.style.padding = '0';
    list.style.listStyle = 'none';
    
    profiles.forEach(profile => {
      const item = document.createElement('li');
      item.style.margin = '5px 0';
      item.style.padding = '8px';
      item.style.borderRadius = '4px';
      item.style.background = profile.isActive ? '#e0f7fa' : '#f5f5f5';
      item.style.border = '1px solid #ddd';
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = profile.name;
      nameSpan.style.fontWeight = 'bold';
      nameSpan.style.display = 'block';
      item.appendChild(nameSpan);
      
      const styleSpan = document.createElement('span');
      styleSpan.textContent = `Style: ${profile.accessStyle === 'allowlist' ? 'Allow List' : 'Block List'}`;
      styleSpan.style.fontSize = '12px';
      styleSpan.style.color = '#666';
      styleSpan.style.display = 'block';
      styleSpan.style.marginTop = '4px';
      item.appendChild(styleSpan);
      
      // Add activate link that uses URL hash system
      const activateLink = document.createElement('a');
      activateLink.textContent = 'Start Focus (45 min)';
      activateLink.href = `#action=start&profile=${profile.id}&duration=45`;
      activateLink.style.display = 'inline-block';
      activateLink.style.marginTop = '8px';
      activateLink.style.marginRight = '8px';
      activateLink.style.padding = '4px 8px';
      activateLink.style.background = '#4caf50';
      activateLink.style.color = 'white';
      activateLink.style.textDecoration = 'none';
      activateLink.style.borderRadius = '4px';
      activateLink.style.fontSize = '12px';
      item.appendChild(activateLink);
      
      list.appendChild(item);
    });
    
    container.appendChild(list);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.background = '#f44336';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => container.remove();
    container.appendChild(closeButton);
    
    document.body.appendChild(container);
  } catch (error) {
    console.error('Error creating profile UI:', error);
  }
}

// Wait for DOM to be ready and create UI
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, adding profile controls button');
  
  // Create button to show profile controls
  const showButton = document.createElement('button');
  showButton.textContent = 'SHOW PROFILES';
  showButton.style.position = 'fixed';
  showButton.style.top = '10px';
  showButton.style.right = '10px';
  showButton.style.zIndex = '999999';
  showButton.style.padding = '10px';
  showButton.style.backgroundColor = '#2196f3';
  showButton.style.color = 'white';
  showButton.style.fontWeight = 'bold';
  showButton.style.border = 'none';
  showButton.style.borderRadius = '4px';
  showButton.style.cursor = 'pointer';
  
  showButton.onclick = () => createProfileUI();
  
  document.body.appendChild(showButton);
});