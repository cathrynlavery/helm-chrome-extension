import React, { useEffect, useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { motion, AnimatePresence } from 'framer-motion';
import HelmLogo from './HelmLogo';

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
    <div className="absolute top-6 left-6 z-10 opacity-90 flex items-center group cursor-pointer hover:opacity-85 transition-opacity">
      <AnimatePresence mode="wait">
        <motion.div
          key={iconPath}
          className="flex items-center"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.4 }}
        >
          <HelmLogo 
            size={32} 
            className="group-hover:scale-105 transition-transform duration-300" 
          />
          <h1 className={`ml-3 text-xl ibm-plex-mono-regular tracking-wide transition-all duration-500
            ${state.isRunning
              ? 'text-[#CDAA7A]'
              : 'text-[#333333] dark:text-[#333333]'}`}
          >
            Helm
          </h1>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DynamicIcon;