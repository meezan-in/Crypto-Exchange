import { Button } from '@/components/ui/button';
import { Wallet, Download } from 'lucide-react';

interface HeroSectionProps {
  onCreateWallet: () => void;
  onImportWallet: () => void;
}

export function HeroSection({ onCreateWallet, onImportWallet }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-100">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Crypto Wallet & Exchange
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Secure cryptocurrency wallet and trading platform with real-time market data.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onCreateWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition-colors flex items-center justify-center"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Create New Wallet
          </Button>
          <Button 
            onClick={onImportWallet}
            variant="outline"
            className="border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 font-medium transition-colors flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Import Existing Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
