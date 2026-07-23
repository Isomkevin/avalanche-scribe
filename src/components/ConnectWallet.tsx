import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertTriangle, LogOut } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/web3";

export default function ConnectWallet() {
  const { address, balance, isFuji, connecting, error, hasInjected, connect, disconnect, switchToFuji } =
    useWallet();

  if (!hasInjected) {
    return (
      <a
        href="https://core.app/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
      >
        <AlertTriangle className="h-3 w-3" />
        Install Core Wallet
      </a>
    );
  }

  if (!address) {
    return (
      <Button
        size="sm"
        onClick={connect}
        disabled={connecting}
        className="bg-red-500 hover:bg-red-600"
        title={error || undefined}
      >
        <Wallet className="h-3 w-3 mr-1" />
        {connecting ? "Connecting…" : "Connect to Core"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isFuji && (
        <Button size="sm" variant="outline" onClick={switchToFuji} className="border-yellow-500/50 text-yellow-400">
          Switch to Fuji
        </Button>
      )}
      <Badge variant="outline" className="border-gray-700 text-gray-200">
        {balance ? `${Number(balance).toFixed(4)} AVAX` : "…"}
      </Badge>
      <Badge variant="outline" className="border-green-500/50 text-green-400">
        {shortenAddress(address)}
      </Badge>
      <Button size="sm" variant="ghost" onClick={disconnect} className="text-gray-400 hover:text-white">
        <LogOut className="h-3 w-3" />
      </Button>
    </div>
  );
}