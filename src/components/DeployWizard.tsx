import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Wallet,
  FileCode,
  Radio,
} from "lucide-react";
import { ContractFactory } from "ethers";
import {
  FUJI,
  browserProvider,
  ensureFujiNetwork,
  pickInjectedProvider,
  setAiCreditsAddress,
} from "@/lib/web3";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import artifact from "@/lib/aicredits.artifact.json";

type Step = {
  key: "compile" | "wallet" | "network" | "deploy" | "save";
  label: string;
  icon: any;
};

const STEPS: Step[] = [
  { key: "compile", label: "Verify compiled bytecode", icon: FileCode },
  { key: "wallet", label: "Connect wallet", icon: Wallet },
  { key: "network", label: "Switch to Avalanche Fuji", icon: Radio },
  { key: "deploy", label: "Deploy AICredits contract", icon: Rocket },
  { key: "save", label: "Save address in settings", icon: CheckCircle2 },
];

type Status = "idle" | "running" | "done" | "error";

export default function DeployWizard({
  onDeployed,
  trigger,
}: {
  onDeployed?: (address: string) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState("1000000");
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [txHash, setTxHash] = useState<string | null>(null);
  const [deployed, setDeployed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const { address, connect } = useWallet();
  const { toast } = useToast();

  const setStep = (k: Step["key"], s: Status) =>
    setStatus((prev) => ({ ...prev, [k]: s }));

  const run = async () => {
    setError(null);
    setDeployed(null);
    setTxHash(null);
    setStatus({});
    setRunning(true);
    try {
      // 1. compile (already pre-compiled)
      setStep("compile", "running");
      await new Promise((r) => setTimeout(r, 350));
      if (!artifact.bytecode?.startsWith("0x") || artifact.bytecode.length < 100) {
        throw new Error("Bundled bytecode is invalid.");
      }
      setStep("compile", "done");

      // 2. wallet
      setStep("wallet", "running");
      let signerAddr = address;
      const injected = pickInjectedProvider();
      if (!injected) throw new Error("No wallet detected. Install Core or MetaMask.");
      if (!signerAddr) {
        await connect();
        const accounts: string[] = await injected.request({ method: "eth_accounts" });
        signerAddr = accounts[0];
        if (!signerAddr) throw new Error("Wallet connection was rejected.");
      }
      setStep("wallet", "done");

      // 3. network
      setStep("network", "running");
      await ensureFujiNetwork(injected);
      setStep("network", "done");

      // 4. deploy
      setStep("deploy", "running");
      const provider = browserProvider(injected);
      const signer = await provider.getSigner();
      const factory = new ContractFactory(artifact.abi as any, artifact.bytecode, signer);
      const rateBig = BigInt(rate);
      if (rateBig <= 0n) throw new Error("Rate must be greater than 0.");
      const contract = await factory.deploy(rateBig);
      const tx = contract.deploymentTransaction();
      if (tx) setTxHash(tx.hash);
      await contract.waitForDeployment();
      const deployedAddr = await contract.getAddress();
      setDeployed(deployedAddr);
      setStep("deploy", "done");

      // 5. save
      setStep("save", "running");
      setAiCreditsAddress(deployedAddr);
      onDeployed?.(deployedAddr);
      setStep("save", "done");

      toast({
        title: "AICredits deployed",
        description: `${deployedAddr.slice(0, 10)}… saved to Settings.`,
      });
    } catch (err: any) {
      const msg = err?.shortMessage || err?.message || String(err);
      setError(msg);
      setStatus((prev) => {
        const next = { ...prev };
        for (const s of STEPS) if (next[s.key] === "running") next[s.key] = "error";
        return next;
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
            <Rocket className="h-3 w-3 mr-1" />
            Deploy AICredits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-red-400" />
            Deploy AICredits to Fuji
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            One-click wizard: compile, connect, switch network, deploy, and auto-fill the
            contract address in Settings. You'll need a small amount of test AVAX for gas
            (get some at the{" "}
            <a
              href="https://faucet.avax.network/"
              target="_blank"
              rel="noreferrer"
              className="text-red-300 underline"
            >
              Fuji faucet
            </a>
            ).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">Credits per AVAX (constructor arg)</Label>
            <Input
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="1000000"
              className="bg-gray-800 border-gray-700"
              disabled={running}
            />
            <p className="text-[11px] text-gray-500">
              1 AVAX will mint this many AI credits. Default = 1,000,000.
            </p>
          </div>

          <div className="rounded-md border border-gray-800 divide-y divide-gray-800">
            {STEPS.map((s) => {
              const st = status[s.key] ?? "idle";
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="flex-1 text-gray-200">{s.label}</span>
                  {st === "running" && <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />}
                  {st === "done" && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                  {st === "error" && <XCircle className="h-4 w-4 text-red-400" />}
                  {st === "idle" && <span className="text-xs text-gray-600">queued</span>}
                </div>
              );
            })}
          </div>

          {txHash && (
            <a
              href={`${FUJI.explorer}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline break-all"
            >
              Deployment tx: {txHash.slice(0, 20)}… <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {deployed && (
            <div className="rounded-md border border-green-500/40 bg-green-500/10 p-3 text-xs text-green-200">
              <div className="font-semibold mb-1 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Deployed & saved
              </div>
              <div className="font-mono break-all">{deployed}</div>
              <a
                href={`${FUJI.explorer}/address/${deployed}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-blue-300 hover:underline"
              >
                View on Snowtrace <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300 break-words">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Badge variant="outline" className="border-gray-700 text-gray-400 mr-auto">
            {FUJI.name}
          </Badge>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-700 text-gray-200">
            Close
          </Button>
          <Button onClick={run} disabled={running} className="bg-red-500 hover:bg-red-600">
            {running ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Rocket className="h-3 w-3 mr-1" />}
            {deployed ? "Redeploy" : "Start deployment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}