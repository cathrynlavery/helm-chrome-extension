import React, { useState, useEffect } from 'react';
import { FocusProfile } from '../lib/chromeStorage';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{profile ? `Edit Profile: ${profile.name}` : 'Create New Profile'}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <Label htmlFor="profileName" className="block text-sm font-medium mb-1">Profile Name</Label>
            <Input
              id="profileName"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full"
              placeholder="Enter profile name"
            />
          </div>
          
          <div className="mb-6">
            <Label htmlFor="profileDescription" className="block text-sm font-medium mb-1">Description (optional)</Label>
            <Textarea
              id="profileDescription"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full"
              placeholder="Add a description for this profile"
              rows={2}
            />
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium mb-3">Blocked Sites</Label>
            <div className="space-y-2 mb-4">
              {blockedSites.map(site => (
                <div key={site} className="flex items-center justify-between p-2 border border-input rounded-md">
                  <span>{site}</span>
                  <button 
                    onClick={() => handleRemoveSite(site)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              {blockedSites.length === 0 && (
                <div className="text-sm text-muted-foreground p-2">
                  No sites blocked. Add a site below.
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Input
                value={newSite}
                onChange={e => setNewSite(e.target.value)}
                placeholder="Enter website URL (e.g., reddit.com)"
                onKeyDown={handleKeyDown}
                className="flex-grow"
              />
              <Button onClick={handleAddSite}>
                Add
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
