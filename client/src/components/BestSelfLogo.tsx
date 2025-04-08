import React from 'react';
import { ExternalLink } from 'lucide-react';

interface BestSelfLogoProps {
  className?: string;
}

const BestSelfLogo: React.FC<BestSelfLogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="text-[#333333] dark:text-white font-semibold ibm-plex-mono-medium tracking-wide flex items-center">
        <span>BEST</span>
        <span className="text-[#CDAA7A]">SELF</span>
        <ExternalLink className="h-3 w-3 ml-1 mt-[1px]" />
      </div>
    </div>
  );
};

export default BestSelfLogo;