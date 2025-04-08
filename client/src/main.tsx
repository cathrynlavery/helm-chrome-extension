import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initStorage } from "./lib/chromeStorage";

// Initialize storage before rendering
initStorage().then(() => {
  // Debug event handling at the root level
  document.addEventListener('click', (e) => {
    console.log('Document click detected on:', e.target);
  }, true);
  
  // Ensure only one React root is mounted
  const rootElement = document.getElementById("root");
  
  // Clean any existing content if needed
  if (rootElement) {
    console.log("Root element found, rendering App");
    createRoot(rootElement).render(<App />);
    
    // Global handler to help debug click events
    window.addEventListener('click', function(e) {
      console.log('Global click handler:', e.target);
    }, true);
  } else {
    console.error("Root element not found!");
  }
});
