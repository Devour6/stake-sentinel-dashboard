
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
import { Button } from "@/components/ui/button";

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
        
        {/* Global stake button - fixed position */}
        <div className="fixed bottom-4 right-4 z-50 md:top-4 md:bottom-auto">
          <Button 
            variant="outline" 
            className="border-gojira-red text-gojira-red hover:bg-gojira-red/10 shadow-lg"
            onClick={() => setIsStakeModalOpen(true)}
          >
            Stake to Gojira Validator
          </Button>
        </div>
        
        <StakeModal isOpen={isStakeModalOpen} setIsOpen={setIsStakeModalOpen} />
        
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
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
