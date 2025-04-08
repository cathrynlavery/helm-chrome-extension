/**
 * interceptClickEvents.ts
 * 
 * This utility creates invisible divs that capture click events in constrained environments
 * where standard click events may not be working properly.
 */

export function createClickInterceptor(
  targetId: string,
  onClickCallback: () => void,
  zIndex: number = 10000
): HTMLDivElement {
  // Create an invisible div that will be positioned over the target element
  const interceptor = document.createElement('div');
  
  // Style the interceptor to be invisible but clickable
  interceptor.style.position = 'fixed';
  interceptor.style.backgroundColor = 'transparent';
  interceptor.style.zIndex = zIndex.toString();
  interceptor.style.cursor = 'pointer';
  
  // Add data attributes for debugging
  interceptor.setAttribute('data-intercepts-for', targetId);
  interceptor.id = `interceptor-for-${targetId}`;
  
  // Add the click event listener
  interceptor.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Interceptor for ${targetId} clicked!`);
    onClickCallback();
  });
  
  return interceptor;
}

export function positionInterceptor(
  interceptor: HTMLDivElement,
  targetElement: HTMLElement
): void {
  // Get the target element's position and dimensions
  const rect = targetElement.getBoundingClientRect();
  
  // Position the interceptor to cover exactly the same area
  interceptor.style.top = `${rect.top}px`;
  interceptor.style.left = `${rect.left}px`;
  interceptor.style.width = `${rect.width}px`;
  interceptor.style.height = `${rect.height}px`;
}

export function setupClickInterceptor(
  targetId: string,
  onClickCallback: () => void,
  parentElement: HTMLElement = document.body,
  zIndex: number = 10000
): (() => void) {
  // Create the interceptor element
  const interceptor = createClickInterceptor(targetId, onClickCallback, zIndex);
  
  // Find the target element
  const targetElement = document.getElementById(targetId);
  if (!targetElement) {
    console.error(`Target element with ID ${targetId} not found`);
    return () => {}; // Return no-op cleanup function
  }
  
  // Initial positioning
  positionInterceptor(interceptor, targetElement);
  
  // Add the interceptor to the specified parent element (default: document.body)
  parentElement.appendChild(interceptor);
  
  // Set up a MutationObserver to watch for changes to the target element
  const observer = new MutationObserver(() => {
    positionInterceptor(interceptor, targetElement);
  });
  
  // Start observing the target with configs
  observer.observe(targetElement, {
    attributes: true,
    childList: false,
    subtree: false
  });
  
  // Also update on window resize and scroll events
  const updatePosition = () => positionInterceptor(interceptor, targetElement);
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition);
  
  // Return a cleanup function
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition);
    parentElement.removeChild(interceptor);
  };
}

// Use this function to initialize interceptors on window load
export function initializeClickInterceptors(
  mappings: Array<{ id: string, callback: () => void }>,
  parentElement: HTMLElement = document.body
): (() => void) {
  // Store all cleanup functions
  const cleanupFunctions: Array<() => void> = [];
  
  // Set up each interceptor
  mappings.forEach(({ id, callback }, index) => {
    const cleanup = setupClickInterceptor(id, callback, parentElement, 10000 + index);
    cleanupFunctions.push(cleanup);
  });
  
  // Return a master cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}