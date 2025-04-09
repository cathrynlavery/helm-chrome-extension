import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
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
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Emergency Exit component - provides a way to exit a focus session without saving progress
 * This component shows a confirmation modal before ending the session
 * Only shows during active focus sessions
 */
const EmergencyReset: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { timerState, endTimer } = useFocus();
  const isSessionActive = timerState.isRunning;
  
  const handleEmergencyExit = async () => {
    console.log('Emergency exit confirmed');
    
    try {
      // End the timer without saving progress
      await endTimer(false); // Pass false to indicate no progress should be saved
      
      // Clear any session data
      localStorage.removeItem('helmData');
      localStorage.setItem('helm_emergency_exit', 'true');
      
      // Force reload
      window.location.reload();
    } catch (error) {
      console.error('Error during emergency exit:', error);
      alert('Failed to exit. Please try refreshing the page manually.');
    }
  };

  // Don't render anything if no active session
  if (!isSessionActive) {
    return null;
  }
  
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 opacity-70 hover:opacity-100 transition-opacity duration-300">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className="text-red-500 bg-red-50 dark:bg-zinc-900 border border-red-300 dark:border-red-700/50 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full px-4 py-1 text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 flex items-center gap-2"
              >
                <AlertTriangle className="h-3 w-3" />
                Emergency Exit
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ends your session early. No focus time will be logged.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-medium">End Session Early?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400">
                Leaving now will lose your reclaimed time for this session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border-none">
                Resume Session
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEmergencyExit}
                className="bg-red-500 hover:bg-red-600 text-white border-none"
              >
                End Without Saving
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmergencyReset;