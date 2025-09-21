import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home"; 
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import RelaxationFeature from "./pages/Relaxation";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import MoodCheck from "./pages/Mood-Check";
import Community from "./pages/Community";
import SignInSignUpModal from "./pages/SignInSignUp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/SignInSignUp" element={<SignInSignUpModal onClose={() => {}} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/relaxation" element={<RelaxationFeature />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/mood" element={<MoodCheck />} />
          <Route path="/community" element={<Community />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
