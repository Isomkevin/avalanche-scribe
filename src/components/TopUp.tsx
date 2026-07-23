import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader2, ExternalLink } from "lucide-react";
import { Contract, formatUnits, parseEther } from "ethers";
import {
  AI_CREDITS_ABI,
  FUJI,
  browserProvider,
  getAiCreditsAddress,
  pickInjectedProvider,
  readOnlyProvider,
} from "@/lib/web3";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

export default function TopUp() {
  const { address, isFuji, connect, switchToFuji, refreshBalance } = useWallet();
  const [amount, setAmount] = useState("0.1");
  const [credits, setCredits] = useState<string | null>(null);
  const [rate, setRate] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { toast } = useToast();

  const contractAddress = getAiCreditsAddress();

  const loadOnChain = useCallback(async () => {
    if (!contractAddress) return;
    try {
      const provider = readOnlyProvider();
      const c = new Contract(contractAddress, AI_CREDITS_ABI, provider);
      const r: bigint = await c.creditsPerAvax();
      setRate(r.toString());
      if (address) {
        const bal: bigint = await c.balanceOf(address);
        setCredits(formatUnits(bal, 0));
      }
    } catch (err: any) {
      // Contract not deployed or wrong address — swallow silently.
      console.warn("AICredits read failed:", err?.message);
    }
  }, [address, contractAddress]);

  useEffect(() => {
    loadOnChain();
  }, [loadOnChain]);

  const onTopUp = async () => {
    if (!contractAddress) {
      toast({
        title: "Contract not configured",
        description: "Set the AICredits address in Settings.",
        variant: "destructive",
      });
      return;
    }
    if (!address) {
      await connect();
      return;
    }
    if (!isFuji) {
      await switchToFuji();
      return;
    }
    const injected = pickInjectedProvider();
    if (!injected) return;
    setPending(true);
    setTxHash(null);
    try {
      const provider = browserProvider(injected);
      const signer = await provider.getSigner();
      const c = new Contract(contractAddress, AI_CREDITS_ABI, signer);
      const tx = await c.topUp({ value: parseEther(amount) });
      setTxHash(tx.hash);
      toast({ title: "Top-up submitted", description: `Tx ${tx.hash.slice(0, 10)}…` });
      await tx.wait();
      toast({ title: "Top-up confirmed", description: `${amount} AVAX credited.` });
      await loadOnChain();
      await refreshBalance(address);
    } catch (err: any) {
      toast({
        title: "Top-up failed",
        description: err?.shortMessage || err?.message || String(err),
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  const projected =
    rate && amount && !Number.isNaN(Number(amount))
      ? (Number(amount) * Number(rate)).toLocaleString()
      : null;

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="h-4 w-4 mr-2 text-red-400" />
            AI Credits
          </div>
          {credits !== null && (
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              {Number(credits).toLocaleString()} credits
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!contractAddress ? (
          <p className="text-xs text-gray-400">
            Deploy <code className="text-red-300">AICredits.sol</code> to Fuji, then paste its address in Settings.
          </p>
        ) : (
          <>
            <div className="text-xs text-gray-400">
              Rate: {rate ? `1 AVAX = ${Number(rate).toLocaleString()} credits` : "…"}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0.001"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <Button
                onClick={onTopUp}
                disabled={pending || !amount || Number(amount) <= 0}
                className="bg-red-500 hover:bg-red-600 shrink-0"
              >
                {pending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Coins className="h-3 w-3 mr-1" />
                )}
                Top up
              </Button>
            </div>
            {projected && (
              <p className="text-xs text-gray-400">
                You'll receive ~<span className="text-red-300">{projected}</span> credits.
              </p>
            )}
            {txHash && (
              <a
                href={`${FUJI.explorer}/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
              >
                View on Snowtrace <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}