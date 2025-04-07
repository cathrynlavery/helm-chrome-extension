import React, { useState, useEffect } from 'react';
import { useFocus } from '../contexts/FocusContext';
import FocusTimer from '../components/FocusTimer';
import ProfilesManager from '../components/ProfilesManager';
import StatCard from '../components/StatCard';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatDuration } from '../lib/focusTimer';
import { Clock, Settings, User } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    dailyIntention, 
    setDailyIntention, 
    stats,
    isLoading
  } = useFocus();
  
  const [intention, setIntention] = useState(dailyIntention);
  
  // Update local state when context changes
  useEffect(() => {
    setIntention(dailyIntention);
  }, [dailyIntention]);
  
  const handleIntentionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntention(e.target.value);
  };
  
  const handleIntentionBlur = () => {
    if (intention !== dailyIntention) {
      setDailyIntention(intention);
    }
  };
  
  const handleIntentionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setDailyIntention(intention);
    }
  };
  
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
  
  const greeting = getGreeting();
  const todayFocusTime = formatDuration(stats.todayMinutes);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-border bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-2xl font-semibold">Helm</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-muted-foreground hover:text-primary focus:outline-none">
              <Settings className="h-6 w-6" />
            </button>
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Greeting and intention */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">{greeting}</h2>
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <h3 className="text-muted-foreground mr-2">Today's intention:</h3>
                <div className="relative flex-grow max-w-lg">
                  <Input
                    type="text"
                    className="w-full py-2 px-3 border-b border-neutral-border bg-transparent focus:outline-none focus:border-primary text-center"
                    placeholder="What do you want to focus on today?"
                    value={intention}
                    onChange={handleIntentionChange}
                    onBlur={handleIntentionBlur}
                    onKeyDown={handleIntentionKeyDown}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Focus timer */}
          <div className="mb-8">
            <FocusTimer />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Today's Focus */}
            <StatCard
              title="Today's Focus"
              goalLabel="Goal"
              goal={stats.todayGoal / 60}
              value={todayFocusTime}
              progress={stats.todayPercentage}
              subtitle={`${stats.todayPercentage}% of your daily goal completed`}
            />

            {/* Weekly Focus */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Weekly Focus</h3>
                  <span className="text-muted-foreground text-sm">
                    Goal: {(stats.todayGoal * 7) / 60}h
                  </span>
                </div>
                <div className="flex justify-between mb-3 text-sm">
                  {stats.weeklyData.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="h-24 w-6 bg-neutral-bg rounded-t-sm relative">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm" 
                          style={{ height: `${Math.min((day.minutes / 240) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="mt-1">{day.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Streaks */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-1">Focus Streaks</h3>
                  <p className="text-sm text-muted-foreground">You're on a roll!</p>
                </div>
                <div className="flex items-end">
                  <div className="mr-4">
                    <div className="text-4xl font-semibold text-primary">{stats.streaks.current}</div>
                    <div className="text-sm text-muted-foreground">days current streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-medium">{stats.streaks.best}</div>
                    <div className="text-sm text-muted-foreground">days best streak</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-3 w-3 rounded-full ${
                        i < stats.streaks.current ? 
                          `bg-primary opacity-${90 - (i * 10)}` : 
                          'bg-neutral-border'
                      }`}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profiles Manager */}
          <ProfilesManager />
        </div>
      </main>
    </div>
  );
};

// Helper to get appropriate greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  
  if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon';
  } else if (hour >= 18) {
    greeting = 'Good evening';
  }
  
  return greeting;
}

export default Dashboard;
