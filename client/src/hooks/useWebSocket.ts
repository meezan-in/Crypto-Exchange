import { useEffect, useRef, useState } from 'react';
import { Price } from '../types';

interface UseWebSocketReturn {
  lastMessage: any;
  connectionStatus: 'Connecting' | 'Open' | 'Closing' | 'Closed';
  prices: Price | null;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Open' | 'Closing' | 'Closed'>('Connecting');
  const [prices, setPrices] = useState<Price | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        setConnectionStatus('Open');
      };
      
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          if (data.type === 'prices') {
            setPrices(data.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = () => {
        setConnectionStatus('Closed');
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Closed');
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnectionStatus('Closed');
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  return {
    lastMessage,
    connectionStatus,
    prices,
  };
}
