// Bring-Your-Own-Keys AI client.
// Provider-agnostic: any OpenAI-compatible /chat/completions endpoint works
// (OpenAI, Groq, OpenRouter, Together, Mistral, Ollama, LM Studio, vLLM...).

export type ByokSettings = {
  baseUrl: string;
  apiKey: string;
  model: string;
  provider?: string; // free-form label, e.g. "openai", "groq", "custom"
};

const STORAGE_KEY = "avax-scribe:byok";

export const DEFAULT_SETTINGS: ByokSettings = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  provider: "openai",
};

export const PROVIDER_PRESETS: Array<{
  id: string;
  label: string;
  baseUrl: string;
  suggestedModel: string;
}> = [
  { id: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1", suggestedModel: "gpt-4o-mini" },
  { id: "groq", label: "Groq", baseUrl: "https://api.groq.com/openai/v1", suggestedModel: "llama-3.3-70b-versatile" },
  { id: "openrouter", label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", suggestedModel: "anthropic/claude-3.5-sonnet" },
  { id: "together", label: "Together.ai", baseUrl: "https://api.together.xyz/v1", suggestedModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
  { id: "mistral", label: "Mistral", baseUrl: "https://api.mistral.ai/v1", suggestedModel: "mistral-large-latest" },
  { id: "ollama", label: "Ollama (local)", baseUrl: "http://localhost:11434/v1", suggestedModel: "llama3.1" },
  { id: "lmstudio", label: "LM Studio (local)", baseUrl: "http://localhost:1234/v1", suggestedModel: "local-model" },
  { id: "custom", label: "Custom / self-hosted", baseUrl: "", suggestedModel: "" },
];

export function loadSettings(): ByokSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ByokSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: ByokSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function hasCredentials(s: ByokSettings): boolean {
  return Boolean(s.baseUrl?.trim() && s.model?.trim());
  // apiKey may be empty for local providers (Ollama, LM Studio)
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatCompletion(
  messages: ChatMessage[],
  settings: ByokSettings,
  opts: { temperature?: number; signal?: AbortSignal } = {}
): Promise<string> {
  if (!settings.baseUrl || !settings.model) {
    throw new Error("AI provider not configured. Open Settings to add your key.");
  }
  const url = settings.baseUrl.replace(/\/$/, "") + "/chat/completions";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (settings.apiKey) headers["Authorization"] = `Bearer ${settings.apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    signal: opts.signal,
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: opts.temperature ?? 0.2,
      stream: false,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message || JSON.stringify(j);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`AI request failed (${res.status}): ${detail || res.statusText}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("AI response missing content");
  }
  return content;
}