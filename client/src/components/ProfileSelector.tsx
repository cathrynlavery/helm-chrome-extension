import React, { useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

const ProfileSelector: React.FC = () => {
  const { profiles, activeProfile, setActiveProfile } = useFocus();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelectProfile = async (id: number) => {
    await setActiveProfile(id);
    setIsOpen(false);
  };
  
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-center uppercase ibm-plex-mono-medium text-gray-500 dark:text-gray-400 mb-2">Work Profile</p>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="flex items-center text-[1.25rem] heading-text text-zinc-900 dark:text-zinc-100 focus:outline-none hover:text-primary transition-colors">
          <span>{activeProfile?.name || 'Select Profile'}</span>
          <ChevronDown className="ml-1 h-5 w-5" />
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="center" className="w-48">
          {profiles.map(profile => (
            <DropdownMenuItem 
              key={profile.id}
              className="cursor-pointer"
              onClick={() => handleSelectProfile(profile.id)}
            >
              {profile.name}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="text-primary cursor-pointer">
            Manage profiles...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileSelector;
