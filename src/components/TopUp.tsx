import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AI_CREDITS_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your deployed contract address
const AI_CREDITS_ABI = [{"inputs":[{"internalType":"uint256","name":"_exchangeRate","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"creditsSpent","type":"uint256"}],"name":"CreditsDeducted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"avaxAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"creditsMinted","type":"uint256"}],"name":"TopUp","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"creditBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"exchangeRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newRate","type":"uint256"}],"name":"setExchangeRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"spendCredits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"topUp","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

export const TopUp = () => {
  const { account, library } = useWeb3React();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');

  const getBalance = async () => {
    if (account && library) {
      const contract = new ethers.Contract(AI_CREDITS_ADDRESS, AI_CREDITS_ABI, library);
      const userBalance = await contract.creditBalances(account);
      setBalance(userBalance.toString());
    }
  };

  const topUp = async () => {
    if (account && library && amount) {
      const signer = library.getSigner();
      const contract = new ethers.Contract(AI_CREDITS_ADDRESS, AI_CREDITS_ABI, signer);
      const tx = await contract.topUp({ value: ethers.utils.parseEther(amount) });
      await tx.wait();
      getBalance();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Credits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Your balance: {balance} credits</p>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="AVAX Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-1/2"
          />
          <Button onClick={topUp} className="w-1/2">Top Up</Button>
        </div>
        <Button onClick={getBalance} variant="outline" size="sm" className="mt-2 w-full">Refresh Balance</Button>
      </CardContent>
    </Card>
  );
};