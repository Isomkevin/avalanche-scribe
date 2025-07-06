import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ConnectWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  const handleConnect = async (walletType: string) => {
    try {
      // Simulate wallet connection
      const mockAddress = '0x1234...abcd';
      setAddress(mockAddress);
      setIsConnected(true);
      
      // In real implementation, you'd connect to actual wallet here
      console.log(`Connecting to ${walletType}...`);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress('');
  };

  if (isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <Wallet className="h-4 w-4" />
            <span className="text-sm">{address}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleDisconnect}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleConnect('MetaMask')}>
          MetaMask
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleConnect('WalletConnect')}>
          WalletConnect
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleConnect('Core Wallet')}>
          Core Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConnectWallet;