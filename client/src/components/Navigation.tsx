import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Wallet, BarChart3, ArrowLeftRight, Settings, Menu, Wifi } from 'lucide-react';
import { usePrices } from '../hooks/usePrices';

interface NavigationProps {
  onCreateWallet: () => void;
}

export function Navigation({ onCreateWallet }: NavigationProps) {
  const [location] = useLocation();
  const { connectionStatus } = usePrices();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/exchange', label: 'Exchange', icon: ArrowLeftRight },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location === '/';
    }
    return location.startsWith(path);
  };

  const NavContent = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.path} href={item.path}>
            <Button
              variant="ghost"
              className={`justify-start ${
                isActive(item.path)
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">CryptoWallet</h1>
              </div>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <NavContent />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'Open' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {connectionStatus === 'Open' ? 'Live Prices' : 'Disconnected'}
              </span>
              <Wifi className="h-3 w-3 text-gray-500" />
            </div>
            
            <Button onClick={onCreateWallet} size="sm" className="hidden sm:flex">
              <Wallet className="h-4 w-4 mr-2" />
              Create Wallet
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            
            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavContent />
                  <Button onClick={onCreateWallet} className="w-full">
                    <Wallet className="h-4 w-4 mr-2" />
                    Create Wallet
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
