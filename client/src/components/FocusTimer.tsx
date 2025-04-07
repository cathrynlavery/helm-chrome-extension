import React from 'react';
import { useFocus } from '../contexts/FocusContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Pause, Play, RefreshCw } from 'lucide-react';
import ProfileSelector from './ProfileSelector';

const FocusTimer: React.FC = () => {
  const { focusTimer, activeProfile } = useFocus();
  const { state, start, pause, reset } = focusTimer;
  
  const handleStartPause = async () => {
    if (!activeProfile) return;
    
    if (state.isRunning) {
      pause();
    } else {
      await start(activeProfile.id);
    }
  };
  
  const handleReset = () => {
    reset();
  };
  
  // Calculate the stroke-dashoffset for the progress circle
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference * (1 - state.progress);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Focus Session</h3>
          <ProfileSelector />
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                className="text-neutral-border" 
                strokeWidth="4" 
                stroke="currentColor" 
                fill="transparent" 
                r="46" 
                cx="50" 
                cy="50"
              />
              <circle 
                className="text-primary" 
                strokeWidth="4" 
                stroke="currentColor" 
                fill="transparent" 
                r="46" 
                cx="50" 
                cy="50" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-2xl font-semibold">{focusTimer.formattedTime}</div>
              <div className="text-sm text-muted-foreground">remaining</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!activeProfile}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          
          <Button
            size="sm"
            onClick={handleStartPause}
            disabled={!activeProfile}
            className="py-2 px-6"
          >
            {state.isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-1" />
                Start
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FocusTimer;
