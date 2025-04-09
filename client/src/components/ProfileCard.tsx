import React from 'react';
import { FocusProfile } from '../lib/chromeStorage';
import { Pencil, Trash2, Shield, Clock, ShieldCheck, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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
    <motion.div 
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(205, 170, 122, 0.1), 0 10px 10px -5px rgba(205, 170, 122, 0.04)"
      }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div 
        className={`bg-white dark:bg-transparent rounded-[16px] p-6 cursor-pointer transition-all duration-300 border w-full ${
          profile.isActive 
            ? 'border-[#CDAA7A]/50 shadow-md' 
            : 'border-[#CDAA7A]/20 hover:border-[#CDAA7A]/40'
        }`} 
        onClick={handleClick}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-[15px] ibm-plex-mono-medium text-[#333333] dark:text-[#E0E0E0]">
            {profile.name}
          </h4>
          {profile.isActive ? (
            <Badge className="bg-gradient-to-r from-[#CDAA7A] to-[#E4CA8C] hover:from-[#CDAA7A] hover:to-[#E4CA8C] text-[#333333] px-2.5 py-0.5 text-xs ibm-plex-mono-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3 mr-0.5" />
              Active
            </Badge>
          ) : (
            <Badge className="bg-gray-200 dark:bg-gray-700 text-[#333333] dark:text-[#E0E0E0]/70 hover:bg-gray-300 dark:hover:bg-gray-600 px-2.5 py-0.5 text-xs ibm-plex-mono-medium flex items-center gap-1">
              <XCircle className="h-3 w-3 mr-0.5" />
              Inactive
            </Badge>
          )}
        </div>
        
        <div className="mb-5 text-[13px]">
          <div className="flex items-center mb-2 text-[#333333]/80 dark:text-[#E0E0E0]/80">
            {profile.accessStyle === 'allowlist' ? (
              <ShieldCheck className="h-4 w-4 mr-2 text-[#CDAA7A]" />
            ) : (
              <Lock className="h-4 w-4 mr-2 text-[#CDAA7A]" />
            )}
            <span>
              {profile.accessStyle === 'allowlist' 
                ? `Allow List: ${profile.blockedSites.length} site${profile.blockedSites.length !== 1 ? 's' : ''} allowed` 
                : `Block List: ${profile.blockedSites.length} site${profile.blockedSites.length !== 1 ? 's' : ''} blocked`}
            </span>
          </div>
          <div className="flex items-center text-[#333333]/80 dark:text-[#E0E0E0]/80">
            <Clock className="h-4 w-4 mr-2 text-[#CDAA7A]" />
            <span>Last used: {formatLastUsed(profile.lastUsed)}</span>
          </div>
        </div>
        
        <div className="pt-3 mt-auto border-t border-[#CDAA7A]/10 flex justify-between">
          <motion.button 
            className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60 hover:text-[#CDAA7A] flex items-center transition-all duration-200 group px-2.5 py-1.5 rounded-md hover:bg-[#CDAA7A]/5" 
            onClick={handleEdit}
            aria-label="Edit profile"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5 group-hover:scale-110 transition-transform duration-200" />
            Edit
          </motion.button>
          
          <motion.button 
            className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60 hover:text-red-500 flex items-center transition-all duration-200 group px-2.5 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10" 
            onClick={handleDelete}
            aria-label="Delete profile"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5 group-hover:scale-110 transition-transform duration-200" />
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
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
