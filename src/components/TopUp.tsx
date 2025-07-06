// components/TopUp.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Plus, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TopUp = () => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fujiAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const currentBalance = '0.125';

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Top-up initiated",
        description: `Requesting ${amount} AVAX from Fuji faucet`,
      });
      
      setAmount('');
    } catch (error) {
      toast({
        title: "Top-up failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(fujiAddress);
    toast({
      title: "Address copied",
      description: "Fuji testnet address copied to clipboard",
    });
  };

  const openFaucet = () => {
    window.open('https://faucet.avax.network/', '_blank');
  };

  return (
    <Card className="h-full bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center text-white">
          <Wallet className="h-4 w-4 mr-2 text-green-400" />
          Fuji Testnet Top-up
        </CardTitle>
      </CardHeader>
      <Separator className="bg-gray-800" />
      <CardContent className="p-4 space-y-4">
        
        {/* Balance Display */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Current Balance</span>
            <Badge variant="outline" className="text-green-400 border-green-400/50">
              {currentBalance} AVAX
            </Badge>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Fuji Testnet Address</Label>
          <div className="flex items-center space-x-2">
            <Input
              value={fujiAddress}
              readOnly
              className="bg-gray-800 border-gray-700 text-xs font-mono"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={copyAddress}
              className="text-gray-400 hover:text-white"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Amount (AVAX)</Label>
          <Input
            type="number"
            placeholder="Enter amount (e.g., 1.0)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-800 border-gray-700"
            min="0"
            step="0.1"
          />
        </div>

        {/* Top-up Button */}
        <Button
          onClick={handleTopUp}
          disabled={isLoading || !amount}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
              Requesting...
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 mr-2" />
              Request from Faucet
            </>
          )}
        </Button>

        <Separator className="bg-gray-800" />

        {/* Manual Faucet Link */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <AlertCircle className="h-3 w-3" />
            <span>Need more AVAX?</span>
          </div>
          <Button
            variant="outline"
            onClick={openFaucet}
            className="w-full text-xs border-gray-700 hover:bg-gray-800"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Open Avalanche Faucet
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5" />
            <div className="text-xs text-blue-300">
              <p className="font-medium mb-1">Fuji Testnet Info</p>
              <p className="text-blue-400">
                Free testnet AVAX for development and testing. 
                Rate limited to prevent abuse.
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};