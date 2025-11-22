import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { loadProfile } from "@/lib/storage";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Today from "./pages/Today";
import Recovery from "./pages/Recovery";
import Timeline from "./pages/Timeline";
import Insights from "./pages/Insights";
import Coach from "./pages/Coach";
import Simulate from "./pages/Simulate";
import Social from "./pages/Social";
import Install from "./pages/Install";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function IndexRedirect() {
  const profile = loadProfile();
  return profile.onboardingComplete ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/simulate" element={<Simulate />} />
          <Route path="/social" element={<Social />} />
          <Route path="/install" element={<Install />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
