import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, ChevronDown, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
interface WalletInfo {
  address: string;
  chainId: number;
  balance?: string;
}

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (data: any) => void) => void;
  removeListener: (event: string, callback: (data: any) => void) => void;
  selectedAddress: string | null;
  chainId: string;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const CHAIN_NAMES: { [key: number]: string } = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  11155111: 'Sepolia Testnet',
  137: 'Polygon Mainnet',
  80001: 'Polygon Mumbai',
  56: 'BSC Mainnet',
  97: 'BSC Testnet',
  43114: 'Avalanche Mainnet',
  43113: 'Avalanche Fuji',
};

export const ConnectWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Check if MetaMask is installed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMetaMaskInstalled(!!window.ethereum?.isMetaMask);
      
      // Check if already connected
      checkConnection();
    }
  }, []);

  // Set up event listeners for account and network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else if (accounts[0] !== walletInfo?.address) {
        updateWalletInfo(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      if (walletInfo) {
        setWalletInfo(prev => prev ? { ...prev, chainId: parseInt(chainId, 16) } : null);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setWalletInfo(null);
      setError(null);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [walletInfo]);

  const checkConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await updateWalletInfo(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const updateWalletInfo = async (address: string) => {
    if (!window.ethereum) return;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);

      setWalletInfo({
        address,
        chainId: parseInt(chainId, 16),
        balance: balanceInEth,
      });
      setIsConnected(true);
    } catch (error) {
      console.error('Error updating wallet info:', error);
      setError('Failed to fetch wallet information');
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        await updateWalletInfo(accounts[0]);
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      if (error.code === 4001) {
        setError('Connection rejected by user');
      } else {
        setError('Failed to connect to MetaMask');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    setError('WalletConnect integration requires additional setup. Please use MetaMask for now.');
    // WalletConnect would require @walletconnect/web3-provider or similar
    // This is a placeholder for future implementation
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      console.error('Error switching network:', error);
      setError('Failed to switch network');
    }
  };

  const addNetwork = async (chainId: number) => {
    if (!window.ethereum) return;

    const networks: { [key: number]: any } = {
      137: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
      },
      56: {
        chainId: '0x38',
        chainName: 'BSC Mainnet',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com'],
      },
    };

    const networkConfig = networks[chainId];
    if (!networkConfig) {
      setError('Network configuration not available');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
    } catch (error: any) {
      console.error('Error adding network:', error);
      setError('Failed to add network');
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletInfo(null);
    setError(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (walletInfo?.address) {
      await navigator.clipboard.writeText(walletInfo.address);
      // You could add a toast notification here
    }
  };

  if (isConnected && walletInfo) {
    return (
      <div className="flex flex-col space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{formatAddress(walletInfo.address)}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
              <div>Balance: {walletInfo.balance} ETH</div>
              <div>Network: {CHAIN_NAMES[walletInfo.chainId] || `Chain ${walletInfo.chainId}`}</div>
            </div>
            <DropdownMenuItem onClick={copyAddress}>
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchNetwork(1)}>
              Switch to Ethereum
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchNetwork(137)}>
              Switch to Polygon
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addNetwork(137)}>
              Add Polygon Network
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDisconnect} className="text-red-600 dark:text-red-400">
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem 
            onClick={connectMetaMask}
            disabled={isConnecting}
            className="flex items-center space-x-2"
          >
            <div className="flex items-center space-x-2">
              <span>MetaMask</span>
              {isMetaMaskInstalled && <CheckCircle className="h-3 w-3 text-green-500" />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={connectWalletConnect}
            disabled={isConnecting}
          >
            WalletConnect
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            className="text-blue-600 dark:text-blue-400"
          >
            Install MetaMask
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConnectWallet;