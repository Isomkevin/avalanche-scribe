// Local history store for Explain / Debug / Simulate outputs.
// Persisted in localStorage; no server involved.

export type HistoryKind = "explain" | "debug" | "simulate";

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  title: string; // e.g. function name or first line
  content: string; // markdown / plain text
  code?: string; // the code that was analyzed
  createdAt: number; // epoch ms
};

const KEY = "avax-scribe:history";
const MAX = 200;

function read(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
  window.dispatchEvent(new CustomEvent("avax-scribe:history-changed"));
}

export function listHistory(kind?: HistoryKind): HistoryEntry[] {
  const all = read().sort((a, b) => b.createdAt - a.createdAt);
  return kind ? all.filter((e) => e.kind === kind) : all;
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "createdAt"> & { id?: string; createdAt?: number }): HistoryEntry {
  const full: HistoryEntry = {
    id: entry.id ?? `${entry.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: entry.createdAt ?? Date.now(),
    kind: entry.kind,
    title: entry.title,
    content: entry.content,
    code: entry.code,
  };
  const cur = read();
  write([full, ...cur]);
  return full;
}

export function deleteHistory(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function clearHistory(kind?: HistoryKind) {
  if (!kind) return write([]);
  write(read().filter((e) => e.kind !== kind));
}

export function searchHistory(query: string, kind?: HistoryKind): HistoryEntry[] {
  const q = query.trim().toLowerCase();
  const base = listHistory(kind);
  if (!q) return base;
  return base.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      (e.code ?? "").toLowerCase().includes(q)
  );
}

export function subscribeHistory(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener("avax-scribe:history-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("avax-scribe:history-changed", handler);
    window.removeEventListener("storage", handler);
  };
}