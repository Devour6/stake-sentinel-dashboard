
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import ValidatorDashboard from "./pages/ValidatorDashboard";
import NotFound from "./pages/NotFound";
import StakeModal from "./components/StakeModal";

// Set the document title
document.title = "NodeScan - Solana Validator Monitor";

const queryClient = new QueryClient();

const App = () => {
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <StakeModal isOpen={isStakeModalOpen} setIsOpen={setIsStakeModalOpen} />
        
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home setIsStakeModalOpen={setIsStakeModalOpen} />} />
            <Route path="/validator/:votePubkey" element={<ValidatorDashboard />} />
            {/* Redirect from the old index path to the new home */}
            <Route path="/index" element={<Navigate to="/" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
