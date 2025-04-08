import React from 'react';
import { FocusProfile } from '../lib/chromeStorage';
import { Pencil, Trash2, Shield, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfileCardProps {
  profile: FocusProfile;
  onSelect: (id: number) => void;
  onEdit: (profile: FocusProfile) => void;
  onDelete: (id: number) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelect, onEdit, onDelete }) => {
  const handleClick = () => {
    onSelect(profile.id);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(profile);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(profile.id);
  };
  
  return (
    <div 
      className={`bg-white dark:bg-transparent rounded-[16px] p-6 cursor-pointer transition-all duration-300 border w-full ${
        profile.isActive 
          ? 'border-[#CDAA7A]/50 shadow-md hover:shadow-lg' 
          : 'border-[#CDAA7A]/20 hover:border-[#CDAA7A]/30'
      } hover:scale-[1.02]`} 
      // Updated padding from p-5 to p-6 (24px), added w-full to fill container, and increased hover scale for consistency
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-[500] text-[1rem] ibm-plex-mono-medium text-[#333333] dark:text-[#E0E0E0]">{profile.name}</h4>
        {profile.isActive ? (
          <Badge className="bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] px-2 py-0.5 text-xs ibm-plex-mono-medium">
            Active
          </Badge>
        ) : (
          <Badge className="bg-gray-200 dark:bg-gray-700 text-[#333333] dark:text-[#E0E0E0]/70 hover:bg-gray-300 dark:hover:bg-gray-600 px-2 py-0.5 text-xs ibm-plex-mono-medium">
            Inactive
          </Badge>
        )}
      </div>
      
      <div className="mb-5 text-sm">
        <div className="flex items-center mb-2 text-[#333333]/80 dark:text-[#E0E0E0]/80">
          <Shield className="h-4 w-4 mr-2 text-[#CDAA7A]" />
          <span>{profile.blockedSites.length} site{profile.blockedSites.length !== 1 ? 's' : ''} blocked</span>
        </div>
        <div className="flex items-center text-[#333333]/80 dark:text-[#E0E0E0]/80">
          <Clock className="h-4 w-4 mr-2 text-[#CDAA7A]" />
          <span>Last used: {formatLastUsed(profile.lastUsed)}</span>
        </div>
      </div>
      
      <div className="pt-3 mt-auto border-t border-[#CDAA7A]/10 flex justify-between">
        <button 
          className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60 hover:text-[#CDAA7A] flex items-center transition-all duration-200 hover:underline group px-2 py-1 rounded-md hover:bg-[#CDAA7A]/5" 
          onClick={handleEdit}
          aria-label="Edit profile"
        >
          <Pencil className="h-3.5 w-3.5 mr-2 group-hover:scale-110 transition-transform duration-200" />
          Edit
        </button>
        
        <button 
          className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60 hover:text-red-500 flex items-center transition-all duration-200 hover:underline group px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10" 
          onClick={handleDelete}
          aria-label="Delete profile"
        >
          <Trash2 className="h-3.5 w-3.5 mr-2 group-hover:scale-110 transition-transform duration-200" />
          Delete
        </button>
      </div>
    </div>
  );
};

// Helper to format the last used date
function formatLastUsed(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return `${diffDays} days ago`;
  }
}

export default ProfileCard;
