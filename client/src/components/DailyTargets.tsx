import React, { useState } from 'react';
import { DailyTarget } from '../lib/chromeStorage';
import { useFocus } from '../contexts/FocusContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyTargetsProps {
  editable?: boolean;
}

export function DailyTargets({ editable = true }: DailyTargetsProps) {
  const { dailyTargets, addTarget, updateTarget, deleteTarget } = useFocus();
  const [newTargetText, setNewTargetText] = useState('');
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  
  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTargetText.trim()) {
      addTarget(newTargetText);
      setNewTargetText('');
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
  
  return (
    <div className="w-full rounded-xl transition-all duration-500 ease-in-out bg-transparent">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`heading-text text-lg 
            ${allTasksCompleted ? 'text-primary dark:text-primary' : ''}`}
          >
            Today's Targets
          </h3>
          {allTasksCompleted && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8, x: -5 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className="metadata-label text-primary dark:text-primary flex items-center opacity-80"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              All completed
            </motion.span>
          )}
        </div>
        
        {editable && (
          <form onSubmit={handleAddTarget} className="flex gap-2 mb-8">
            <Input
              placeholder="What will you focus on today?"
              value={newTargetText}
              onChange={(e) => setNewTargetText(e.target.value)}
              className="flex-1 rounded-[16px] ibm-plex-mono-regular border-gray-200 dark:border-gray-700 focus:border-primary hover:border-primary/60 dark:focus:border-primary dark:hover:border-primary/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md py-6 px-8"
              autoComplete="off"
            />
            <Button 
              type="submit" 
              disabled={dailyTargets.length >= 3}
              className={`transition-all duration-300 rounded-[16px] ibm-plex-mono-medium flex items-center justify-center w-12 h-12 ${
                dailyTargets.length >= 3 
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.98]'
              }`}
            >
              <span className="text-xl font-medium text-primary-foreground group-hover:scale-110 transition-transform duration-200">+</span>
            </Button>
          </form>
        )}
        
        <AnimatePresence>
          {dailyTargets.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              {/* higher contrast gray */}
              <p className="ibm-plex-mono-regular text-sm text-[#8E8E8E]">
                No targets set for today
              </p>
            </motion.div>
          ) : (
            <motion.div className="space-y-4">
              {dailyTargets.map((target) => (
                <motion.div 
                  key={target.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: completedTaskId === target.id ? [1, 1.03, 1] : 1,
                    transition: {
                      scale: {
                        duration: 0.4
                      }
                    }
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center p-4 rounded-lg transition-all duration-300 relative border-0
                    ${target.completed 
                      ? 'bg-transparent' 
                      : 'bg-transparent hover:bg-gray-50/20 dark:hover:bg-gray-800/10'}`
                  }
                >
                  {completedTaskId === target.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.4, 0] }}
                      transition={{ duration: 1.2, times: [0, 0.4, 1] }}
                      className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                    >
                      <motion.div 
                        animate={{ 
                          opacity: [0, 1, 0],
                          y: [0, -30]
                        }}
                        transition={{ duration: 1.2 }}
                        className="text-primary text-2xl"
                      >
                        ✓
                      </motion.div>
                      
                      {/* Confetti effect */}
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ 
                          scale: [0.5, 1.5],
                          opacity: [0.8, 0]
                        }}
                        transition={{ duration: 0.8 }}
                        className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-primary/30 to-primary/70 blur-2xl"
                      />
                    </motion.div>
                  )}
                  
                  <Checkbox
                    id={`target-${target.id}`}
                    checked={target.completed}
                    onCheckedChange={(checked) => {
                      handleToggleComplete(target.id, checked === true);
                    }}
                    className={`mr-4 transition-all duration-200 h-5 w-5 
                      ${target.completed 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/70'}`
                    }
                  />
                  <label 
                    htmlFor={`target-${target.id}`}
                    className={`flex-1 transition-all duration-300 text-base ibm-plex-mono-regular ${
                      target.completed 
                        ? 'line-through text-primary dark:text-primary font-medium' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {target.text}
                  </label>
                  
                  {editable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTarget(target.id)}
                      className="ml-2 h-8 w-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}