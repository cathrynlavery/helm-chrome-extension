import React, { useState, useEffect } from 'react';
import { FocusProfile } from '../lib/chromeStorage';
import { X, Globe, Plus, CheckSquare, Square, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [description, setDescription] = useState('');
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState('');
  const [selectedPopularSites, setSelectedPopularSites] = useState<string[]>([]);
  const [blockAll, setBlockAll] = useState(false);
  
  // Initialize form when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setDescription(profile.description || '');
      setBlockedSites([...profile.blockedSites]);
      
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
      setDescription('');
      setBlockedSites([]);
      setSelectedPopularSites([]);
      setBlockAll(false);
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
      description,
      blockedSites,
      isActive: profile?.isActive || false
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
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-[#CDAA7A]/20 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A]">
            {profile ? `Edit Profile: ${profile.name}` : 'Create New Profile'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-5">
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
            <Label htmlFor="profileDescription" className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0] mb-2">
              Description (optional)
            </Label>
            <Textarea
              id="profileDescription"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-transparent border border-[#CDAA7A]/30 focus:border-[#CDAA7A] text-[#333333] dark:text-[#E0E0E0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px]"
              placeholder="Add a description for this profile"
              rows={2}
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0]">
                Blocked Sites
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
                  Block All Popular Sites
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
              Select popular sites to block instantly. You can also add custom sites below.
            </div>
            
            {/* Custom sites list */}
            {customBlockedSites.length > 0 && (
              <div className="space-y-2 mb-4">
                <Label className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0] mb-2">
                  Custom Blocked Sites
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
                placeholder="Enter custom site URL (e.g., example.com)"
                onKeyDown={handleKeyDown}
                className="flex-grow bg-transparent border border-[#CDAA7A]/30 focus:border-[#CDAA7A] text-[#333333] dark:text-[#E0E0E0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px]"
              />
              <Button 
                onClick={handleAddSite}
                className="bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] rounded-[8px] hover:scale-[1.02] transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
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
