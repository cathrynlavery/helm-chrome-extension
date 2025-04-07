import React, { useState } from 'react';
import { DailyTarget } from '../lib/chromeStorage';
import { useFocus } from '../contexts/FocusContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';

export function DailyTargets() {
  const { dailyTargets, addTarget, updateTarget, deleteTarget } = useFocus();
  const [newTargetText, setNewTargetText] = useState('');
  
  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTargetText.trim()) {
      addTarget(newTargetText);
      setNewTargetText('');
    }
  };
  
  const handleToggleComplete = (id: number, completed: boolean) => {
    updateTarget(id, { completed });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Today's Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTarget} className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new target..."
            value={newTargetText}
            onChange={(e) => setNewTargetText(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={dailyTargets.length >= 3}>Add</Button>
        </form>
        
        <div className="space-y-3">
          {dailyTargets.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No targets for today. Add up to 3 targets to focus on.
            </p>
          ) : (
            dailyTargets.map((target) => (
              <div 
                key={target.id} 
                className="flex items-center p-3 border rounded-md bg-secondary/30"
              >
                <Checkbox
                  id={`target-${target.id}`}
                  checked={target.completed}
                  onCheckedChange={(checked) => {
                    handleToggleComplete(target.id, checked === true);
                  }}
                  className="mr-3"
                />
                <label 
                  htmlFor={`target-${target.id}`}
                  className={`flex-1 ${target.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {target.text}
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTarget(target.id)}
                  className="ml-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}