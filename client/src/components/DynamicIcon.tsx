import React, { useEffect, useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { motion, AnimatePresence } from 'framer-motion';

// Component for dynamically switching between dark and light icons based on focus state
const DynamicIcon: React.FC = () => {
  const { focusTimer } = useFocus();
  const { state } = focusTimer;
  const [iconPath, setIconPath] = useState('/icons/dark-icon.svg');
  
  // Update icon based on focus state
  useEffect(() => {
    // Use dark icon for idle state (light background), light icon for focus state (dark background)
    const newPath = state.isRunning ? '/icons/light-icon.svg' : '/icons/dark-icon.svg';
    setIconPath(newPath);
    
    // Also update the favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute('href', newPath);
    }
  }, [state.isRunning]);
  
  return (
    <div className="absolute top-6 left-6 z-10 opacity-90">
      <AnimatePresence mode="wait">
        <motion.img 
          key={iconPath}
          src={iconPath}
          alt="Helm"
          className="h-8 w-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4 }}
        />
      </AnimatePresence>
    </div>
  );
};

export default DynamicIcon;