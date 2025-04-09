import React from 'react';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface BestSelfLogoProps {
  className?: string;
}

const BestSelfLogo: React.FC<BestSelfLogoProps> = ({ className = '' }) => {
  return (
    <motion.a 
      href="https://bestself.co" 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`flex items-center ${className} opacity-60 hover:opacity-90 transition-all duration-300`}
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 0.4 }}
    >
      <img 
        src="/icons/BestSelf-Text-Logo-black.png" 
        alt="BestSelf" 
        className="h-5 dark:invert dark:opacity-90" 
      />
      <ExternalLink className="h-3 w-3 ml-1 text-gray-600 dark:text-gray-400" />
    </motion.a>
  );
};

export default BestSelfLogo;