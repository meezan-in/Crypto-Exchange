import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { usePrices } from '../hooks/usePrices';
import { formatCurrency, cryptoData } from '../types';

export function MarketOverview() {
  const { prices, isLoading } = usePrices();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!prices) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Unable to load market data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const marketData = [
    {
      symbol: 'BTC',
      price: prices.BTC,
      change: 2.4, // Mock percentage change
    },
    {
      symbol: 'ETH', 
      price: prices.ETH,
      change: 1.8,
    },
    {
      symbol: 'MATIC',
      price: prices.MATIC,
      change: -0.5,
    },
    {
      symbol: 'BNB',
      price: prices.BNB,
      change: 3.1,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {marketData.map((crypto) => {
        const cryptoInfo = cryptoData[crypto.symbol as keyof typeof cryptoData];
        const isPositive = crypto.change > 0;
        
        return (
          <Card key={crypto.symbol} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-${cryptoInfo.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">
                      {cryptoInfo.icon}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">{cryptoInfo.name}</span>
                </div>
                <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {isPositive ? '+' : ''}{crypto.change}%
                </Badge>
              </div>
              
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(crypto.price)}
              </div>
              
              <div className="text-sm text-gray-500">
                {crypto.symbol}/INR
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
