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
      <p className="text-sm text-center uppercase ibm-plex-mono-medium text-[#333333]/80 dark:text-[#333333]/80 mb-2">Focus Space</p>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="flex items-center text-[1.25rem] heading-text text-[#333333] dark:text-[#333333] focus:outline-none hover:text-[#CDAA7A] transition-colors">
          <span>{activeProfile?.name || 'Select Profile'}</span>
          <ChevronDown className="ml-1 h-5 w-5" />
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="center" className="w-48 bg-white/90 backdrop-blur-md rounded-[12px] border border-[#CDAA7A]/30">
          {profiles.map(profile => (
            <DropdownMenuItem 
              key={profile.id}
              className="cursor-pointer ibm-plex-mono-regular hover:text-[#CDAA7A] hover:bg-[#CDAA7A]/10 transition-colors"
              onClick={() => handleSelectProfile(profile.id)}
            >
              {profile.name}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-[#CDAA7A]/20" />
          
          <DropdownMenuItem className="text-[#CDAA7A] cursor-pointer ibm-plex-mono-regular hover:bg-[#CDAA7A]/10 transition-colors">
            Manage profiles...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileSelector;
