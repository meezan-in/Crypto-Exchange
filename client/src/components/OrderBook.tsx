import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { marketApi } from '../lib/api';
import { usePrices } from '../hooks/usePrices';
import { formatCurrency, formatTime } from '../types';

interface OrderBookProps {
  symbol: string;
}

export function OrderBook({ symbol }: OrderBookProps) {
  const { data: orderBook } = useQuery({
    queryKey: ['/api/orderbook', symbol],
    queryFn: () => marketApi.getOrderBook(symbol),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { prices } = usePrices();
  const currentPrice = prices?.[symbol as keyof typeof prices] || 0;

  return (
    <div className="space-y-6">
      {/* Order Book */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Order Book</span>
            <Badge variant="outline" className="text-xs">
              {symbol}/INR
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Asks (Sell Orders) */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Asks
            </h4>
            <div className="space-y-1">
              {orderBook?.asks.slice(0, 5).map((ask, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-red-600 font-mono">
                    {formatCurrency(ask.price)}
                  </span>
                  <span className="text-gray-600 font-mono">
                    {ask.amount.toFixed(6)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Price */}
          <div className="bg-gray-100 rounded-lg p-3 text-center mb-4">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(currentPrice)}
            </div>
            <div className="text-sm text-green-600">
              Last Price
            </div>
          </div>

          {/* Bids (Buy Orders) */}
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              Bids
            </h4>
            <div className="space-y-1">
              {orderBook?.bids.slice(0, 5).map((bid, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-green-600 font-mono">
                    {formatCurrency(bid.price)}
                  </span>
                  <span className="text-gray-600 font-mono">
                    {bid.amount.toFixed(6)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Mock recent trades data */}
            {[
              { price: currentPrice * 1.001, amount: 0.023, time: new Date(), type: 'buy' },
              { price: currentPrice * 0.999, amount: 0.156, time: new Date(Date.now() - 60000), type: 'sell' },
              { price: currentPrice * 1.002, amount: 0.089, time: new Date(Date.now() - 120000), type: 'buy' },
              { price: currentPrice * 0.998, amount: 0.234, time: new Date(Date.now() - 180000), type: 'sell' },
              { price: currentPrice * 1.001, amount: 0.067, time: new Date(Date.now() - 240000), type: 'buy' },
          ].map((trade, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className={`font-mono ${
                  trade.type === 'buy' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(trade.price)}
                </span>
                <span className="text-gray-600 font-mono">
                  {trade.amount.toFixed(6)}
                </span>
                <span className="text-gray-400 text-xs">
                  {formatTime(trade.time.toISOString())}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
