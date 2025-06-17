import { Switch, Route } from "wouter";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { Navigation } from "./components/Navigation";
import { WalletModal } from "./components/WalletModal";
import Dashboard from "./pages/Dashboard";
import Exchange from "./pages/Exchange";
import NotFound from "./pages/not-found";

function Router() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const handleCreateWallet = () => {
    setIsWalletModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onCreateWallet={handleCreateWallet} />
      
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/exchange" component={Exchange} />
        <Route component={NotFound} />
      </Switch>

      <WalletModal 
        open={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
