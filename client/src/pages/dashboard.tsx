import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useFocus } from '../contexts/FocusContext';
import ProfilesManager from '../components/ProfilesManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDuration } from '../lib/focusTimer';
import { ArrowLeft, ArrowRight, Flame, Target, Clock, Calendar, Pencil, Check, CheckCircle } from 'lucide-react';
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
  const [, navigate] = useLocation();
  
  // Return to focus handler
  const handleReturnToFocus = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('🔍 Return to Focus button clicked');
    // Use wouter navigate for consistent routing
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfcfc] dark:bg-gray-900">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-medium mb-2">Loading...</h2>
            <p className="text-muted-foreground">Setting up your focus environment</p>
          </motion.div>
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
      {/* Top navigation with return button */}
      <div className="fixed top-5 right-5 z-10">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReturnToFocus}
          className="flex items-center bg-transparent border border-[#CDAA7A]/40 text-[#333333] dark:text-[#E0E0E0] hover:bg-[#CDAA7A]/10 transition-all duration-300 z-20 relative shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Focus
        </Button>
      </div>

      {/* Main content with better spacing and visual groups */}
      <main className="flex-grow pt-10 pb-8">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          {/* Helm Logo - larger and more prominent */}
          <motion.div 
            className="flex items-center mb-12 mt-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <HelmLogo 
              size={36} 
              className={`text-[#333333] transition-colors duration-300`}
            />
            <span className="ml-3 text-[#1A1A1A] ibm-plex-mono-medium text-xl dark:text-[#E0E0E0]">
              Helm
            </span>
          </motion.div>
          
          {/* VISUAL GROUP 1: Hero Section - Greeting + Button */}
          <motion.div 
            className="mb-14"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Greeting with enhanced styling and animation */}
            <div className="text-center mb-8">
              <h2 className="text-3xl libre-baskerville-bold mb-3 text-[#333333] dark:text-[#E0E0E0]">
                Good {timeOfDay}
              </h2>
              <motion.p 
                className="text-sm ibm-plex-mono-regular text-[#333333]/70 dark:text-[#E0E0E0]/70 relative inline-block"
                whileHover={{ scale: 1.02 }}
              >
                {formattedDate}
                <motion.span 
                  className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#CDAA7A]/50 to-transparent"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </motion.p>
            </div>

            {/* Quick Start Button - with premium styling */}
            <div className="flex justify-center mb-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('🔍 Start Focus Session button clicked');
                    navigate('/');
                  }}
                  className="bg-gradient-to-r from-[#CDAA7A] to-[#E4CA8C] hover:from-[#D4AF37] hover:to-[#CDAA7A] text-[#333333] ibm-plex-mono-medium px-6 py-3.5 text-base transition-all duration-300 rounded-[16px] shadow-md hover:shadow-lg group"
                >
                  <Target className="h-5 w-5 mr-2.5 group-hover:rotate-12 transition-transform duration-300" />
                  Start Focus Session
                  <ArrowRight className="h-5 w-5 ml-2.5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* VISUAL GROUP 2: Stats Cards with enhanced styling */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 mx-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Card 1: Today's Focus */}
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }}>
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-zinc-900/40 border border-[#CDAA7A]/20 shadow-sm hover:shadow-md hover:border-[#CDAA7A]/40 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-1.5 pt-5 px-5">
                  <CardTitle className="flex items-center gap-2 ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A] text-[15px]">
                    <Clock className="h-4.5 w-4.5 text-[#CDAA7A]" />
                    Today's Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-semibold text-[#333333] dark:text-[#E0E0E0]">
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
                              className="w-16 h-7 mr-1 px-2 text-sm text-[#333333] dark:text-[#E0E0E0] bg-transparent border-[#CDAA7A]/40"
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
                  {/* Progress bar with premium gradient */}
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#CDAA7A] to-[#E4CA8C] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.todayPercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    ></motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2: Weekly Activity */}
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }}>
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-zinc-900/40 border border-[#CDAA7A]/20 shadow-sm hover:shadow-md hover:border-[#CDAA7A]/40 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-1.5 pt-5 px-5">
                  <CardTitle className="flex items-center gap-2 ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A] text-[15px]">
                    <Calendar className="h-4.5 w-4.5 text-[#CDAA7A]" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex justify-between items-end mb-1 h-32 text-sm">
                    {stats.weeklyData.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="h-24 w-8 bg-gray-100 dark:bg-gray-700 rounded-md relative mb-1">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.min((day.minutes / 240) * 100, 100)}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 + 0.4 }}
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#CDAA7A] to-[#E4CA8C]/80 rounded-md"
                            whileHover={{ opacity: 0.85 }}
                          ></motion.div>
                        </div>
                        <span className="text-xs ibm-plex-mono-regular text-[#333333]/70 dark:text-[#E0E0E0]/70">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3: Streaks */}
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.3 }}>
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-zinc-900/40 border border-[#CDAA7A]/20 shadow-sm hover:shadow-md hover:border-[#CDAA7A]/40 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-1.5 pt-5 px-5">
                  <CardTitle className="flex items-center gap-2 ibm-plex-mono-medium text-[#333333] dark:text-[#CDAA7A] text-[15px]">
                    <Flame className="h-4.5 w-4.5 text-[#CDAA7A]" />
                    Focus Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex items-end mb-4">
                    <div className="mr-8">
                      <div className="flex items-center">
                        <span className="text-4xl font-bold text-[#CDAA7A] mr-2">{stats.streaks.current}</span>
                        <Flame className="h-6 w-6 text-[#CDAA7A]" />
                      </div>
                      <div className="text-xs text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular">current streak</div>
                    </div>
                    <div>
                      <div className="text-2xl font-medium text-[#333333] dark:text-[#E0E0E0]">{stats.streaks.best}</div>
                      <div className="text-xs text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular">best streak</div>
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
                        transition={{ duration: 0.2, delay: i * 0.1 + 0.5 }}
                        className={`h-3 w-full rounded-md ${
                          i < stats.streaks.current ? 
                            `bg-gradient-to-r from-[#CDAA7A] to-[#E4CA8C] opacity-${100 - (i * 10)}` : 
                            'bg-gray-200 dark:bg-gray-700'
                        }`}
                      ></motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Divider with subtle glow */}
          <motion.div 
            className="relative w-full max-w-4xl mx-auto h-px bg-[#CDAA7A]/10 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="absolute inset-0 blur-sm bg-[#CDAA7A]/20"></div>
          </motion.div>

          {/* VISUAL GROUP 3: Focus Profiles section with clear heading */}
          <motion.div 
            className="mb-16 px-2" 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="mb-6 text-center">
              <h3 className="text-xl libre-baskerville-bold text-[#333333] dark:text-[#CDAA7A]">
                Focus Profiles
              </h3>
              <p className="text-sm text-[#333333]/70 dark:text-[#E0E0E0]/70 ibm-plex-mono-regular mt-1 max-w-lg mx-auto">
                Manage your custom focus environments for different activities
              </p>
            </div>
            
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-zinc-900/40 border border-[#CDAA7A]/20 shadow-sm hover:shadow-md transition-all duration-300 p-1">
              <CardContent className="p-5">
                <ProfilesManager />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      {/* Enhanced footer with BestSelf branding */}
      <footer className="py-5 flex flex-col justify-center items-center">
        <div className="text-xs text-center text-[#333333]/40 dark:text-[#E0E0E0]/40 mb-2 ibm-plex-mono-regular">
          Helm by BestSelf.co
        </div>
        <BestSelfLogo className="mt-1" />
      </footer>
    </div>
  );
};

export default Dashboard;
