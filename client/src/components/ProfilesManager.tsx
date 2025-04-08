import React, { useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
      <div className="mb-6 flex justify-between items-center">
        <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular">
          {profiles.length} profile{profiles.length !== 1 ? 's' : ''} available
        </p>
        <Button 
          className="bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] ibm-plex-mono-medium px-4 py-2 text-sm hover:scale-[1.02] transition-all duration-300 rounded-[16px] shadow-md"
          onClick={handleCreateProfile}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Profile
        </Button>
      </div>
        
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ProfileCard
              profile={profile}
              onSelect={handleSelectProfile}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
            />
          </motion.div>
        ))}
        
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
