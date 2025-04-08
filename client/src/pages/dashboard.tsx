import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useFocus } from '../contexts/FocusContext';
import FocusTimer from '../components/FocusTimer';
import ProfilesManager from '../components/ProfilesManager';
import StatCard from '../components/StatCard';
import { DailyTargets } from '../components/DailyTargets';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '../lib/focusTimer';
import { Settings, Timer, Flame, ArrowLeft } from 'lucide-react';
import HelmLogo from '../components/HelmLogo';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { 
    dailyIntention, 
    setDailyIntention, 
    stats,
    isLoading,
    focusTimer
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/50 dark:bg-black/20 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <HelmLogo size={30} />
            <h1 className="ml-2 text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Helm Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Focus
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Greeting and intention */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">{greeting}</h2>
              <div className="max-w-xl mx-auto">
                <div className="mb-4">
                  <h3 className="text-base text-muted-foreground mb-2">What are you focusing on today?</h3>
                  <div className="relative flex-grow max-w-lg mx-auto">
                    <Input
                      type="text"
                      className="w-full py-2 px-3 bg-transparent border-b border-neutral-border focus:outline-none focus:border-primary text-center text-lg"
                      placeholder="Enter your daily intention..."
                      value={intention}
                      onChange={handleIntentionChange}
                      onBlur={handleIntentionBlur}
                      onKeyDown={handleIntentionKeyDown}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Today's Focus */}
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-black/20 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    <span>Today's Focus</span>
                    <span className="text-primary text-sm font-normal">
                      Goal: {stats.todayGoal / 60}h
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-semibold">
                      {todayFocusTime}
                    </span>
                    <span className="text-lg">
                      {stats.todayPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${stats.todayPercentage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Focus */}
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-black/20 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    <span>Weekly Activity</span>
                    <span className="text-primary text-sm font-normal">
                      Goal: {(stats.todayGoal * 7) / 60}h
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-1 h-40 text-sm">
                    {stats.weeklyData.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="h-32 w-8 bg-gray-100 dark:bg-gray-700 rounded-md relative mb-1">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.min((day.minutes / 240) * 100, 100)}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="absolute bottom-0 left-0 right-0 bg-primary rounded-md" 
                          ></motion.div>
                        </div>
                        <span className="text-sm">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Streaks */}
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-black/20 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Focus Streaks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end mb-4">
                    <div className="mr-6">
                      <div className="flex items-center">
                        <span className="text-4xl font-bold text-amber-500 mr-2">{stats.streaks.current}</span>
                        <Flame className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="text-sm text-muted-foreground">current streak</div>
                    </div>
                    <div>
                      <div className="text-2xl font-medium">{stats.streaks.best}</div>
                      <div className="text-sm text-muted-foreground">best streak</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-4">
                    {[...Array(7)].map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                        }}
                        transition={{ duration: 0.2, delay: i * 0.1 }}
                        className={`h-4 w-full rounded-md ${
                          i < stats.streaks.current ? 
                            `bg-amber-500 opacity-${100 - (i * 10)}` : 
                            'bg-gray-200 dark:bg-gray-700'
                        }`}
                      ></motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Focus Timer */}
            <div className="mb-8 max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-4 text-center">Quick Focus</h3>
              <FocusTimer 
                compact={true} 
                streakCount={stats.streaks.current}
              />
            </div>

            {/* Content sections in a two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Daily Targets */}
              <div>
                <h3 className="text-lg font-medium mb-4">Today's Targets</h3>
                <DailyTargets />
              </div>

              {/* Profiles Manager */}
              <div>
                <h3 className="text-lg font-medium mb-4">Focus Profiles</h3>
                <ProfilesManager />
              </div>
            </div>
          </motion.div>
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
