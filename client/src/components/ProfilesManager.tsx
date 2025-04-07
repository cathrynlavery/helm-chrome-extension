import React, { useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
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
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Focus Profiles</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary font-medium flex items-center" 
              onClick={handleCreateProfile}
            >
              <PlusCircle className="h-5 w-5 mr-1" />
              New Profile
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map(profile => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onSelect={handleSelectProfile}
                onEdit={handleEditProfile}
                onDelete={handleDeleteProfile}
              />
            ))}
            
            {profiles.length === 0 && (
              <div className="col-span-full text-center p-4 text-muted-foreground">
                No profiles yet. Create a profile to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <ProfileEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveProfile}
        profile={editingProfile}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this profile and its settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProfile} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfilesManager;
