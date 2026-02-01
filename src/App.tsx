import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import Tasks from "@/pages/Tasks";
import Sprints from "@/pages/Sprints";
import Teams from "@/pages/Teams";
import Time from "@/pages/Time";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* App routes with layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:id" element={<Tasks />} />
            <Route path="/sprints" element={<Sprints />} />
            <Route path="/team" element={<Teams />} />
            <Route path="/time" element={<Time />} />
            <Route path="/docs" element={<ComingSoon title="Docs & Wiki" />} />
            <Route path="/messages" element={<ComingSoon title="Messages" />} />
            <Route path="/notifications" element={<ComingSoon title="Notifications" />} />
            <Route path="/automations" element={<ComingSoon title="Automations" />} />
            <Route path="/reports" element={<ComingSoon title="Reports" />} />
            <Route path="/settings" element={<ComingSoon title="Settings" />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Placeholder for modules not yet implemented
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl orbit-gradient flex items-center justify-center mb-4">
        <span className="text-2xl">🚀</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md">
        This module is coming soon. We're working hard to bring you the best project management experience.
      </p>
    </div>
  );
}

export default App;
