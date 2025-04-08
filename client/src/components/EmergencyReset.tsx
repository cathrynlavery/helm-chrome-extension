import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { FocusTimer as FocusTimerClass } from '@/lib/focusTimer';
import { useFocus } from '@/contexts/FocusContext';
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
 * Only shows during active focus sessions
 */
const EmergencyReset: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { focusTimer } = useFocus();
  const isSessionActive = focusTimer.state.isRunning;
  
  const handleEmergencyReset = async () => {
    console.log('Emergency reset triggered from UI');
    
    try {
      // Use the directly imported FocusTimer class (most reliable)
      try {
        const timerInstance = FocusTimerClass.getInstance();
        console.log('Using direct FocusTimerClass import for reset');
        await timerInstance.emergencyReset();
        console.log('FocusTimer emergency reset completed via direct import');
        
        // Short delay to allow the timer state to propagate
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      } catch (directError) {
        console.error('Error using direct FocusTimerClass:', directError);
      }
      
      // Fallback to global instance if available
      try {
        if ((window as any).FocusTimer?.getInstance) {
          const timerInstance = (window as any).FocusTimer.getInstance();
          if (timerInstance && typeof timerInstance.emergencyReset === 'function') {
            console.log('Using window.FocusTimer global instance for reset');
            await timerInstance.emergencyReset();
            console.log('FocusTimer emergency reset completed via global instance');
            
            // Short delay to allow the timer state to propagate
            setTimeout(() => {
              window.location.reload();
            }, 500);
            return;
          }
        }
      } catch (globalError) {
        console.error('Error using global FocusTimer:', globalError);
      }
      
      // Last resort: direct localStorage clearing
      console.log('Fallback: Clearing local storage data directly');
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

  // Don't render anything if no active session
  if (!isSessionActive) {
    return null;
  }
  
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 opacity-70 hover:opacity-100 transition-opacity duration-300">
        {/* Primary button using Shadcn UI */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="text-red-500 bg-red-50 dark:bg-zinc-900 border border-red-300 dark:border-red-700/50 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full px-4 py-1 text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 flex items-center gap-2"
        >
          <AlertTriangle className="h-3 w-3" />
          Emergency Reset
        </Button>
        
        {/* Backup button that appears only if there are interactive issues with the primary button */}
        <button
          onClick={() => setIsDialogOpen(true)}
          className="cursor-pointer mt-2 inline-flex items-center justify-center px-3 py-1 text-xs rounded-full bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150"
          style={{ display: 'none' }} // Hidden by default, can be shown with JS if needed
          id="emergency-reset-backup"
        >
          Backup Reset Button
        </button>
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
          <AlertDialogFooter className="flex justify-end space-x-2">
            {/* Fallback buttons that use native HTML for maximum reliability */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 cursor-pointer rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmergencyReset}
                className="px-4 py-2 cursor-pointer rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-150"
              >
                Yes, Reset Everything
              </button>
            </div>
            
            {/* Original styled buttons */}
            <div className="hidden">
              <AlertDialogCancel className="rounded-xl border border-zinc-200 dark:border-zinc-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleEmergencyReset}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
              >
                Yes, Reset Everything
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmergencyReset;