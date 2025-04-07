import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import BlockedPage from "@/pages/blocked";
import { FocusProvider } from "./contexts/FocusContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
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
      </FocusProvider>
    </QueryClientProvider>
  );
}

export default App;
