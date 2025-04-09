import { useState, useEffect, useCallback } from 'react';

/**
 * Hash-based location hook for Wouter
 * This enables Chrome extension-friendly routing using URL hashes (#/) instead of history API
 */
export const useHashLocation = (): [
  string,
  (to: string) => void
] => {
  // Get hash path without the # prefix
  const getHashPath = (): string => {
    const path = window.location.hash.replace(/^#/, '') || '/';
    return path;
  };

  const [path, setPath] = useState(getHashPath());

  // Update path state when hash changes
  useEffect(() => {
    // Handle hash change
    const handleHashChange = () => {
      setPath(getHashPath());
      console.log('🧭 Hash navigation changed to:', getHashPath());
    };

    // Set up listener
    window.addEventListener('hashchange', handleHashChange);

    // Clean up
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation function to change the hash
  const navigate = useCallback((to: string) => {
    console.log('🧭 Navigating to:', to);
    window.location.hash = to;
  }, []);

  return [path, navigate];
};

export default useHashLocation; 