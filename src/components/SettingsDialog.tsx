import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Loader2, CheckCircle2, XCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import {
  PROVIDER_PRESETS,
  loadSettings,
  saveSettings,
  chatCompletion,
  type ByokSettings,
} from "@/lib/byok";
import { setAiCreditsAddress, getAiCreditsAddress } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import DeployWizard from "./DeployWizard";

export default function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ByokSettings>(() => loadSettings());
  const [contractAddr, setContractAddr] = useState(() => getAiCreditsAddress());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; msg: string }>(null);
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setSettings(loadSettings());
      setContractAddr(getAiCreditsAddress());
      setTestResult(null);
    }
  }, [open]);

  const onPreset = (id: string) => {
    const preset = PROVIDER_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setSettings((s) => ({
      ...s,
      provider: id,
      baseUrl: preset.baseUrl || s.baseUrl,
      model: preset.suggestedModel || s.model,
    }));
  };

  const onTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const reply = await chatCompletion(
        [
          { role: "system", content: "Reply with the single word: OK." },
          { role: "user", content: "ping" },
        ],
        settings,
        { temperature: 0 }
      );
      setTestResult({ ok: true, msg: `Connected. Model replied: "${reply.slice(0, 60)}"` });
    } catch (err: any) {
      setTestResult({ ok: false, msg: err?.message || "Connection failed" });
    } finally {
      setTesting(false);
    }
  };

  const onSave = () => {
    saveSettings(settings);
    if (contractAddr.trim()) setAiCreditsAddress(contractAddr.trim());
    toast({ title: "Settings saved", description: "Your keys are stored locally in this browser." });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
          <Settings className="h-3 w-3 mr-1" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-red-400" />
            Bring Your Own AI Keys
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Any OpenAI-compatible <code className="text-red-300">/chat/completions</code> endpoint works.
            Keys stay in your browser — never sent to us.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">Provider</Label>
            <Select value={settings.provider} onValueChange={onPreset}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {PROVIDER_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">Base URL</Label>
            <Input
              value={settings.baseUrl}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">API Key</Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="sk-…  (leave empty for local Ollama / LM Studio)"
                className="bg-gray-800 border-gray-700 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">Model</Label>
            <Input
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              placeholder="gpt-4o-mini"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-1.5">
            <Label className="text-xs text-gray-300">AICredits Contract Address (Fuji)</Label>
            <Input
              value={contractAddr}
              onChange={(e) => setContractAddr(e.target.value)}
              placeholder="0x… (leave blank if not deployed yet)"
              className="bg-gray-800 border-gray-700 font-mono text-xs"
            />
            <div className="pt-1">
              <DeployWizard onDeployed={(addr) => setContractAddr(addr)} />
            </div>
          </div>

          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-md border p-2 text-xs ${
                testResult.ok
                  ? "border-green-500/40 bg-green-500/10 text-green-300"
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              )}
              <span className="break-all">{testResult.msg}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onTest} disabled={testing} className="border-gray-700 text-gray-200">
            {testing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
            Test connection
          </Button>
          <Button onClick={onSave} className="bg-red-500 hover:bg-red-600">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}