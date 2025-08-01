import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { elevenLabsService } from '../services/elevenLabs';
import { cn } from '../lib/utils';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [agentCount, setAgentCount] = useState(0);

  useEffect(() => {
    const checkConnection = () => {
      // Check if polling is active
      const isPolling = (elevenLabsService as any).pollingInterval !== null;
      
      if (isPolling) {
        setStatus('connected');
        setAgentCount(4); // We're monitoring 4 agents
      } else {
        setStatus('disconnected');
        setAgentCount(0);
      }
    };

    // Initial check
    checkConnection();

    // Check every 2 seconds
    const interval = setInterval(checkConnection, 2000);

    // Listen for errors
    elevenLabsService.onError(() => {
      setStatus('disconnected');
    });

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full glass-premium",
      "text-sm font-medium transition-all duration-300",
      {
        "text-green-400": status === 'connected',
        "text-yellow-400": status === 'connecting',
        "text-red-400": status === 'disconnected'
      }
    )}>
      {status === 'connected' && (
        <>
          <Wifi className="w-4 h-4" />
          <span>Bağlı ({agentCount} agent)</span>
        </>
      )}
      {status === 'connecting' && (
        <>
          <AlertCircle className="w-4 h-4 animate-pulse" />
          <span>Bağlanıyor...</span>
        </>
      )}
      {status === 'disconnected' && (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Bağlantı Yok</span>
        </>
      )}
    </div>
  );
}