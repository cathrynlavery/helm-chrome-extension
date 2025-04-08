import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
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

/**
 * Emergency Reset component - a force exit of any stuck focus sessions
 * This component provides a last resort way to exit a stuck focus session
 * by directly clearing localStorage and forcing a page reload
 */
const EmergencyReset: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleEmergencyReset = () => {
    console.log('Emergency reset triggered');
    
    try {
      // Clear localStorage
      console.log('Clearing local storage data');
      localStorage.removeItem('helmData');
      
      // Set a flag to indicate we're recovering from emergency
      localStorage.setItem('helm_emergency_reset', 'true');
      
      // Force reload
      window.location.reload();
    } catch (error) {
      console.error('Error during emergency reset:', error);
      alert('Failed to reset. Please try refreshing the page manually.');
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 opacity-70 hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="text-red-500 bg-red-50 dark:bg-zinc-900 border border-red-300 dark:border-red-700/50 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full px-4 py-1 text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 flex items-center gap-2"
        >
          <AlertTriangle className="h-3 w-3" />
          Emergency Reset
        </Button>
      </div>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Emergency Reset Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-700 dark:text-zinc-300">
              This will force exit any focus session, clear storage data, and reload the app. 
              Use this only if you're stuck in a session that won't end normally.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border border-zinc-200 dark:border-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEmergencyReset}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              Yes, Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmergencyReset;