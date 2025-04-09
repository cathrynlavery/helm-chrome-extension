import React, { useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
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
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      setActiveProfile(profile);
    }
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
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center">
          <Layers className="h-5 w-5 text-[#CDAA7A] mr-2" />
          <h3 className="text-lg ibm-plex-mono-medium text-[#333333] dark:text-[#E0E0E0]">
            Available Profiles
          </h3>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular text-xs bg-[#CDAA7A]/10 px-3 py-1 rounded-full"
        >
          {profiles.length} profile{profiles.length !== 1 ? 's' : ''} available
        </motion.div>
      </div>
        
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 px-1">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex flex-col relative" 
          >
            <ProfileCard
              profile={profile}
              onSelect={handleSelectProfile}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
            />
            
            {(index + 1) % 3 !== 0 && index !== profiles.length - 1 && (
              <div className="absolute -right-4 top-0 bottom-0 w-px bg-[#CDAA7A]/10 hidden lg:block" />
            )}
            {(index + 1) % 1 !== 0 && index !== profiles.length - 1 && (
              <div className="absolute -bottom-5 left-0 right-0 h-px bg-[#CDAA7A]/10 block lg:hidden" />
            )}
          </motion.div>
        ))}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: (profiles.length * 0.05) + 0.05 }}
          className="flex"
          whileHover={{ scale: 1.02 }}
        >
          <div 
            onClick={handleCreateProfile}
            className="bg-white/30 dark:bg-gray-900/20 backdrop-blur-sm border-2 border-dashed border-[#CDAA7A]/30 rounded-[16px] p-6 w-full flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#CDAA7A]/50 hover:bg-[#CDAA7A]/5 transition-all duration-300 min-h-[180px] shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CDAA7A]/20 to-[#E4CA8C]/20 flex items-center justify-center mb-3 shadow-inner">
              <Plus className="h-6 w-6 text-[#CDAA7A]" />
            </div>
            <h4 className="font-medium text-[15px] ibm-plex-mono-medium text-[#333333] dark:text-[#E0E0E0] mb-2">
              New Profile
            </h4>
            <p className="text-xs text-[#333333]/60 dark:text-[#E0E0E0]/60">
              Create a custom focus environment
            </p>
          </div>
        </motion.div>
        
        {profiles.length === 0 && (
          <div className="col-span-full p-10 text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-[#CDAA7A]/5 p-8 rounded-xl border border-[#CDAA7A]/20"
            >
              <div className="w-14 h-14 rounded-full bg-[#CDAA7A]/10 mx-auto flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-[#CDAA7A]" />
              </div>
              <div className="text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-medium mb-2 text-base">
                No profiles yet
              </div>
              <p className="text-sm text-[#333333]/60 dark:text-[#E0E0E0]/60 mb-5 max-w-xs mx-auto">
                Create your first focus profile to get started with customized focus environments
              </p>
              <Button
                onClick={handleCreateProfile}
                className="bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Create First Profile
              </Button>
            </motion.div>
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
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-[#CDAA7A]/20 rounded-xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#333333] dark:text-[#E0E0E0] ibm-plex-mono-medium">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#333333]/70 dark:text-[#E0E0E0]/70">
              This will permanently delete this profile and its settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-[#CDAA7A]/30 text-[#333333] dark:text-[#E0E0E0] hover:bg-[#CDAA7A]/10 transition-all duration-300 rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProfile} 
              className="bg-red-500/80 hover:bg-red-500 text-white rounded-lg shadow-sm hover:shadow"
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
