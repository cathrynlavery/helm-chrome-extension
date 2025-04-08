import React from 'react';
import { Link } from 'wouter';
import { useFocus } from '../contexts/FocusContext';
import ProfilesManager from '../components/ProfilesManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDuration } from '../lib/focusTimer';
import { ArrowLeft, ArrowRight, Flame, Target, Clock, Calendar } from 'lucide-react';
import HelmLogo from '../components/HelmLogo';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { 
    stats,
    isLoading
  } = useFocus();
  
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
      {/* Header - Simplified */}
      <header className="backdrop-blur-sm bg-white/50 dark:bg-black/20 border-b border-[#CDAA7A]/30 dark:border-[#CDAA7A]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <HelmLogo size={30} className="text-[#CDAA7A]" />
            <h1 className="ml-3 text-xl ibm-plex-mono-medium text-[#333333] dark:text-[#E0E0E0]">
              Mission Control
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center bg-transparent border border-[#CDAA7A]/30 text-[#333333] dark:text-[#E0E0E0] hover:bg-[#CDAA7A]/10 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Focus
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content - Cleaned up */}
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Simple greeting with welcome text */}
            <div className="mb-10 text-center">
              <h2 className="text-3xl libre-baskerville-bold mb-3 text-[#333333] dark:text-[#E0E0E0]">{greeting}</h2>
              <p className="text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular max-w-xl mx-auto">
                View your focus metrics and manage your profiles. Return to the focus session when you're ready to start working.
              </p>
            </div>

            {/* Stats Cards - Enhanced with better spacing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
              {/* Today's Focus */}
              <Card className="backdrop-blur-sm bg-transparent border border-[#CDAA7A]/20 shadow-none hover:border-[#CDAA7A]/30 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A]">
                    <Clock className="h-5 w-5 text-[#CDAA7A]" />
                    Today's Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-semibold text-[#333333] dark:text-[#E0E0E0]">
                      {todayFocusTime}
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-[#333333]/70 dark:text-[#E0E0E0]/70">Goal: {stats.todayGoal / 60}h</div>
                      <div className="text-xl text-[#CDAA7A] font-medium">
                        {stats.todayPercentage}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#CDAA7A] rounded-full"
                      style={{ width: `${stats.todayPercentage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Activity */}
              <Card className="backdrop-blur-sm bg-transparent border border-[#CDAA7A]/20 shadow-none hover:border-[#CDAA7A]/30 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A]">
                    <Calendar className="h-5 w-5 text-[#CDAA7A]" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-1 h-36 text-sm">
                    {stats.weeklyData.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="h-28 w-10 bg-gray-100 dark:bg-gray-700 rounded-md relative mb-1">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.min((day.minutes / 240) * 100, 100)}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="absolute bottom-0 left-0 right-0 bg-[#CDAA7A] rounded-md" 
                          ></motion.div>
                        </div>
                        <span className="text-sm ibm-plex-mono-regular text-[#333333]/70 dark:text-[#E0E0E0]/70">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Streaks */}
              <Card className="backdrop-blur-sm bg-transparent border border-[#CDAA7A]/20 shadow-none hover:border-[#CDAA7A]/30 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A]">
                    <Flame className="h-5 w-5 text-[#CDAA7A]" />
                    Focus Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end mb-6">
                    <div className="mr-8">
                      <div className="flex items-center">
                        <span className="text-5xl font-bold text-[#CDAA7A] mr-2">{stats.streaks.current}</span>
                        <Flame className="h-6 w-6 text-[#CDAA7A]" />
                      </div>
                      <div className="text-sm text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular">current streak</div>
                    </div>
                    <div>
                      <div className="text-3xl font-medium text-[#333333] dark:text-[#E0E0E0]">{stats.streaks.best}</div>
                      <div className="text-sm text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular">best streak</div>
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
                            `bg-[#CDAA7A] opacity-${100 - (i * 10)}` : 
                            'bg-gray-200 dark:bg-gray-700'
                        }`}
                      ></motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Start Button */}
            <div className="flex justify-center mb-14">
              <Link href="/">
                <Button 
                  className="bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] ibm-plex-mono-medium px-6 py-6 text-base hover:scale-[1.02] transition-all duration-300 rounded-[16px] shadow-md"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Start Focus Session
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Profiles Manager - Single column full width */}
            <div className="mb-10">
              <Card className="backdrop-blur-sm bg-transparent border border-[#CDAA7A]/20 shadow-none hover:border-[#CDAA7A]/30 transition-all duration-300">
                <CardHeader>
                  <CardDescription className="text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular">
                    Manage your focus profiles to customize your experience for different activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfilesManager />
                </CardContent>
              </Card>
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
