import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Wallet } from 'lucide-react';

const AI_CREDITS_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your deployed contract address
const AI_CREDITS_ABI = [{"inputs":[{"internalType":"uint256","name":"_exchangeRate","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"creditsSpent","type":"uint256"}],"name":"CreditsDeducted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"avaxAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"creditsMinted","type":"uint256"}],"name":"TopUp","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"creditBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"exchangeRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newRate","type":"uint256"}],"name":"setExchangeRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"spendCredits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"topUp","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

export const TopUp = () => {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');
  const [exchangeRate, setExchangeRate] = useState('100'); // Default exchange rate
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check for existing wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          getBalance();
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
        getBalance();
      } catch (err) {
        setError('Failed to connect wallet');
        console.error('Error connecting wallet:', err);
      }
    } else {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
    }
  };

  const getBalance = async () => {
    if (!account || !window.ethereum) return;
    
    try {
      setIsRefreshing(true);
      setError('');
      // Simulate API call to get balance
      // In real implementation, you'd call your contract here
      const mockBalance = Math.floor(Math.random() * 1000);
      setBalance(mockBalance.toString());
    } catch (err) {
      setError('Failed to fetch balance. Please check your connection.');
      console.error('Error fetching balance:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateCredits = () => {
    if (!amount || !exchangeRate || exchangeRate === '0') return '0';
    try {
      const avaxAmount = parseFloat(amount);
      const rate = parseFloat(exchangeRate);
      const credits = avaxAmount * rate;
      return credits.toFixed(2);
    } catch {
      return '0';
    }
  };

  const topUp = async () => {
    if (!account || !window.ethereum || !amount) {
      setError('Please connect wallet and enter amount');
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // Convert amount to wei (18 decimals)
      const amountWei = (parseFloat(amount) * Math.pow(10, 18)).toString(16);
      
      // Simulate transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: AI_CREDITS_ADDRESS,
          value: '0x' + amountWei,
          data: '0x' // topUp() function selector would go here
        }]
      });
      
      setSuccess('Transaction submitted! Hash: ' + txHash);
      setAmount('');
      
      // Simulate waiting for confirmation
      setTimeout(() => {
        setSuccess('Top-up successful!');
        getBalance();
      }, 3000);
      
    } catch (err) {
      if (err.code === 4001) {
        setError('Transaction rejected by user');
      } else if (err.code === -32603) {
        setError('Insufficient AVAX balance');
      } else {
        setError('Transaction failed. Please try again.');
      }
      console.error('Top-up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 1) return num.toFixed(6);
    return num.toLocaleString();
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Credits</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Wallet className="h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Connect your wallet to manage AI credits</p>
          </div>
          <Button onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Credits Top-Up</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Your balance:</span>
          <span className="font-semibold">{formatBalance(balance)} credits</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Connected:</span>
          <span className="font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
        
        {exchangeRate !== '0' && (
          <div className="text-xs text-gray-500">
            Exchange rate: {exchangeRate} credits per AVAX
          </div>
        )}

        <div className="space-y-2">
          <div className="flex w-full items-center space-x-2">
            <Input
              type="number"
              placeholder="AVAX Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
              step="0.01"
              min="0"
              disabled={isLoading}
            />
            <Button 
              onClick={topUp} 
              disabled={isLoading || !amount}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                'Top Up'
              )}
            </Button>
          </div>
          
          {amount && exchangeRate !== '0' && (
            <div className="text-sm text-gray-600">
              You will receive: ~{formatBalance(calculateCredits())} credits
            </div>
          )}
        </div>

        <Button 
          onClick={getBalance} 
          variant="outline" 
          size="sm" 
          className="w-full"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Balance
            </>
          )}
        </Button>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};