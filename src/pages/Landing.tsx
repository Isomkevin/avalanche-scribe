import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Bug,
  BookOpen,
  Play,
  Rocket,
  Wallet,
  ShieldCheck,
  FileDown,
  History,
  Sparkles,
  Github,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "AI Explain",
    body: "Highlight any Solidity function and get a senior-auditor grade explanation, inline.",
    accent: "text-blue-300",
  },
  {
    icon: Bug,
    title: "Security Debug",
    body: "Reentrancy, access control, oracle risk, gas — categorized Critical → Info.",
    accent: "text-yellow-300",
  },
  {
    icon: Play,
    title: "Fuji Simulator",
    body: "Live block, gas price and wallet state. Pre-fills arguments from your selection.",
    accent: "text-red-300",
  },
  {
    icon: Rocket,
    title: "One-click deploy",
    body: "In-app wizard compiles and ships AICredits.sol to Fuji, then auto-fills the address.",
    accent: "text-green-300",
  },
  {
    icon: FileDown,
    title: "PDF reports",
    body: "Export a branded report with your function, explanations and simulation results.",
    accent: "text-purple-300",
  },
  {
    icon: History,
    title: "Local history",
    body: "Every Explain/Debug is timestamped, searchable and one-click reopenable.",
    accent: "text-cyan-300",
  },
];

const STEPS = [
  { n: "01", t: "Bring your key", b: "Any OpenAI-compatible endpoint — OpenAI, Groq, OpenRouter, Ollama. Stored in your browser only." },
  { n: "02", t: "Connect Core / MetaMask", b: "We auto-switch you to Avalanche Fuji C-Chain and show live balance." },
  { n: "03", t: "Write. Explain. Ship.", b: "Compose in Monaco, audit with AI, simulate on-chain, export a PDF, deploy AICredits." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#08080d] text-white overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-red-500/20 blur-[120px]" />
        <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-red-500 to-orange-500 text-sm font-black">
            A
          </div>
          <span className="text-sm font-semibold tracking-wide">Avalanche Scribe</span>
          <Badge variant="outline" className="ml-2 border-red-500/40 text-red-300 text-[10px]">
            Fuji Testnet
          </Badge>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-xs text-gray-400">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#workflow" className="hover:text-white">Workflow</a>
          <a href="#stack" className="hover:text-white">Stack</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
            <Github className="h-3 w-3" /> Source
          </a>
        </nav>
        <Link to="/ide">
          <Button size="sm" className="bg-red-500 hover:bg-red-600">
            Launch IDE <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24">
        <div className="grid gap-12 md:grid-cols-[1.15fr_1fr] items-center">
          <div>
            <Badge className="mb-5 bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/20">
              <Sparkles className="h-3 w-3 mr-1" /> AI-native Solidity IDE
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Ship safer Avalanche contracts{" "}
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                at AI speed.
              </span>
            </h1>
            <p className="mt-5 text-lg text-gray-400 max-w-xl">
              Write, audit, simulate and deploy Solidity to Avalanche Fuji — all in one browser
              tab. Bring your own AI key, keep your data local, and export polished PDF reports
              your team can actually read.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/ide">
                <Button size="lg" className="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30">
                  Open the IDE <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="border-gray-700 text-gray-200 hover:bg-gray-800">
                  See what's inside
                </Button>
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-green-400" /> BYOK — keys never leave your browser</span>
              <span className="inline-flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-400" /> Live Fuji state</span>
              <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3 text-red-300" /> Core + MetaMask</span>
            </div>
          </div>

          {/* Editor mock */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-red-500/30 via-orange-500/20 to-purple-500/20 blur-2xl rounded-3xl" />
            <div className="relative rounded-xl border border-gray-800 bg-gray-950/90 backdrop-blur shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800 bg-gray-900/70">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[11px] text-gray-500 ml-2">AICredits.sol</span>
                <Badge variant="outline" className="ml-auto text-[10px] border-red-500/40 text-red-300">Fuji</Badge>
              </div>
              <pre className="text-[11px] leading-relaxed p-4 text-gray-300 font-mono overflow-hidden">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AICredits {
  address public owner;
  uint256 public creditsPerAvax;

  function topUp() external payable {
    uint256 minted = (msg.value * creditsPerAvax) / 1 ether;
    _balances[msg.sender] += minted;
    emit ToppedUp(msg.sender, msg.value, minted);
  }
  // …
}`}
              </pre>
              <div className="border-t border-gray-800 grid grid-cols-3 text-[11px]">
                <div className="p-3 border-r border-gray-800">
                  <div className="text-blue-300 font-semibold mb-1">Explain</div>
                  <p className="text-gray-500">Accepts AVAX and mints non-transferable credits at a fixed rate.</p>
                </div>
                <div className="p-3 border-r border-gray-800">
                  <div className="text-yellow-300 font-semibold mb-1">Debug</div>
                  <p className="text-gray-500">No reentrancy: state written before external calls. ✓</p>
                </div>
                <div className="p-3">
                  <div className="text-red-300 font-semibold mb-1">Simulate</div>
                  <p className="text-gray-500">Block #38,241,930 · gas 25 gwei</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold">A full smart-contract workbench.</h2>
          <p className="mt-3 text-gray-400">
            Everything you'd normally glue together — editor, auditor, simulator, deployer, reporter —
            in one focused surface.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-red-500/40 hover:bg-gray-900 transition"
            >
              <f.icon className={`h-6 w-6 ${f.accent}`} />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold">From blank file to deployed contract in minutes.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
              <div className="text-sm font-mono text-red-400">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-gray-400">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack strip */}
      <section id="stack" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-r from-red-500/10 via-transparent to-purple-500/10 p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Runs on your rails.</h2>
              <p className="mt-3 text-gray-400">
                Monaco Editor · ethers v6 · Avalanche Fuji C-Chain · any OpenAI-compatible endpoint
                (OpenAI, Groq, OpenRouter, Ollama, LM Studio). No backend. No lock-in. No telemetry.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              {["Monaco", "React", "ethers v6", "Avalanche Fuji", "OpenAI-compatible", "jsPDF"].map((s) => (
                <Badge key={s} variant="outline" className="border-gray-700 bg-gray-900/50 text-gray-300">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold">Ready to audit like an adult?</h2>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          Open the IDE, paste a contract, and let the AI show you what it sees.
        </p>
        <Link to="/ide" className="inline-block mt-8">
          <Button size="lg" className="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30">
            Launch Avalanche Scribe <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </section>

      <footer className="relative z-10 border-t border-gray-900 mt-8">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} Avalanche Scribe. Not affiliated with Ava Labs.</div>
          <div className="flex items-center gap-4">
            <a href="https://faucet.avax.network/" target="_blank" rel="noreferrer" className="hover:text-white">Fuji faucet</a>
            <a href="https://testnet.snowtrace.io" target="_blank" rel="noreferrer" className="hover:text-white">Snowtrace</a>
            <Link to="/ide" className="hover:text-white">IDE</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}