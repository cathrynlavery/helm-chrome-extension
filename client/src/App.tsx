import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import BlockedPage from "@/pages/blocked";
import FocusSession from "@/pages/focus-session";
import { FocusProvider } from "./contexts/FocusContext";
import EmergencyExit from "./components/EmergencyExit";

// Use useLocation hook from wouter
function Router() {
  // Initialize current location and setter
  const [location, setLocation] = useLocation();
  
  // Use hash-based routing for Chrome extensions
  if (typeof window !== 'undefined') {
    // Make sure navigation uses hash-based URLs
    console.log('Current location:', location);
  }

  return (
    <Switch>
      <Route path="/" component={FocusSession} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/blocked" component={BlockedPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FocusProvider>
        <Router />
        <Toaster />
        <EmergencyExit />
      </FocusProvider>
    </QueryClientProvider>
  );
}

export default App;
