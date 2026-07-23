import { BrowserProvider, JsonRpcProvider } from "ethers";

export const FUJI = {
  chainId: 43113,
  chainIdHex: "0xa869",
  name: "Avalanche Fuji C-Chain",
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  currency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  explorer: "https://testnet.snowtrace.io",
};

// Address of the deployed AICredits contract on Fuji.
// Fill in after deployment via `bunx hardhat run scripts/deploy.ts` or Remix.
const STORED_CREDITS_KEY = "avax-scribe:aicredits-address";
export function getAiCreditsAddress(): string {
  return (
    localStorage.getItem(STORED_CREDITS_KEY) ||
    (import.meta.env.VITE_AI_CREDITS_ADDRESS as string | undefined) ||
    ""
  );
}
export function setAiCreditsAddress(addr: string) {
  localStorage.setItem(STORED_CREDITS_KEY, addr);
}

export type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, cb: (...args: any[]) => void) => void;
  removeListener?: (event: string, cb: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isAvalanche?: boolean;
  isCoreWallet?: boolean;
  providers?: EthereumProvider[];
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    avalanche?: EthereumProvider; // Core wallet exposes this
  }
}

/** Prefer Core wallet if present, then MetaMask, then any injected provider. */
export function pickInjectedProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  if (window.avalanche) return window.avalanche;
  const eth = window.ethereum;
  if (!eth) return null;
  if (eth.providers && eth.providers.length) {
    const core = eth.providers.find((p) => p.isCoreWallet || p.isAvalanche);
    if (core) return core;
    const mm = eth.providers.find((p) => p.isMetaMask);
    if (mm) return mm;
    return eth.providers[0];
  }
  return eth;
}

export function readOnlyProvider(): JsonRpcProvider {
  return new JsonRpcProvider(FUJI.rpcUrl, FUJI.chainId);
}

export async function ensureFujiNetwork(injected: EthereumProvider) {
  try {
    await injected.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: FUJI.chainIdHex }],
    });
  } catch (err: any) {
    // 4902 = chain not added
    if (err?.code === 4902 || /Unrecognized chain/i.test(err?.message || "")) {
      await injected.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: FUJI.chainIdHex,
            chainName: FUJI.name,
            nativeCurrency: FUJI.currency,
            rpcUrls: [FUJI.rpcUrl],
            blockExplorerUrls: [FUJI.explorer],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export function browserProvider(injected: EthereumProvider) {
  return new BrowserProvider(injected as any, {
    name: FUJI.name,
    chainId: FUJI.chainId,
  });
}

export const AI_CREDITS_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function creditsPerAvax() view returns (uint256)",
  "function owner() view returns (address)",
  "function totalIssued() view returns (uint256)",
  "function topUp() payable",
  "function spend(address user, uint256 amount)",
  "event ToppedUp(address indexed user, uint256 avaxAmount, uint256 creditsMinted)",
  "event Spent(address indexed user, uint256 amount)",
] as const;

export function shortenAddress(a?: string | null): string {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}