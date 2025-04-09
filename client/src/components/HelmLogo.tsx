import React from 'react';
import { motion } from 'framer-motion';

interface HelmLogoProps {
  className?: string;
  size?: number;
}

const HelmLogo: React.FC<HelmLogoProps> = ({ className = "", size = 28 }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        style={{ minWidth: size, minHeight: size }}
      >
        <g transform="translate(4, 4)">
          <path 
            className="text-[#CDAA7A]" 
            fill="currentColor"
            d="M8.85,7.47H.31c-.17,0-.31.16-.31.35v1.24c0,.19.14.35.31.35h5.32c.12,0,.18.14.09.22l-3.73,3.73c-.14.14-.14.36,0,.5l.88.88c.14.14.36.14.5,0l3.73-3.73c.08-.08.22-.02.22.09v5.31c0,.18.16.32.35.32h1.24c.19,0,.35-.14.35-.32V7.9c0-.23-.19-.42-.42-.42Z"
          />
          <path 
            className="text-[#333333] dark:text-[#E0E0E0]" 
            fill="currentColor"
            d="M16.3,7.33h-5.26c-.08,0-.13-.1-.07-.16l3.72-3.72c.18-.18.18-.47,0-.65l-.73-.73c-.18-.18-.47-.18-.65,0l-3.72,3.72c-.06.06-.16.02-.16-.07V.46c0-.25-.21-.46-.46-.46h-1.03c-.25,0-.46.21-.46.46v5.26c0,.08-.1.13-.16.07l-3.72-3.72c-.18-.18-.47-.18-.65,0l-.73.73c-.18.18-.18.47,0,.65l3.6,3.6s.05.03.08.03h2.97c.45,0,.82.37.82.82v2.97s.01.06.03.08l3.6,3.6c.18.18.47.18.65,0l.73-.73c.18-.18.18-.47,0-.65l-3.72-3.72c-.06-.06-.02-.16.07-.16h5.26c.25,0,.46-.21.46-.46v-1.03c0-.25-.21-.46-.46-.46Z"
          />
        </g>
      </svg>
    </motion.div>
  );
};

export default HelmLogo;