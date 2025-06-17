import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { walletApi, tradingApi, portfolioApi } from '../lib/api';
import { usePrices } from '../hooks/usePrices';
import { formatCurrency, cryptoData, CryptoSymbol } from '../types';
import { useToast } from '@/hooks/use-toast';

export function TradingInterface() {
  const [selectedSymbol, setSelectedSymbol] = useState<CryptoSymbol>('BTC');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [includeTds, setIncludeTds] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { prices } = usePrices();

  const { data: wallets } = useQuery({
    queryKey: ['/api/wallets'],
    queryFn: walletApi.getAll,
  });

  const { data: portfolio } = useQuery({
    queryKey: ['/api/portfolio', selectedWallet],
    queryFn: () => portfolioApi.get(selectedWallet),
    enabled: !!selectedWallet,
  });

  const buyMutation = useMutation({
    mutationFn: (data: { addr: string; symbol: string; inrAmount: number }) =>
      tradingApi.buy(data, includeTds),
    onSuccess: () => {
      toast({
        title: 'Buy Order Successful',
        description: `Successfully bought ${selectedSymbol}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      setAmount('');
    },
    onError: (error: any) => {
      toast({
        title: 'Buy Order Failed',
        description: error.message || 'Failed to execute buy order',
        variant: 'destructive',
      });
    },
  });

  const sellMutation = useMutation({
    mutationFn: (data: { addr: string; symbol: string; cryptoAmount: number }) =>
      tradingApi.sell(data, includeTds),
    onSuccess: () => {
      toast({
        title: 'Sell Order Successful',
        description: `Successfully sold ${selectedSymbol}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      setAmount('');
    },
    onError: (error: any) => {
      toast({
        title: 'Sell Order Failed',
        description: error.message || 'Failed to execute sell order',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWallet || !amount || !prices) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'buy') {
      buyMutation.mutate({
        addr: selectedWallet,
        symbol: selectedSymbol,
        inrAmount: numericAmount,
      });
    } else {
      sellMutation.mutate({
        addr: selectedWallet,
        symbol: selectedSymbol,
        cryptoAmount: numericAmount,
      });
    }
  };

  const calculateOrderDetails = () => {
    if (!amount || !prices) return null;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return null;

    const price = prices[selectedSymbol];
    const fee = numericAmount * 0.001; // 0.1%
    const tds = includeTds ? numericAmount * 0.01 : 0; // 1%

    if (orderType === 'buy') {
      const cryptoAmount = numericAmount / price;
      const totalCost = numericAmount + fee + tds;
      
      return {
        cryptoAmount,
        fee,
        tds,
        total: totalCost,
        available: portfolio?.balances.INR || 0,
      };
    } else {
      const inrReceived = numericAmount * price;
      const netReceived = inrReceived - (inrReceived * 0.001) - (includeTds ? inrReceived * 0.01 : 0);
      
      return {
        inrReceived,
        fee: inrReceived * 0.001,
        tds: includeTds ? inrReceived * 0.01 : 0,
        total: netReceived,
        available: portfolio?.balances[selectedSymbol] || 0,
      };
    }
  };

  const orderDetails = calculateOrderDetails();

  const marketData = prices ? [
    { symbol: 'BTC', price: prices.BTC, change: 2.4 },
    { symbol: 'ETH', price: prices.ETH, change: 1.8 },
    { symbol: 'MATIC', price: prices.MATIC, change: -0.5 },
    { symbol: 'BNB', price: prices.BNB, change: 3.1 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Market Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Market</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Updated</span>
              <span className="text-sm text-green-600 font-medium">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketData.map((crypto) => {
              const cryptoInfo = cryptoData[crypto.symbol as CryptoSymbol];
              const isSelected = selectedSymbol === crypto.symbol;
              const isPositive = crypto.change > 0;
              
              return (
                <button
                  key={crypto.symbol}
                  onClick={() => setSelectedSymbol(crypto.symbol as CryptoSymbol)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 bg-${cryptoInfo.color} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {cryptoInfo.icon}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">{crypto.symbol}/INR</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(crypto.price)}
                  </div>
                  <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {isPositive ? '+' : ''}{crypto.change}%
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Buy/Sell Form */}
      <Card>
        <CardHeader>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setOrderType('buy')}
              className={`flex-1 pb-4 text-center font-medium border-b-2 transition-colors ${
                orderType === 'buy'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ArrowUp className="w-4 h-4 inline mr-2" />
              Buy {selectedSymbol}
            </button>
            <button
              onClick={() => setOrderType('sell')}
              className={`flex-1 pb-4 text-center font-medium border-b-2 transition-colors ${
                orderType === 'sell'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ArrowDown className="w-4 h-4 inline mr-2" />
              Sell {selectedSymbol}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Wallet Selection */}
            <div className="space-y-2">
              <Label htmlFor="wallet">Select Wallet</Label>
              <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a wallet..." />
                </SelectTrigger>
                <SelectContent>
                  {wallets?.map((wallet: any) => (
                    <SelectItem key={wallet.address} value={wallet.address}>
                      {wallet.address.slice(0, 10)}...{wallet.address.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount ({orderType === 'buy' ? 'INR' : selectedSymbol})
              </Label>
              <div className="relative">
                {orderType === 'buy' && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                )}
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={orderType === 'buy' ? 'pl-8' : ''}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              {orderDetails && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    {orderType === 'buy'
                      ? `You'll receive: ~${orderDetails.cryptoAmount.toFixed(8)} ${selectedSymbol}`
                      : `You'll receive: ~${formatCurrency(orderDetails.total)}`
                    }
                  </span>
                  <span>
                    Available: {orderType === 'buy'
                      ? formatCurrency(orderDetails.available)
                      : `${orderDetails.available.toFixed(8)} ${selectedSymbol}`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* TDS Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="tds"
                checked={includeTds}
                onCheckedChange={setIncludeTds}
              />
              <Label htmlFor="tds">Include 1% TDS</Label>
            </div>

            {/* Fee Information */}
            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trading Fee (0.1%)</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(orderDetails.fee)}
                  </span>
                </div>
                {includeTds && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TDS (1%)</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(orderDetails.tds)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">
                    {orderType === 'buy' ? 'Total Cost' : 'Net Received'}
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(orderDetails.total)}
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full font-semibold transition-colors ${
                orderType === 'buy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={buyMutation.isPending || sellMutation.isPending}
            >
              {orderType === 'buy' ? (
                <ArrowUp className="w-4 h-4 mr-2" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-2" />
              )}
              {buyMutation.isPending || sellMutation.isPending
                ? 'Processing...'
                : `${orderType === 'buy' ? 'Buy' : 'Sell'} ${selectedSymbol}`
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
