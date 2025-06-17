import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, Plus, Settings } from 'lucide-react';
import { walletApi, portfolioApi } from '../lib/api';
import { formatCurrency, formatAddress, formatDate } from '../types';
import { usePrices } from '../hooks/usePrices';
import { WalletDetailsModal } from './WalletDetailsModal';

interface WalletsTableProps {
  onCreateWallet: () => void;
  onViewWallet: (address: string) => void;
}

export function WalletsTable({ onCreateWallet, onViewWallet }: WalletsTableProps) {
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { data: wallets, isLoading } = useQuery({
    queryKey: ['/api/wallets'],
    queryFn: walletApi.getAll,
  });

  const { prices } = usePrices();

  // Get portfolio data for each wallet
  const portfolioQueries = useQuery({
    queryKey: ['/api/portfolios', wallets?.map((w: any) => w.address)],
    queryFn: async () => {
      if (!wallets || wallets.length === 0) return [];
      
      const portfolios = await Promise.all(
        wallets.map((wallet: any) => portfolioApi.get(wallet.address))
      );
      return portfolios;
    },
    enabled: !!wallets && wallets.length > 0,
  });

  const totalPortfolioValue = portfolioQueries.data?.reduce(
    (sum, portfolio) => sum + (portfolio?.totalValue || 0), 
    0
  ) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Wallets</CardTitle>
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="grid grid-cols-4 gap-6 flex-1 max-w-lg">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-8 w-16" />
                  ))}
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wallets || wallets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Wallets</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Total Portfolio Value:</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(0)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Wallets Yet</h4>
            <p className="text-gray-500 mb-6">
              Create your first wallet to start trading and learning about cryptocurrency.
            </p>
            <Button onClick={onCreateWallet} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Wallets</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Total Portfolio Value:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(totalPortfolioValue)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-200">
          {wallets.map((wallet: any, index: number) => {
            const portfolio = portfolioQueries.data?.[index];
            
            return (
              <div key={wallet.address} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatAddress(wallet.address)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {formatDate(wallet.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-6 flex-1 max-w-lg mx-8">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {portfolio?.balances.BTC.toFixed(8) || '0.00000000'}
                      </div>
                      <div className="text-xs text-gray-500">BTC</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {portfolio?.balances.ETH.toFixed(8) || '0.00000000'}
                      </div>
                      <div className="text-xs text-gray-500">ETH</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {portfolio?.balances.MATIC.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-gray-500">MATIC</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {portfolio?.balances.BNB.toFixed(8) || '0.00000000'}
                      </div>
                      <div className="text-xs text-gray-500">BNB</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(portfolio?.totalValue || 0)}
                    </div>
                    <div className={`text-sm ${
                      (portfolio?.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(portfolio?.pnl || 0) >= 0 ? '+' : ''}
                      {formatCurrency(portfolio?.pnl || 0)} ({(portfolio?.pnlPercentage || 0).toFixed(1)}%)
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4"
                    onClick={() => {
                      setSelectedWallet(wallet);
                      setSelectedPortfolio(portfolio);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <WalletDetailsModal 
        wallet={selectedWallet}
        portfolio={selectedPortfolio}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </Card>
  );
}
