import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { 
  getDailyIntention, 
  getActiveProfile,
  FocusProfile
} from '../lib/chromeStorage';
import { FocusTimer } from '../lib/focusTimer';

const BlockedPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [dailyIntention, setDailyIntention] = useState('');
  const [blockedUrl, setBlockedUrl] = useState('');
  const [activeProfile, setActiveProfile] = useState<FocusProfile | null>(null);
  const [timerDisplay, setTimerDisplay] = useState('');
  
  // Get URL and profile info on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url') || '';
    setBlockedUrl(url);
    
    const loadData = async () => {
      // Get daily intention
      const intention = await getDailyIntention();
      setDailyIntention(intention);
      
      // Get active profile
      const profile = await getActiveProfile();
      setActiveProfile(profile || null);
    };
    
    loadData();
    
    // Subscribe to timer for updates
    const timer = FocusTimer.getInstance();
    const unsubscribe = timer.subscribe((state) => {
      const minutes = Math.floor(state.timeRemaining / 60);
      const seconds = Math.floor(state.timeRemaining % 60);
      setTimerDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleGoBack = () => {
    window.history.back();
  };
  
  const handleAllowFiveMinutes = () => {
    // This would require communication with background script
    // For this implementation, we'll just redirect to the URL
    if (blockedUrl) {
      window.location.href = blockedUrl.startsWith('http') ? blockedUrl : `https://${blockedUrl}`;
    }
  };
  
  const handleOpenNewTab = () => {
    // Open the new tab page (dashboard)
    setLocation('/');
  };
  
  return (
    <div className="fixed inset-0 bg-[#fbfcfc]">
      {/* Helm Logo aligned with main content */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center">
          <img 
            src="/icons/dark-icon.svg" 
            alt="Helm" 
            className="h-6 w-auto"
          />
          <span className="ml-2 text-[#1A1A1A] ibm-plex-mono-medium text-[16px]">
            Helm
          </span>
        </div>
      </div>
      
      <div className="max-w-xl mx-auto px-4 pt-24 pb-12 text-center">
        <AlertTriangle className="h-24 w-24 mx-auto text-destructive mb-6" />
        
        <h2 className="text-3xl font-semibold mb-4">This site is blocked</h2>
        <p className="text-muted-foreground mb-6">{blockedUrl}</p>
        
        <div className="bg-neutral-bg rounded-lg p-6 mb-8 inline-block mx-auto">
          <h3 className="text-lg font-medium mb-3">Remember your intention:</h3>
          <p className="text-xl italic">{dailyIntention || 'No intention set for today'}</p>
        </div>
        
        <div className="mb-8">
          <p className="text-muted-foreground mb-2">You're currently in a focus session with:</p>
          <p className="text-primary font-medium text-lg">
            {activeProfile ? `${activeProfile.name} (${timerDisplay} remaining)` : 'No active profile'}
          </p>
          {activeProfile && (
            <p className="text-xs text-[#333333]/70 dark:text-[#E0E0E0]/70 mt-2">
              Mode: {activeProfile.accessStyle === 'allowlist' 
                ? 'Allow List (only selected sites are accessible)' 
                : 'Block List (only distracting sites are blocked)'}
            </p>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="flex items-center bg-transparent border border-[#CDAA7A]/30 text-[#333333] hover:bg-[#CDAA7A]/10 transition-all duration-300 rounded-[16px]"
          >
            Go Back
          </Button>
          
          <Button 
            onClick={handleAllowFiveMinutes}
            className="flex items-center bg-red-500/80 hover:bg-red-600 text-white transition-all duration-300 rounded-[16px]"
          >
            Allow for 5 minutes
          </Button>
          
          <Button
            onClick={handleOpenNewTab}
            className="bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] ibm-plex-mono-medium hover:scale-[1.02] transition-all duration-300 rounded-[16px]"
          >
            Open New Tab
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlockedPage;
