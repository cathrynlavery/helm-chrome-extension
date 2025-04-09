import React, { useState, useRef, useEffect } from 'react';
import { DailyTarget } from '../lib/chromeStorage';
import { useFocus } from '../contexts/FocusContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, CheckCircle2, Plus, Check, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DailyTargetsProps {
  editable?: boolean;
}

export function DailyTargets({ editable = true }: DailyTargetsProps) {
  const { dailyTargets, addTarget, updateTarget, deleteTarget, timerState } = useFocus();
  const [newTargetText, setNewTargetText] = useState('');
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxTargets = 3;
  
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);
  
  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTargetText.trim() && dailyTargets.length < maxTargets) {
      addTarget(newTargetText.trim());
      setNewTargetText('');
      setShowInput(false);
    }
  };
  
  const handleToggleComplete = (id: number, completed: boolean) => {
    updateTarget(id, { completed });
    
    if (completed) {
      setCompletedTaskId(id);
      // Reset after animation completes
      setTimeout(() => {
        setCompletedTaskId(null);
      }, 1500);
    }
  };
  
  const allTasksCompleted = dailyTargets.length > 0 && dailyTargets.every(t => t.completed);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowInput(false);
      setNewTargetText('');
    }
  };
  
  return (
    <div className="w-full">
      <div 
        className={cn(
          "max-w-[500px] mx-auto transition-all duration-300",
          timerState.isRunning ? "text-white" : ""
        )}
      >
        <div className="flex justify-between items-center mb-4">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm uppercase tracking-wider font-medium text-zinc-800 dark:text-zinc-200">
              Today's Targets
            </h2>
            {allTasksCompleted && dailyTargets.length > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ml-2 flex items-center text-[#CDAA7A]"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </motion.div>
            )}
          </motion.div>
          
          <span className="text-xs text-zinc-500/80 dark:text-zinc-400/80 ibm-plex-mono-regular">
            {dailyTargets.length}/{maxTargets}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <AnimatePresence>
            {dailyTargets.map((target) => (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
                className={cn(
                  "flex items-center justify-between py-3 px-4 rounded-xl transition-colors duration-200 group border",
                  target.completed
                    ? "bg-[#CDAA7A]/10 border-[#CDAA7A]/20 dark:bg-[#CDAA7A]/5 dark:border-[#CDAA7A]/20"
                    : "bg-white/80 dark:bg-zinc-900/30 dark:border-zinc-800/70 border-zinc-200/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                )}
              >
                <div 
                  className="flex items-center w-full cursor-pointer"
                  onClick={() => handleToggleComplete(target.id, !target.completed)}
                >
                  <div className={cn(
                    "flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-md border transition-colors duration-300",
                    target.completed 
                      ? "bg-[#CDAA7A] border-[#CDAA7A]" 
                      : "border-zinc-300 dark:border-zinc-600 group-hover:border-[#CDAA7A]"
                  )}>
                    <AnimatePresence mode="wait">
                      {target.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="h-3.5 w-3.5 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <motion.span 
                    className={cn(
                      "ml-3 text-sm flex-grow pr-2 transition-all duration-300",
                      target.completed 
                        ? "text-zinc-500 dark:text-zinc-400 line-through" 
                        : "text-zinc-800 dark:text-zinc-200"
                    )}
                    animate={{
                      opacity: target.completed ? 0.7 : 1,
                    }}
                  >
                    {target.text}
                  </motion.span>
                </div>
                
                {editable && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTarget(target.id);
                    }}
                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200 -mr-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {dailyTargets.length < maxTargets && (
          <AnimatePresence mode="wait">
            {showInput ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAddTarget}
                className="flex items-center space-x-2 mt-2"
              >
                <Input
                  ref={inputRef}
                  value={newTargetText}
                  onChange={(e) => setNewTargetText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What do you want to accomplish today?"
                  className="flex-grow py-2 px-4 border border-[#CDAA7A]/30 focus-visible:ring-[#CDAA7A]/30 rounded-xl bg-white/90 dark:bg-zinc-900/30 text-sm placeholder:text-zinc-400/70"
                />
                
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={!newTargetText.trim()}
                    size="sm"
                    className="rounded-xl bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-zinc-900 text-xs py-2 px-3 h-auto shadow-sm hover:shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInput(false)}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs py-2 px-3 h-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={() => setShowInput(true)}
                  variant="outline"
                  className="w-full py-3 px-4 rounded-xl border bg-white/80 dark:bg-zinc-900/30 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#CDAA7A]/60 hover:bg-[#CDAA7A]/5 text-zinc-500 dark:text-zinc-400 hover:text-[#CDAA7A] transition-all duration-300 text-sm group"
                >
                  <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Add Target
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {allTasksCompleted && dailyTargets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="mt-6 text-center"
          >
            <div className="bg-[#CDAA7A]/10 dark:bg-[#CDAA7A]/5 border border-[#CDAA7A]/20 rounded-xl py-3 px-4 inline-flex items-center justify-center">
              <Sparkles className="h-4 w-4 mr-2 text-[#CDAA7A]" />
              <span className="text-sm text-[#CDAA7A]">All targets completed!</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}