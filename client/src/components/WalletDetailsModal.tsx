import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  ArrowUpCircle,
  ArrowDownCircle,
  Send,
  Key 
} from 'lucide-react';
import { tradingApi, walletApi } from '../lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatAddress } from '../types';

interface WalletDetailsModalProps {
  wallet: any;
  portfolio: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletDetailsModal({ wallet, portfolio, open, onOpenChange }: WalletDetailsModalProps) {
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [signMessage, setSignMessage] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [signature, setSignature] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: (amount: number) => tradingApi.deposit({ addr: wallet.address, inrAmount: amount }),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Funds deposited successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      setDepositAmount('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Deposit failed', variant: 'destructive' });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => tradingApi.withdraw({ addr: wallet.address, inrAmount: amount }),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Funds withdrawn successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      setWithdrawAmount('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Withdrawal failed', variant: 'destructive' });
    },
  });

  const signMutation = useMutation({
    mutationFn: () => walletApi.signMessage(wallet.address, { message: signMessage, passphrase }),
    onSuccess: (data) => {
      setSignature(data.signature);
      toast({ title: 'Success', description: 'Message signed successfully' });
      setPassphrase('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Signing failed', variant: 'destructive' });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `${label} copied to clipboard` });
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      depositMutation.mutate(amount);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= (portfolio?.balances.INR || 0)) {
      withdrawMutation.mutate(amount);
    }
  };

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (signMessage && passphrase) {
      signMutation.mutate();
    }
  };

  if (!wallet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Wallet Details</DialogTitle>
              <p className="text-sm text-gray-500">{formatAddress(wallet.address)}</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded text-sm break-all">
                      {wallet.address}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(wallet.address, 'Address')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(portfolio?.totalValue || 0)}
                  </div>
                  <div className={`text-sm ${
                    (portfolio?.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(portfolio?.pnl || 0) >= 0 ? '+' : ''}
                    {formatCurrency(portfolio?.pnl || 0)} ({(portfolio?.pnlPercentage || 0).toFixed(1)}%)
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recovery Phrase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMnemonic(!showMnemonic)}
                    >
                      {showMnemonic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showMnemonic ? 'Hide' : 'Show'} Recovery Phrase
                    </Button>
                  </div>
                  
                  {showMnemonic && wallet.mnemonic && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {wallet.mnemonic.split(' ').map((word: string, index: number) => (
                          <div key={index} className="bg-white p-2 rounded border text-center">
                            <span className="text-xs text-gray-500">{index + 1}</span>
                            <div className="font-mono">{word}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(wallet.mnemonic, 'Recovery phrase')}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Recovery Phrase
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{formatCurrency(portfolio?.balances.INR || 0)}</div>
                    <div className="text-xs text-gray-500">INR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{(portfolio?.balances.BTC || 0).toFixed(8)}</div>
                    <div className="text-xs text-gray-500">BTC</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{(portfolio?.balances.ETH || 0).toFixed(8)}</div>
                    <div className="text-xs text-gray-500">ETH</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{(portfolio?.balances.MATIC || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">MATIC</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{(portfolio?.balances.BNB || 0).toFixed(8)}</div>
                    <div className="text-xs text-gray-500">BNB</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                  <span>Deposit Funds</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount">Amount (INR)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={depositMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {depositMutation.isPending ? 'Processing...' : 'Deposit Funds'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  <span>Withdraw Funds</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount">Amount (INR)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Available: {formatCurrency(portfolio?.balances.INR || 0)}
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={withdrawMutation.isPending}
                  >
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    {withdrawMutation.isPending ? 'Processing...' : 'Withdraw Funds'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  <span>Message Signing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSign} className="space-y-4">
                  <div>
                    <Label htmlFor="sign-message">Message</Label>
                    <Input
                      id="sign-message"
                      placeholder="Enter message to sign..."
                      value={signMessage}
                      onChange={(e) => setSignMessage(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sign-passphrase">Passphrase</Label>
                    <Input
                      id="sign-passphrase"
                      type="password"
                      placeholder="Enter wallet passphrase..."
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={signMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {signMutation.isPending ? 'Signing...' : 'Sign Message'}
                  </Button>
                  
                  {signature && (
                    <div className="mt-4">
                      <Label>Signature</Label>
                      <div className="bg-gray-100 p-3 rounded break-all text-sm font-mono">
                        {signature}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => copyToClipboard(signature, 'Signature')}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Signature
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}