import React, { useState } from 'react';
import { useFocus } from '../contexts/FocusContext';
import FocusTimer from '../components/FocusTimer';
import { DailyTargets } from '../components/DailyTargets';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Clock, BarChart2 } from 'lucide-react';

const FocusSession: React.FC = () => {
  const { activeProfile, dailyIntention, isLoading } = useFocus();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading...</h2>
          <p className="text-muted-foreground">Setting up your focus environment</p>
        </div>
      </div>
    );
  }
  
  // Background gradient styles
  const backgroundStyle = {
    backgroundImage: 'linear-gradient(to right bottom, rgba(0, 120, 212, 0.05), rgba(0, 0, 0, 0.05))',
    backgroundSize: 'cover',
  };
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={backgroundStyle}
    >
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="ml-2 text-xl font-medium">Helm</h1>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            View Dashboard
          </Button>
        </Link>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="max-w-xl mx-auto w-full text-center mb-8">
          {activeProfile && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                {activeProfile.name}
              </span>
            </div>
          )}
          
          {dailyIntention && (
            <h2 className="text-xl font-medium mb-6">
              "{dailyIntention}"
            </h2>
          )}
          
          <div className="mb-12">
            <FocusTimer />
          </div>
          
          <DailyTargets />
        </div>
      </main>
    </div>
  );
};

export default FocusSession;