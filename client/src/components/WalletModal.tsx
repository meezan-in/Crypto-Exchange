import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Key, AlertTriangle, Copy, CheckCircle } from 'lucide-react';
import { walletApi } from '../lib/api';
import { useToast } from '@/hooks/use-toast';

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const [createForm, setCreateForm] = useState({ passphrase: '', confirmPassphrase: '' });
  const [importForm, setImportForm] = useState({ mnemonic: '', passphrase: '' });
  const [activeTab, setActiveTab] = useState('create');
  const [createdWallet, setCreatedWallet] = useState<any>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: walletApi.create,
    onSuccess: (wallet) => {
      toast({
        title: 'Wallet Created',
        description: `New wallet created: ${wallet.address.slice(0, 10)}...`,
      });
      setCreatedWallet(wallet);
      setShowMnemonic(true);
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create wallet',
        variant: 'destructive',
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: walletApi.import,
    onSuccess: (wallet) => {
      toast({
        title: 'Wallet Imported',
        description: `Wallet imported successfully: ${wallet.address.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      onOpenChange(false);
      setImportForm({ mnemonic: '', passphrase: '' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to import wallet',
        variant: 'destructive',
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Recovery phrase copied to clipboard' });
  };

  const handleClose = () => {
    onOpenChange(false);
    setCreatedWallet(null);
    setShowMnemonic(false);
    setCreateForm({ passphrase: '', confirmPassphrase: '' });
    setImportForm({ mnemonic: '', passphrase: '' });
    setActiveTab('create');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createForm.passphrase !== createForm.confirmPassphrase) {
      toast({
        title: 'Error',
        description: 'Passphrases do not match',
        variant: 'destructive',
      });
      return;
    }

    if (createForm.passphrase.length < 8) {
      toast({
        title: 'Error',
        description: 'Passphrase must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({ passphrase: createForm.passphrase });
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (importForm.passphrase.length < 8) {
      toast({
        title: 'Error',
        description: 'Passphrase must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    importMutation.mutate(importForm);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>
                {createdWallet ? 'Wallet Created Successfully' : 'Wallet Management'}
              </DialogTitle>
              <DialogDescription>
                {createdWallet 
                  ? 'Save your recovery phrase securely'
                  : 'Create a new wallet or import an existing one'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {createdWallet && showMnemonic ? (
          <div className="space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Wallet created successfully! Save your recovery phrase in a secure location.
              </AlertDescription>
            </Alert>

            <div>
              <Label>Wallet Address</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm break-all">
                  {createdWallet.address}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(createdWallet.address)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Recovery Phrase (12 words)</Label>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-1">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {createdWallet.mnemonic.split(' ').map((word: string, index: number) => (
                    <div key={index} className="bg-white p-2 rounded border text-center">
                      <span className="text-xs text-gray-500">{index + 1}</span>
                      <div className="font-mono text-sm">{word}</div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(createdWallet.mnemonic)}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Recovery Phrase
                </Button>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Store this recovery phrase safely. It's the only way to restore your wallet if you lose access.
              </AlertDescription>
            </Alert>

            <Button onClick={handleClose} className="w-full">
              I've Saved My Recovery Phrase
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>Create</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Import</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passphrase">Passphrase</Label>
                <Input
                  id="passphrase"
                  type="password"
                  placeholder="Enter a strong passphrase..."
                  value={createForm.passphrase}
                  onChange={(e) => setCreateForm({ ...createForm, passphrase: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-passphrase">Confirm Passphrase</Label>
                <Input
                  id="confirm-passphrase"
                  type="password"
                  placeholder="Confirm your passphrase..."
                  value={createForm.confirmPassphrase}
                  onChange={(e) => setCreateForm({ ...createForm, confirmPassphrase: e.target.value })}
                  required
                />
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your passphrase encrypts your private key. Make sure it's strong and memorable - it cannot be recovered if lost.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Wallet'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mnemonic">Mnemonic Phrase</Label>
                <Input
                  id="mnemonic"
                  placeholder="Enter your 12-word mnemonic phrase..."
                  value={importForm.mnemonic}
                  onChange={(e) => setImportForm({ ...importForm, mnemonic: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="import-passphrase">Passphrase</Label>
                <Input
                  id="import-passphrase"
                  type="password"
                  placeholder="Enter your passphrase..."
                  value={importForm.passphrase}
                  onChange={(e) => setImportForm({ ...importForm, passphrase: e.target.value })}
                  required
                />
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure you have the correct mnemonic phrase and passphrase for the wallet you want to import.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={importMutation.isPending}
                >
                  {importMutation.isPending ? 'Importing...' : 'Import Wallet'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
