import React, { useState } from 'react';
import { Link } from 'wouter';
import { useFocus } from '../contexts/FocusContext';
import ProfilesManager from '../components/ProfilesManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDuration } from '../lib/focusTimer';
import { ArrowLeft, ArrowRight, Flame, Target, Clock, Calendar, Pencil, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import BestSelfLogo from '../components/BestSelfLogo';
import HelmLogo from '../components/HelmLogo';

const Dashboard: React.FC = () => {
  const { 
    stats,
    isLoading,
    setFocusGoal
  } = useFocus();
  
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalHours, setGoalHours] = useState((stats?.todayGoal / 60).toString());
  
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
  
  const todayFocusTime = formatDuration(stats.todayMinutes);
  
  // Get personalized greeting based on time of day
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 18) {
    timeOfDay = 'afternoon';
  } else if (hour >= 18) {
    timeOfDay = 'evening';
  }
  
  // Format current date nicely
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  };
  const formattedDate = now.toLocaleDateString(undefined, options);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfc] dark:bg-gray-900">
      {/* Clean layout without header */}
      <div className="absolute top-4 right-4 z-10">
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

      {/* Main content - Cleaned up */}
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Helm Logo aligned with main content */}
          <div className="flex items-center mb-8 pl-1">
            <HelmLogo 
              size={28} 
              className={`text-[#333333] transition-colors duration-300`}
            />
            <span className="ml-3 text-[#1A1A1A] ibm-plex-mono-medium text-lg dark:text-[#E0E0E0]">
              Helm
            </span>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Just the greeting - removed redundant text */}
            <div className="mb-14 text-center mt-8">
              <h2 className="text-3xl libre-baskerville-bold mb-2 text-[#333333] dark:text-[#E0E0E0]">
                Good {timeOfDay}
              </h2>
              <p className="text-sm ibm-plex-mono-regular text-[#333333]/60 dark:text-[#E0E0E0]/60 mb-3">
                {formattedDate}
              </p>
            </div>

            {/* Quick Start Button - with more spacing (40px) below greeting */}
            <div className="flex justify-center mb-16 mt-10"> {/* Increased vertical spacing to 40px */}
              <Link href="/">
                <Button 
                  className="bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] ibm-plex-mono-medium px-6 py-3.5 text-base hover:scale-[1.02] transition-all duration-300 rounded-[16px] shadow-md"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Start Focus Session
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats Cards - Added mt-8 for 32px spacing above metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-18 mt-8"> {/* Added mt-8 for spacing */}
              {/* Today's Focus */}
              <Card className="backdrop-blur-sm bg-transparent border border-[#CDAA7A]/20 shadow-none hover:border-[#CDAA7A]/30 transition-all duration-300">
                <CardHeader className="pb-2 p-6"> {/* Added p-6 for 24px padding */}
                  <CardTitle className="flex items-center gap-2 ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A]">
                    <Clock className="h-5 w-5 text-[#CDAA7A]" />
                    Today's Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6"> {/* Added px-6 pb-6 for 24px padding */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-semibold text-[#333333] dark:text-[#E0E0E0]">
                      {todayFocusTime}
                    </span>
                    <div className="text-right">
                      <div className="text-sm text-[#333333]/70 dark:text-[#E0E0E0]/70 flex items-center justify-end">
                        {editingGoal ? (
                          <div className="flex items-center">
                            <Input
                              type="number"
                              min="0.5"
                              max="12"
                              step="0.5"
                              value={goalHours}
                              onChange={(e) => setGoalHours(e.target.value)}
                              className="w-16 h-7 mr-1 px-2 text-sm text-[#333333] dark:text-[#E0E0E0] bg-transparent border-[#CDAA7A]/30"
                            />
                            <span className="mr-2">h</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-[#CDAA7A] hover:text-[#CDAA7A]/80 hover:bg-transparent"
                              onClick={() => {
                                const hours = parseFloat(goalHours);
                                if (!isNaN(hours) && hours >= 0.5 && hours <= 12) {
                                  const minutes = Math.round(hours * 60);
                                  setFocusGoal(minutes);
                                  setEditingGoal(false);
                                }
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            Goal: {stats.todayGoal / 60}h
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 ml-1 text-[#333333]/60 dark:text-[#E0E0E0]/60 hover:text-[#CDAA7A] hover:bg-transparent"
                              onClick={() => setEditingGoal(true)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
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
                <CardHeader className="pb-2 p-6"> {/* Added p-6 for 24px padding */}
                  <CardTitle className="flex items-center gap-2 ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A]">
                    <Calendar className="h-5 w-5 text-[#CDAA7A]" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6"> {/* Added px-6 pb-6 for 24px padding */}
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
                <CardHeader className="pb-2 p-6"> {/* Added p-6 for 24px padding */}
                  <CardTitle className="flex items-center gap-2 ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A]">
                    <Flame className="h-5 w-5 text-[#CDAA7A]" />
                    Focus Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6"> {/* Added px-6 pb-6 for 24px padding */}
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

            {/* Light divider for visual separation */}
            <div className="w-full max-w-4xl mx-auto h-px bg-[#CDAA7A]/10 mb-20"></div>

            {/* Profiles Manager - Single column full width */}
            <div className="mb-24"> {/* Increased margin for more spacing */}
              <Card className="backdrop-blur-sm bg-transparent border border-[#CDAA7A]/20 shadow-none hover:border-[#CDAA7A]/30 transition-all duration-300">
                <CardHeader className="p-6"> {/* Added p-6 for 24px padding */}
                  <CardDescription className="text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular">
                    Manage your focus profiles to customize your experience for different activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6"> {/* Added p-6 for 24px padding */}
                  <ProfilesManager />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* BestSelf footer with proper linking */}
      <footer className="py-6 flex justify-center items-center">
        <BestSelfLogo />
      </footer>
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
