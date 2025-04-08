import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import BlockedPage from "@/pages/blocked";
import FocusSession from "@/pages/focus-session";
import { FocusProvider } from "./contexts/FocusContext";
import EmergencyReset from "./components/EmergencyReset";

function Router() {
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
        <EmergencyReset />
      </FocusProvider>
    </QueryClientProvider>
  );
}

export default App;
