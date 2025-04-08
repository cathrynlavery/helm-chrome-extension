import React from 'react';

interface HelmLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function HelmLogo({ className = '', size = 40, showText = true }: HelmLogoProps) {
  const width = showText ? size * 3 : size;
  const height = size;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={showText ? "0 0 121 40" : "0 0 40 40"}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g>
          <rect fill="#FFFFFF" opacity="0" x="0" y="0" width={showText ? 121 : 40} height="40"></rect>
          <g transform="translate(5.000000, 4.000000)">
            <path d="M20.42,19.65 L0.71,19.65 C0.32,19.65 0,20.02 0,20.47 L0,23.33 C0,23.78 0.32,24.15 0.71,24.15 L12.96,24.15 C13.24,24.15 13.38,24.49 13.18,24.69 L4.58,33.29 C4.27,33.6 4.27,34.1 4.58,34.41 L6.61,36.44 C6.92,36.75 7.42,36.75 7.73,36.44 L16.33,27.84 C16.53,27.64 16.87,27.78 16.87,28.06 L16.87,40.29 C16.87,40.69 17.24,41 17.69,41 L20.55,41 C21,41 21.37,40.69 21.37,40.29 L21.37,20.6 C21.37,20.08 20.95,19.65 20.42,19.65 Z" fill="#CDAA7A"></path>
            <path d="M37.24,19.32 L25.1,19.32 C24.92,19.32 24.8,19.1 24.94,18.96 L33.54,10.36 C33.95,9.96 33.95,9.3 33.54,8.89 L31.86,7.22 C31.46,6.81 30.8,6.81 30.39,7.22 L21.79,15.82 C21.65,15.96 21.43,15.84 21.43,15.66 L21.43,3.61 C21.43,3.05 20.98,2.59 20.41,2.59 L18.01,2.59 C17.45,2.59 16.99,3.05 16.99,3.61 L16.99,15.66 C16.99,15.84 16.77,15.96 16.63,15.82 L8.04,7.22 C7.63,6.81 6.97,6.81 6.56,7.22 L4.89,8.89 C4.48,9.3 4.48,9.96 4.89,10.36 L13.24,18.72 C13.25,18.72 13.26,18.74 13.28,18.75 C13.29,18.76 13.3,18.78 13.3,18.8 C13.3,18.81 13.31,18.83 13.32,18.84 C13.33,18.85 13.35,18.86 13.37,18.86 L13.39,18.87 C13.42,18.89 13.45,18.9 13.48,18.9 L13.5,18.91 C13.53,18.92 13.57,18.92 13.6,18.92 L13.63,18.92 L13.65,18.92 L13.78,18.92 L20.57,18.92 C21.59,18.92 22.41,19.74 22.41,20.76 L22.41,27.48 L22.41,27.59 L22.41,27.62 C22.41,27.66 22.41,27.7 22.42,27.73 L22.43,27.75 C22.43,27.78 22.45,27.81 22.46,27.83 L22.46,27.84 L22.47,27.86 C22.48,27.88 22.5,27.89 22.51,27.9 C22.53,27.92 22.54,27.94 22.56,27.95 L30.91,36.3 C31.32,36.71 31.98,36.71 32.39,36.3 L34.07,34.63 C34.48,34.22 34.48,33.56 34.07,33.15 L25.47,24.56 C25.33,24.42 25.45,24.2 25.63,24.2 L37.77,24.2 C38.34,24.2 38.79,23.74 38.79,23.18 L38.79,20.78 C38.23,19.78 37.77,19.32 37.24,19.32 Z" fill="#333333"></path>
            {showText && (
              <text fill="#333333" fontFamily="IBM Plex Mono, monospace" fontSize="21" fontWeight="700" letterSpacing="-0.1" x="42.4" y="28">
                HELM
              </text>
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}

export default HelmLogo;