import { useQuery } from '@tanstack/react-query';
import { marketApi } from '../lib/api';
import { useWebSocket } from './useWebSocket';
import { Price } from '../types';

export function usePrices() {
  const { prices: wsPrices, connectionStatus } = useWebSocket('/ws');
  
  const { data: apiPrices, isLoading, error } = useQuery({
    queryKey: ['/api/prices/live'],
    refetchInterval: 30000, // Fallback polling every 30s
    enabled: connectionStatus !== 'Open', // Only poll if WebSocket is not connected
  });

  // Use WebSocket prices if available, otherwise fall back to API prices
  const prices: Price | null = wsPrices || apiPrices || null;

  return {
    prices,
    isLoading: isLoading && !wsPrices,
    error,
    connectionStatus,
  };
}
