import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import BlockedPage from "@/pages/blocked";
import FocusSession from "@/pages/focus-session";
import SignIn from "@/pages/signin";
import SignUp from "@/pages/signup";
import EmailVerification from "@/pages/email-verification";

import EmergencyExit from "@/components/EmergencyExit";
import { FocusProvider } from "./contexts/FocusContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const Router = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  
  if (!user) {
    return (
      <Switch>
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        <Route path="/email-verification" component={EmailVerification} />
        <Route component={SignIn} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={FocusSession} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/blocked" component={BlockedPage} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/email-verification" component={EmailVerification} />
      <Route component={NotFound} />
    </Switch>
  );
};


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FocusProvider>
          <Router />
          <Toaster />
          <EmergencyExit />
        </FocusProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
