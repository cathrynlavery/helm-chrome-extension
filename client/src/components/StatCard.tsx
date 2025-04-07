import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TodayFocusProps {
  title: string;
  goalLabel?: string;
  goal?: number;
  value: number | string;
  progress?: number;
  progressColor?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const StatCard: React.FC<TodayFocusProps> = ({
  title,
  goalLabel = 'Goal',
  goal,
  value,
  progress,
  progressColor = 'bg-status-success',
  subtitle,
  children
}) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          {goal && (
            <span className="text-muted-foreground text-sm">
              {goalLabel}: {goal}h
            </span>
          )}
        </div>
        
        {progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span className="font-medium">{value}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {subtitle && (
          <div className="text-sm text-muted-foreground">
            {subtitle}
          </div>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
};

export default StatCard;
