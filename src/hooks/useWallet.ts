import { useCallback, useEffect, useState } from "react";
import {
  pickInjectedProvider,
  ensureFujiNetwork,
  browserProvider,
  FUJI,
  type EthereumProvider,
} from "@/lib/web3";
import { formatEther } from "ethers";

export type WalletState = {
  address: string | null;
  chainId: number | null;
  balance: string | null; // AVAX, formatted
  connecting: boolean;
  error: string | null;
  hasInjected: boolean;
  isFuji: boolean;
};

export function useWallet() {
  const [state, setState] = useState<WalletState>(() => ({
    address: null,
    chainId: null,
    balance: null,
    connecting: false,
    error: null,
    hasInjected: !!pickInjectedProvider(),
    isFuji: false,
  }));

  const refreshBalance = useCallback(async (addr: string) => {
    const injected = pickInjectedProvider();
    if (!injected) return;
    try {
      const provider = browserProvider(injected);
      const bal = await provider.getBalance(addr);
      setState((s) => ({ ...s, balance: formatEther(bal) }));
    } catch {
      /* ignore */
    }
  }, []);

  const connect = useCallback(async () => {
    const injected = pickInjectedProvider();
    if (!injected) {
      setState((s) => ({ ...s, error: "No wallet detected. Install Core or MetaMask." }));
      return;
    }
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const accounts: string[] = await injected.request({ method: "eth_requestAccounts" });
      await ensureFujiNetwork(injected);
      const chainHex: string = await injected.request({ method: "eth_chainId" });
      const chainId = parseInt(chainHex, 16);
      const address = accounts[0] ?? null;
      setState((s) => ({
        ...s,
        address,
        chainId,
        isFuji: chainId === FUJI.chainId,
        connecting: false,
      }));
      if (address) refreshBalance(address);
    } catch (err: any) {
      setState((s) => ({ ...s, connecting: false, error: err?.message || "Failed to connect" }));
    }
  }, [refreshBalance]);

  const disconnect = useCallback(() => {
    setState((s) => ({ ...s, address: null, balance: null }));
  }, []);

  // Wire up wallet events.
  useEffect(() => {
    const injected = pickInjectedProvider();
    if (!injected?.on) return;

    const onAccounts = (accounts: string[]) => {
      const address = accounts[0] ?? null;
      setState((s) => ({ ...s, address, balance: null }));
      if (address) refreshBalance(address);
    };
    const onChain = (chainHex: string) => {
      const chainId = parseInt(chainHex, 16);
      setState((s) => ({ ...s, chainId, isFuji: chainId === FUJI.chainId }));
    };

    injected.on("accountsChanged", onAccounts);
    injected.on("chainChanged", onChain);

    // Silent restore if already authorized.
    (async () => {
      try {
        const accounts: string[] = await injected.request({ method: "eth_accounts" });
        const chainHex: string = await injected.request({ method: "eth_chainId" });
        const chainId = parseInt(chainHex, 16);
        const address = accounts[0] ?? null;
        setState((s) => ({
          ...s,
          address,
          chainId,
          isFuji: chainId === FUJI.chainId,
        }));
        if (address) refreshBalance(address);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      injected.removeListener?.("accountsChanged", onAccounts);
      injected.removeListener?.("chainChanged", onChain);
    };
  }, [refreshBalance]);

  const switchToFuji = useCallback(async () => {
    const injected = pickInjectedProvider();
    if (!injected) return;
    try {
      await ensureFujiNetwork(injected);
    } catch (err: any) {
      setState((s) => ({ ...s, error: err?.message || "Failed to switch network" }));
    }
  }, []);

  return { ...state, connect, disconnect, refreshBalance, switchToFuji };
}