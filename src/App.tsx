import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import AuthPage from "./pages/AuthPage.tsx";
import Index from "./pages/Index.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import HomePage from "./pages/HomePage.tsx";
import CheckIn from "./pages/CheckIn.tsx";
import WeekPage from "./pages/WeekPage.tsx";
import TogetherPage from "./pages/TogetherPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import NutritionPage from "./pages/NutritionPage.tsx";
import WeeklyCheckIn from "./pages/WeeklyCheckIn.tsx";
import ProgressPage from "./pages/ProgressPage.tsx";
import HealthPage from "./pages/HealthPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/week" element={<WeekPage />} />
            <Route path="/together" element={<TogetherPage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/weekly-checkin" element={<WeeklyCheckIn />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
