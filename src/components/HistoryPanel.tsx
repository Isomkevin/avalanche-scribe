import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Search, Trash2, RotateCcw, X } from "lucide-react";
import {
  HistoryEntry,
  HistoryKind,
  deleteHistory,
  listHistory,
  searchHistory,
  subscribeHistory,
  clearHistory,
} from "@/lib/history";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

const KIND_COLOR: Record<HistoryKind, string> = {
  explain: "border-blue-500/50 text-blue-300",
  debug: "border-yellow-500/50 text-yellow-300",
  simulate: "border-red-500/50 text-red-300",
};

export default function HistoryPanel({
  kind,
  onReopen,
  emptyHint,
}: {
  kind?: HistoryKind;
  onReopen: (entry: HistoryEntry) => void;
  emptyHint?: string;
}) {
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => subscribeHistory(() => setTick((t) => t + 1)), []);

  const items = useMemo(
    () => (q.trim() ? searchHistory(q, kind) : listHistory(kind)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, kind, tick]
  );

  const preview = items.find((i) => i.id === previewId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b border-gray-800">
        <History className="h-3.5 w-3.5 text-gray-400" />
        <div className="relative flex-1">
          <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search history…"
            className="bg-gray-800 border-gray-700 h-7 text-xs pl-7"
          />
        </div>
        {items.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => clearHistory(kind)}
            className="h-7 text-xs text-gray-400 hover:text-red-300"
            title="Clear history"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="p-4 text-xs text-gray-500">
            {emptyHint || "No history yet. Run Explain, Debug or Simulate to build one."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {items.map((e) => (
              <li key={e.id} className="p-2 hover:bg-gray-800/40">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${KIND_COLOR[e.kind]}`}>
                    {e.kind}
                  </Badge>
                  <button
                    onClick={() => setPreviewId(e.id === previewId ? null : e.id)}
                    className="flex-1 text-left text-xs text-gray-200 truncate hover:text-white"
                    title={e.title}
                  >
                    {e.title}
                  </button>
                  <span className="text-[10px] text-gray-500 shrink-0">{timeAgo(e.createdAt)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onReopen(e)}
                    className="h-6 px-1.5 text-[11px] text-gray-300 hover:text-white"
                    title="Re-open in panel"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteHistory(e.id)}
                    className="h-6 px-1.5 text-gray-500 hover:text-red-300"
                    title="Delete"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {preview?.id === e.id && (
                  <pre className="mt-2 text-[11px] whitespace-pre-wrap text-gray-400 max-h-40 overflow-auto border-l-2 border-gray-700 pl-2">
                    {preview.content.slice(0, 800)}
                    {preview.content.length > 800 ? "…" : ""}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}