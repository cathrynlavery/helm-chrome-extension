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
    <Card className="w-full backdrop-blur-sm bg-opacity-80 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Today's Targets</span>
          {allTasksCompleted && (
            <span className="text-sm text-green-500 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              All complete!
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editable && (
          <form onSubmit={handleAddTarget} className="flex gap-2 mb-4">
            <Input
              placeholder="What are you focusing on today?"
              value={newTargetText}
              onChange={(e) => setNewTargetText(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={dailyTargets.length >= 3}
              className="bg-primary hover:bg-primary/90"
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
              className="text-center py-6"
            >
              <p className="text-lg font-medium mb-1">{quote.text}</p>
              <p className="text-sm text-muted-foreground">— {quote.author}</p>
            </motion.div>
          ) : (
            <motion.div className="space-y-3">
              {dailyTargets.map((target) => (
                <motion.div 
                  key={target.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: completedTaskId === target.id ? [1, 1.02, 1] : 1,
                    transition: {
                      scale: {
                        duration: 0.3
                      }
                    }
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center p-3 rounded-md transition-all duration-200 relative
                    ${target.completed 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900' 
                      : 'bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'}`
                  }
                >
                  {completedTaskId === target.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0] }}
                      transition={{ duration: 1, times: [0, 0.5, 1] }}
                      className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                    >
                      <div className="text-green-500 text-2xl">✓</div>
                    </motion.div>
                  )}
                  
                  <Checkbox
                    id={`target-${target.id}`}
                    checked={target.completed}
                    onCheckedChange={(checked) => {
                      handleToggleComplete(target.id, checked === true);
                    }}
                    className={`mr-3 transition-all duration-200 ${target.completed ? 'text-green-500' : ''}`}
                  />
                  <label 
                    htmlFor={`target-${target.id}`}
                    className={`flex-1 transition-all duration-300 ${
                      target.completed 
                        ? 'line-through text-green-600 dark:text-green-400 font-medium' 
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
                      className="ml-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}