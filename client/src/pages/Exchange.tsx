import { useState } from 'react';
import { TradingInterface } from '../components/TradingInterface';
import { OrderBook } from '../components/OrderBook';

export default function Exchange() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TradingInterface />
          </div>
          
          <div>
            <OrderBook symbol={selectedSymbol} />
          </div>
        </div>
      </div>
    </div>
  );
}
