import React, { useState, useEffect } from 'react';
import { FocusProfile } from '../lib/chromeStorage';
import { X, Globe, Plus, CheckSquare, Square, Check, Lock, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { SiFacebook, SiInstagram, SiYoutube, SiTiktok, SiReddit, SiLinkedin } from 'react-icons/si';
import { RiTwitterXFill } from 'react-icons/ri';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Omit<FocusProfile, 'id' | 'lastUsed'>) => Promise<void>;
  profile?: FocusProfile;
}

// Pre-defined popular sites with their URLs and icons
const popularSites = [
  { id: 'facebook', name: 'Facebook', url: 'facebook.com', icon: SiFacebook },
  { id: 'instagram', name: 'Instagram', url: 'instagram.com', icon: SiInstagram },
  { id: 'youtube', name: 'YouTube', url: 'youtube.com', icon: SiYoutube },
  { id: 'twitter', name: 'Twitter', url: 'twitter.com', icon: RiTwitterXFill },
  { id: 'tiktok', name: 'TikTok', url: 'tiktok.com', icon: SiTiktok },
  { id: 'reddit', name: 'Reddit', url: 'reddit.com', icon: SiReddit },
  { id: 'linkedin', name: 'LinkedIn', url: 'linkedin.com', icon: SiLinkedin },
];

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose, onSave, profile }) => {
  const [name, setName] = useState('');
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState('');
  const [selectedPopularSites, setSelectedPopularSites] = useState<string[]>([]);
  const [blockAll, setBlockAll] = useState(false);
  const [accessStyle, setAccessStyle] = useState<'allowlist' | 'blocklist'>('blocklist');
  
  // Initialize form when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBlockedSites([...profile.blockedSites]);
      // Use existing access style or default to blocklist if not present
      setAccessStyle(profile.accessStyle || 'blocklist');
      
      // Initialize selected popular sites based on existing blocked sites
      const selected = popularSites
        .filter(site => profile.blockedSites.includes(site.url))
        .map(site => site.id);
      setSelectedPopularSites(selected);
      
      // Check if all popular sites are already blocked
      setBlockAll(popularSites.every(site => profile.blockedSites.includes(site.url)));
    } else {
      // New profile defaults
      setName('');
      setBlockedSites([]);
      setSelectedPopularSites([]);
      setBlockAll(false);
      setAccessStyle('blocklist'); // Default to blocklist
    }
  }, [profile, isOpen]);
  
  // Toggle a popular site
  const togglePopularSite = (siteId: string) => {
    if (selectedPopularSites.includes(siteId)) {
      // Remove site
      const newSelected = selectedPopularSites.filter(id => id !== siteId);
      setSelectedPopularSites(newSelected);
      
      // Find URL and remove from blocked sites
      const siteUrl = popularSites.find(site => site.id === siteId)?.url;
      if (siteUrl) {
        setBlockedSites(blockedSites.filter(site => site !== siteUrl));
      }
      
      // Update blockAll state
      setBlockAll(false);
    } else {
      // Add site
      const newSelected = [...selectedPopularSites, siteId];
      setSelectedPopularSites(newSelected);
      
      // Find URL and add to blocked sites if not already present
      const siteUrl = popularSites.find(site => site.id === siteId)?.url;
      if (siteUrl && !blockedSites.includes(siteUrl)) {
        setBlockedSites([...blockedSites, siteUrl]);
      }
      
      // Check if all sites are now selected
      if (newSelected.length === popularSites.length) {
        setBlockAll(true);
      }
    }
  };
  
  // Toggle all popular sites
  const toggleAllPopularSites = () => {
    const newBlockAll = !blockAll;
    setBlockAll(newBlockAll);
    
    if (newBlockAll) {
      // Add all popular sites to selected and blocked lists
      const allSiteIds = popularSites.map(site => site.id);
      setSelectedPopularSites(allSiteIds);
      
      // Add URLs to blocked sites (without duplicates)
      const allSiteUrls = popularSites.map(site => site.url);
      const newBlockedSites = [...blockedSites];
      
      allSiteUrls.forEach(url => {
        if (!newBlockedSites.includes(url)) {
          newBlockedSites.push(url);
        }
      });
      
      setBlockedSites(newBlockedSites);
    } else {
      // Remove all popular sites
      setSelectedPopularSites([]);
      
      // Remove popular site URLs from blocked sites
      const popularUrls = popularSites.map(site => site.url);
      setBlockedSites(blockedSites.filter(site => !popularUrls.includes(site)));
    }
  };
  
  const handleAddSite = () => {
    if (!newSite.trim()) return;
    
    // Clean up URL format
    let url = newSite.trim().toLowerCase();
    
    // Remove protocol if present
    if (url.startsWith('http://')) url = url.substring(7);
    if (url.startsWith('https://')) url = url.substring(8);
    
    // Remove www. if present
    if (url.startsWith('www.')) url = url.substring(4);
    
    // Remove trailing path
    const domainEnd = url.indexOf('/');
    if (domainEnd > 0) {
      url = url.substring(0, domainEnd);
    }
    
    // Check if URL is already in popular sites
    const popularSite = popularSites.find(site => site.url === url);
    if (popularSite) {
      // If it's a popular site, toggle it on instead of adding manually
      if (!selectedPopularSites.includes(popularSite.id)) {
        togglePopularSite(popularSite.id);
      }
    } else if (!blockedSites.includes(url)) {
      // Only add if not already in the list
      setBlockedSites([...blockedSites, url]);
    }
    
    setNewSite('');
  };
  
  const handleRemoveSite = (site: string) => {
    setBlockedSites(blockedSites.filter(s => s !== site));
    
    // If it's a popular site, also unselect it
    const popularSite = popularSites.find(s => s.url === site);
    if (popularSite) {
      setSelectedPopularSites(selectedPopularSites.filter(id => id !== popularSite.id));
      setBlockAll(false);
    }
  };
  
  const handleSave = async () => {
    if (!name.trim()) return;
    
    await onSave({
      name,
      description: '', // Empty string for description
      blockedSites,
      isActive: profile?.isActive || false,
      accessStyle
    });
    
    onClose();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSite();
    }
  };
  
  // Filter out popular sites from manual list
  const popularUrls = popularSites.map(site => site.url);
  const customBlockedSites = blockedSites.filter(site => !popularUrls.includes(site));
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md bg-white dark:bg-gray-900 border border-[#CDAA7A]/20 p-8 rounded-[16px]" /* Increased padding and rounded corners */
        aria-describedby="profile-editor-description"
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl libre-baskerville-bold text-[#333333] dark:text-[#CDAA7A]"> {/* Changed to Libre Baskerville for headings */}
            {profile ? `Edit Profile: ${profile.name}` : 'Create New Profile'}
          </DialogTitle>
          <div id="profile-editor-description" className="sr-only">
            {profile ? 'Edit your focus profile settings.' : 'Create a new focus profile to manage distractions.'}
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-6">
            <Label htmlFor="profileName" className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0] mb-2">
              Profile Name
            </Label>
            <Input
              id="profileName"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-transparent border border-[#CDAA7A]/30 focus:border-[#CDAA7A] text-[#333333] dark:text-[#E0E0E0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px]"
              placeholder="Enter profile name"
            />
          </div>
          
          <div className="mb-6">
            <Label className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0] mb-3">
              Choose Your Access Style
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setAccessStyle('allowlist')}
                className={`cursor-pointer relative rounded-xl border p-4 ${
                  accessStyle === 'allowlist' 
                    ? 'border-[#CDAA7A] bg-[#CDAA7A]/10'
                    : 'border-gray-200 hover:border-[#CDAA7A]/50 dark:border-gray-700'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-2 ${
                    accessStyle === 'allowlist' 
                      ? 'border-2 border-[#CDAA7A] text-[#CDAA7A]'
                      : 'border border-gray-300 text-gray-400 dark:border-gray-600'
                  }`}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-center ibm-plex-mono-medium">Allow List</div>
                  {accessStyle === 'allowlist' && (
                    <div className="absolute top-2 right-2 text-[#CDAA7A]">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
              
              <div 
                onClick={() => setAccessStyle('blocklist')}
                className={`cursor-pointer relative rounded-xl border p-4 ${
                  accessStyle === 'blocklist' 
                    ? 'border-[#CDAA7A] bg-[#CDAA7A]/10'
                    : 'border-gray-200 hover:border-[#CDAA7A]/50 dark:border-gray-700'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-2 ${
                    accessStyle === 'blocklist' 
                      ? 'border-2 border-[#CDAA7A] text-[#CDAA7A]'
                      : 'border border-gray-300 text-gray-400 dark:border-gray-600'
                  }`}>
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-center ibm-plex-mono-medium">Block List</div>
                  {accessStyle === 'blocklist' && (
                    <div className="absolute top-2 right-2 text-[#CDAA7A]">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-[#333333]/80 dark:text-[#E0E0E0]/70">
              {accessStyle === 'allowlist' 
                ? "We'll block everything except the sites you've selected."
                : "We'll block distracting sites while allowing access to everything else."}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0]">
                {accessStyle === 'allowlist' ? 'Allowed Sites' : 'Blocked Sites'}
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="blockAll" 
                  checked={blockAll}
                  onCheckedChange={() => toggleAllPopularSites()}
                  className={`${blockAll ? 'text-[#333333] border-[#CDAA7A] bg-[#CDAA7A]' : 'border-gray-300 dark:border-gray-600'} focus:ring-[#CDAA7A]/25`}
                />
                <label 
                  htmlFor="blockAll" 
                  className="text-xs ibm-plex-mono-medium text-[#333333]/90 dark:text-[#E0E0E0]/90 cursor-pointer"
                >
                  {accessStyle === 'allowlist' ? 'Allow All Popular Sites' : 'Block All Popular Sites'}
                </label>
              </div>
            </div>
            
            <div className="border border-[#CDAA7A]/10 rounded-[12px] bg-white/30 dark:bg-gray-800/20 p-3 mb-4">
              <div className="space-y-2">
                {popularSites.map((site) => (
                  <div 
                    key={site.id}
                    className={`flex items-center justify-between p-2 rounded-[6px] transition-colors duration-200 ${
                      selectedPopularSites.includes(site.id) 
                        ? 'bg-[#CDAA7A]/10' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={`site-${site.id}`}
                        checked={selectedPopularSites.includes(site.id)}
                        onCheckedChange={() => togglePopularSite(site.id)}
                        className={`${
                          selectedPopularSites.includes(site.id) 
                            ? 'text-[#333333] border-[#CDAA7A] bg-[#CDAA7A]' 
                            : 'border-gray-300 dark:border-gray-600'
                        } focus:ring-[#CDAA7A]/25`}
                      />
                      <div className="flex items-center">
                        <site.icon className="h-4 w-4 text-[#333333]/70 dark:text-[#E0E0E0]/70 mr-2" />
                        <label 
                          htmlFor={`site-${site.id}`}
                          className={`ibm-plex-mono-medium text-sm cursor-pointer ${
                            selectedPopularSites.includes(site.id)
                              ? 'text-[#333333] dark:text-[#E0E0E0]' 
                              : 'text-[#333333]/70 dark:text-[#E0E0E0]/70'
                          }`}
                        >
                          {site.name}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-4 border-t border-[#CDAA7A]/10 pt-3">
                <button 
                  onClick={() => toggleAllPopularSites()}
                  className="text-xs text-[#333333]/70 dark:text-[#E0E0E0]/70 hover:text-[#CDAA7A] flex items-center"
                >
                  <CheckSquare className="h-3 w-3 mr-1" />
                  {blockAll ? 'Unselect All' : 'Select All'}
                </button>
                <div className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60">
                  {selectedPopularSites.length} of {popularSites.length} selected
                </div>
              </div>
            </div>
            
            <div className="text-xs text-[#333333]/70 dark:text-[#E0E0E0]/70 mb-4">
              {accessStyle === 'allowlist' 
                ? "Select sites you want to allow during focus sessions. All other sites will be blocked."
                : "Select popular sites to block during focus sessions. You can also add custom sites below."}
            </div>
            
            {/* Custom sites list */}
            {customBlockedSites.length > 0 && (
              <div className="space-y-2 mb-4">
                <Label className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0] mb-2">
                  {accessStyle === 'allowlist' ? 'Custom Allowed Sites' : 'Custom Blocked Sites'}
                </Label>
                {customBlockedSites.map((site, index) => (
                  <motion.div 
                    key={site}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-3 border border-[#CDAA7A]/20 rounded-[8px] bg-white/50 dark:bg-gray-800/30"
                  >
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-[#CDAA7A]" />
                      <span className="text-[#333333] dark:text-[#E0E0E0]">{site}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveSite(site)}
                      className="text-[#333333]/50 dark:text-[#E0E0E0]/50 hover:text-red-500 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div className="flex space-x-2 mt-4">
              <Input
                value={newSite}
                onChange={e => setNewSite(e.target.value)}
                placeholder={`Enter custom site URL to ${accessStyle === 'allowlist' ? 'allow' : 'block'}`}
                onKeyDown={handleKeyDown}
                className="flex-grow bg-transparent border border-[#CDAA7A]/30 focus:border-[#CDAA7A] text-[#333333] dark:text-[#E0E0E0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px]"
              />
              <Button 
                onClick={handleAddSite}
                className="bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] rounded-[8px] hover:scale-[1.02] transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                {accessStyle === 'allowlist' ? 'Allow Site' : 'Block Site'}
              </Button>
            </div>
            
            {/* Warning for allowlist mode with no sites */}
            {accessStyle === 'allowlist' && blockedSites.length === 0 && (
              <div className="mt-4 p-3 border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/50 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-amber-500">
                    ⚠️
                  </div>
                  <div className="ml-2 text-xs text-amber-800 dark:text-amber-300">
                    You haven't selected any allowed sites. All web access will be blocked during focus sessions.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-transparent border border-[#CDAA7A]/30 text-[#333333] dark:text-[#E0E0E0] hover:bg-[#CDAA7A]/10 transition-all duration-300 rounded-[8px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] rounded-[8px] hover:scale-[1.02] transition-all duration-200"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;