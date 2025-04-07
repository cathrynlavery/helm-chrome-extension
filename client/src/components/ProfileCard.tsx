import React from 'react';
import { FocusProfile } from '../lib/chromeStorage';
import { Pencil, Trash2 } from 'lucide-react';

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
      className={`border rounded-lg p-4 hover:border-primary cursor-pointer transition-all ${profile.isActive ? 'border-primary' : 'border-neutral-border'}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{profile.name}</h4>
        <div className="flex items-center">
          <span className={`inline-flex h-2 w-2 rounded-full ${profile.isActive ? 'bg-status-success' : 'bg-muted-foreground'} mr-1`}></span>
          <span className="text-xs text-muted-foreground">{profile.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
      
      <div className="mb-3 text-sm text-muted-foreground">
        <div className="mb-1">Blocked: {profile.blockedSites.length} sites</div>
        <div>Last used: {formatLastUsed(profile.lastUsed)}</div>
      </div>
      
      <div className="flex justify-between">
        <button 
          className="text-xs text-muted-foreground hover:text-primary flex items-center" 
          onClick={handleEdit}
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </button>
        
        <button 
          className="text-xs text-muted-foreground hover:text-destructive flex items-center" 
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3 mr-1" />
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
