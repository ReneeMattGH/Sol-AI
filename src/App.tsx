import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollHeader from "./components/Layout/ScrollHeader";
import MarketTicker from "./components/Layout/MarketTicker";
import Index from "./pages/Index";
import Predictions from "./pages/Predictions";
import Agent from "./pages/Agent";
import Portfolio from "./pages/Portfolio";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollHeader />
        <div className="pt-20">
          <MarketTicker />
        </div>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
export default App;