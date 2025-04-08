import React, { useState, useEffect } from 'react';
import { FocusProfile } from '../lib/chromeStorage';
import { X, Globe, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Omit<FocusProfile, 'id' | 'lastUsed'>) => Promise<void>;
  profile?: FocusProfile;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose, onSave, profile }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState('');
  
  // Initialize form when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setDescription(profile.description || '');
      setBlockedSites([...profile.blockedSites]);
    } else {
      // New profile defaults
      setName('');
      setDescription('');
      setBlockedSites([]);
    }
  }, [profile, isOpen]);
  
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
    
    // Only add if not already in the list
    if (!blockedSites.includes(url)) {
      setBlockedSites([...blockedSites, url]);
    }
    
    setNewSite('');
  };
  
  const handleRemoveSite = (site: string) => {
    setBlockedSites(blockedSites.filter(s => s !== site));
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
            <Label className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0] mb-3">
              Blocked Sites
            </Label>
            <div className="space-y-2 mb-5">
              {blockedSites.map((site, index) => (
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
              
              {blockedSites.length === 0 && (
                <div className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 p-4 text-center border border-dashed border-[#CDAA7A]/20 rounded-[8px]">
                  No sites blocked yet. Add websites you want to block during focus sessions.
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Input
                value={newSite}
                onChange={e => setNewSite(e.target.value)}
                placeholder="Enter website URL (e.g., reddit.com)"
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
