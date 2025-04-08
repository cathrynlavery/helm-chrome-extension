import React from 'react';
import { ExternalLink } from 'lucide-react';

interface BestSelfLogoProps {
  className?: string;
}

const BestSelfLogo: React.FC<BestSelfLogoProps> = ({ className = '' }) => {
  return (
    <a 
      href="https://bestself.co" 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`flex items-center ${className} opacity-50 hover:opacity-70 transition-opacity duration-300`}
    >
      <img 
        src="/icons/BestSelf-Text-Logo-black.png" 
        alt="BestSelf" 
        className="h-5" 
      />
      <ExternalLink className="h-3 w-3 ml-1 text-gray-600" />
    </a>
  );
};

export default BestSelfLogo;