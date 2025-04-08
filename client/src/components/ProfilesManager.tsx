import React, { useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ProfileCard from './ProfileCard';
import ProfileEditor from './ProfileEditor';
import { FocusProfile } from '../lib/chromeStorage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';

const ProfilesManager: React.FC = () => {
  const { profiles, setActiveProfile, createProfile, updateProfile, deleteProfile } = useFocus();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FocusProfile | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);
  
  const handleSelectProfile = (id: number) => {
    setActiveProfile(id);
  };
  
  const handleCreateProfile = () => {
    setEditingProfile(undefined);
    setIsEditorOpen(true);
  };
  
  const handleEditProfile = (profile: FocusProfile) => {
    setEditingProfile(profile);
    setIsEditorOpen(true);
  };
  
  const handleDeleteProfile = (id: number) => {
    setProfileToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteProfile = async () => {
    if (profileToDelete !== null) {
      await deleteProfile(profileToDelete);
      setIsDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };
  
  const handleSaveProfile = async (profileData: Omit<FocusProfile, 'id' | 'lastUsed'>) => {
    if (editingProfile) {
      // Update existing
      await updateProfile(editingProfile.id, profileData);
    } else {
      // Create new
      await createProfile(profileData);
    }
  };
  
  return (
    <>
      <div className="mb-10 flex justify-between items-center">
        <h3 className="text-xl libre-baskerville-bold text-[#333333] dark:text-[#CDAA7A]">
          Focus Profiles
        </h3>
        <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular">
          {profiles.length} profile{profiles.length !== 1 ? 's' : ''} available
        </p>
      </div>
        
      {/* Increased gap from 6 to 8, added px-1 for better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-1">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex" // Added flex to ensure full height
          >
            <ProfileCard
              profile={profile}
              onSelect={handleSelectProfile}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
            />
          </motion.div>
        ))}
        
        {/* New Profile "Card" Button - Now centered in its grid cell */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: (profiles.length * 0.05) + 0.05 }}
          className="flex" // Added flex to ensure full height and proper centering
        >
          <div 
            onClick={handleCreateProfile}
            className="bg-transparent border-2 border-dashed border-[#CDAA7A]/30 rounded-[16px] p-6 w-full flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#CDAA7A]/50 hover:bg-[#CDAA7A]/5 transition-all duration-300 min-h-[180px] hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-full bg-[#CDAA7A]/10 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-[#CDAA7A]" />
            </div>
            <h4 className="font-[500] text-[1rem] ibm-plex-mono-medium text-[#333333] dark:text-[#E0E0E0] mb-2">
              New Profile
            </h4>
            <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60">
              Create a custom focus environment
            </p>
          </div>
        </motion.div>
        
        {profiles.length === 0 && (
          <div className="col-span-full p-8 text-center">
            <div className="text-[#333333]/50 dark:text-[#E0E0E0]/50 ibm-plex-mono-regular mb-2">
              No profiles yet
            </div>
            <p className="text-sm text-[#333333]/70 dark:text-[#E0E0E0]/70 mb-4">
              Create your first focus profile to get started
            </p>
          </div>
        )}
      </div>
      
      <ProfileEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveProfile}
        profile={editingProfile}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-[#CDAA7A]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#333333] dark:text-[#E0E0E0] ibm-plex-mono-medium">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#333333]/70 dark:text-[#E0E0E0]/70">
              This will permanently delete this profile and its settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-[#CDAA7A]/30 text-[#333333] dark:text-[#E0E0E0] hover:bg-[#CDAA7A]/10 transition-all duration-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProfile} 
              className="bg-red-500/80 hover:bg-red-500 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfilesManager;
