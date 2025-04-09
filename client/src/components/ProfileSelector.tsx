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
    <div className="flex flex-col items-center justify-center w-full text-center">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="flex items-center justify-center text-[0.75rem] text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none hover:text-[#CDAA7A] transition-colors">
          <ChevronDown className="ml-1 h-3 w-3" />
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="center" className="w-48 bg-white/90 dark:bg-white/95 backdrop-blur-md rounded-[12px] border border-[#CDAA7A]/30 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          {profiles.map(profile => (
            <DropdownMenuItem 
              key={profile.id}
              className="cursor-pointer ibm-plex-mono-regular text-[#333333] dark:text-[#333333] hover:text-[#CDAA7A] hover:bg-[#CDAA7A]/10 transition-colors text-sm"
              onClick={() => handleSelectProfile(profile.id)}
            >
              {profile.name}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-[#CDAA7A]/20" />
          
          <DropdownMenuItem className="text-[#CDAA7A] cursor-pointer ibm-plex-mono-regular hover:text-[#CDAA7A]/80 hover:bg-[#CDAA7A]/10 transition-colors text-sm">
            Manage profiles...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileSelector;
