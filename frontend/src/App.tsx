import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TrialDetail from "./pages/TrialDetail";
import PhaseAnalyticsPage from "./pages/PhaseAnalyticsPage";
import CountryAnalyticsPage from "./pages/CountryAnalyticsPage";
import StatusAnalyticsPage from "./pages/StatusAnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/trial/:nctId" element={<TrialDetail />} />
          <Route path="/phase-analytics" element={<PhaseAnalyticsPage />} />
          <Route path="/country-analytics" element={<CountryAnalyticsPage />} />
          <Route path="/status-analytics" element={<StatusAnalyticsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
