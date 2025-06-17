import { useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { MarketOverview } from '../components/MarketOverview';
import { WalletsTable } from '../components/WalletsTable';
import { PortfolioChart } from '../components/PortfolioChart';
import { WalletModal } from '../components/WalletModal';

export default function Dashboard() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const handleCreateWallet = () => {
    setIsWalletModalOpen(true);
  };

  const handleImportWallet = () => {
    setIsWalletModalOpen(true);
  };

  const handleViewWallet = (address: string) => {
    // Navigate to wallet detail page (could be implemented later)
    console.log('View wallet:', address);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection 
          onCreateWallet={handleCreateWallet}
          onImportWallet={handleImportWallet}
        />
        
        <MarketOverview />
        
        <WalletsTable 
          onCreateWallet={handleCreateWallet}
          onViewWallet={handleViewWallet}
        />
        
        <div className="mt-8">
          <PortfolioChart />
        </div>
      </div>

      <WalletModal 
        open={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
      />
    </div>
  );
}
