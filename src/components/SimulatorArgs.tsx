import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { SolidityParam } from "@/utils/solidityParser";

export type SimArgsState = {
  functionName: string;
  signature: string;
  stateMutability: string;
  params: SolidityParam[];
  values: string[];
  valueAvax: string; // for payable
};

export default function SimulatorArgs({
  state,
  onChange,
}: {
  state: SimArgsState | null;
  onChange: (next: SimArgsState) => void;
}) {
  if (!state) {
    return (
      <div className="text-xs text-gray-500 italic">
        Place the cursor inside a function or select one to auto-detect its arguments.
      </div>
    );
  }
  return (
    <div className="space-y-2 rounded-md border border-gray-800 bg-gray-900/60 p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-200">{state.functionName}</span>
        <Badge variant="outline" className="text-[10px] border-gray-700 text-gray-400">
          {state.stateMutability}
        </Badge>
        <code className="text-[10px] text-gray-500 truncate">{state.signature}</code>
      </div>
      {state.params.length === 0 ? (
        <p className="text-[11px] text-gray-500">No arguments.</p>
      ) : (
        state.params.map((p, i) => (
          <div key={i} className="space-y-1">
            <Label className="text-[11px] text-gray-400">
              {p.name} <span className="text-gray-600">({p.type})</span>
            </Label>
            <Input
              value={state.values[i] ?? ""}
              onChange={(e) => {
                const values = [...state.values];
                values[i] = e.target.value;
                onChange({ ...state, values });
              }}
              className="bg-gray-800 border-gray-700 h-7 text-xs font-mono"
            />
          </div>
        ))
      )}
      {state.stateMutability === "payable" && (
        <div className="space-y-1">
          <Label className="text-[11px] text-gray-400">msg.value (AVAX)</Label>
          <Input
            value={state.valueAvax}
            onChange={(e) => onChange({ ...state, valueAvax: e.target.value })}
            className="bg-gray-800 border-gray-700 h-7 text-xs font-mono"
            placeholder="0.0"
          />
        </div>
      )}
    </div>
  );
}