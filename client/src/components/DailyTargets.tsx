import React, { useState, useEffect } from 'react';
import { DailyTarget } from '../lib/chromeStorage';
import { useFocus } from '../contexts/FocusContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomQuote } from '../lib/quotes';

interface DailyTargetsProps {
  editable?: boolean;
}

export function DailyTargets({ editable = true }: DailyTargetsProps) {
  const { dailyTargets, addTarget, updateTarget, deleteTarget } = useFocus();
  const [newTargetText, setNewTargetText] = useState('');
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  const [quote, setQuote] = useState(getRandomQuote());
  
  useEffect(() => {
    // Rotate quotes every 30 seconds
    const interval = setInterval(() => {
      setQuote(getRandomQuote());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
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
    <div className={`w-full rounded-xl backdrop-blur-2xl transition-all duration-500 ease-in-out
      ${dailyTargets.some(t => t.completed) && !dailyTargets.every(t => t.completed)
        ? 'bg-white/80 dark:bg-gray-800/80 shadow-lg' 
        : allTasksCompleted 
          ? 'bg-amber-50/90 dark:bg-amber-900/20 shadow-lg border border-amber-100 dark:border-amber-800/30' 
          : 'bg-white/80 dark:bg-gray-800/80 shadow-md border border-gray-100/30 dark:border-gray-700/30'
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-medium 
            ${allTasksCompleted ? 'text-amber-600 dark:text-amber-400' : ''}`}
          >
            Today's Targets
          </h3>
          {allTasksCompleted && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8, x: -5 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className="text-sm text-amber-600 dark:text-amber-400 flex items-center"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              All completed
            </motion.span>
          )}
        </div>
        
        {editable && (
          <form onSubmit={handleAddTarget} className="flex gap-2 mb-6">
            <Input
              placeholder="What are you focusing on today?"
              value={newTargetText}
              onChange={(e) => setNewTargetText(e.target.value)}
              className="flex-1 border-gray-200 dark:border-gray-700 focus:border-amber-300 dark:focus:border-amber-600 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md"
              autoComplete="off"
            />
            <Button 
              type="submit" 
              disabled={dailyTargets.length >= 3}
              className={`transition-all duration-300 ${
                dailyTargets.length >= 3 
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
              }`}
            >
              Add
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
              <p className="text-lg font-medium mb-2 text-gray-500 dark:text-gray-400 italic">{quote.text}</p>
              <p className="text-sm text-muted-foreground">— {quote.author}</p>
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
                  className={`flex items-center p-4 rounded-lg transition-all duration-300 relative
                    ${target.completed 
                      ? 'bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 shadow-sm' 
                      : 'bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700 shadow hover:shadow-md'}`
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
                        className="text-amber-500 text-2xl"
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
                        className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-amber-200 to-amber-400 blur-2xl"
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
                        ? 'border-amber-500 bg-amber-500 text-white' 
                        : 'border-gray-300 dark:border-gray-600'}`
                    }
                  />
                  <label 
                    htmlFor={`target-${target.id}`}
                    className={`flex-1 transition-all duration-300 text-base ${
                      target.completed 
                        ? 'line-through text-amber-600 dark:text-amber-400 font-medium' 
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