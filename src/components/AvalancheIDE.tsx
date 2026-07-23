import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Bug, BookOpen, Code, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMonacoDecorations, ExplanationWithRange, CodeRange } from '@/hooks/useMonacoDecorations';
import { parseSolidityFunctions, getExplanationForFunction } from '@/utils/solidityParser';
import ExplanationCard from './ExplanationCard';
import '../styles/monaco-highlights.css';
import { chatCompletion, hasCredentials, loadSettings } from '@/lib/byok';
import ConnectWallet from './ConnectWallet';
import SettingsDialog from './SettingsDialog';
import TopUp from './TopUp';
import { useWallet } from '@/hooks/useWallet';
import { FUJI, readOnlyProvider } from '@/lib/web3';
import { formatUnits } from 'ethers';

const AvalancheIDE = () => {
  const [contractCode, setContractCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(uint256 value);
    
    constructor(uint256 initialValue) {
        storedData = initialValue;
    }
    
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(x);
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
    
    function increment() public {
        storedData += 1;
        emit DataStored(storedData);
    }
}`);

  const [explanation, setExplanation] = useState('');
  const [debugSuggestions, setDebugSuggestions] = useState('');
  const [simulationOutput, setSimulationOutput] = useState('');
  const [explanations, setExplanations] = useState<ExplanationWithRange[]>([]);
  const [activeExplanationId, setActiveExplanationId] = useState<string | null>(null);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [isLoading, setIsLoading] = useState({
    explain: false,
    debug: false,
    simulate: false
  });

  const editorRef = useRef(null);
  const { toast } = useToast();
  const {
    setEditor,
    highlightAndScroll,
    clearHighlights
  } = useMonacoDecorations();
  const { address, isFuji } = useWallet();

  // Monaco Editor setup with Solidity syntax highlighting
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setEditor(editor);

    // Register Solidity language if not already registered
    if (!monaco.languages.getLanguages().some((lang: any) => lang.id === 'solidity')) {
      monaco.languages.register({ id: 'solidity' });

      // Basic Solidity syntax highlighting
      monaco.languages.setMonarchTokensProvider('solidity', {
        keywords: [
          'pragma', 'solidity', 'contract', 'function', 'modifier', 'event', 'struct', 'enum',
          'mapping', 'public', 'private', 'internal', 'external', 'pure', 'view', 'payable',
          'returns', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue',
          'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256',
          'int', 'int8', 'int16', 'int32', 'int64', 'int128', 'int256',
          'address', 'bool', 'string', 'bytes', 'bytes32', 'true', 'false'
        ],
        tokenizer: {
          root: [
            [/[a-zA-Z_$][\w$]*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier'
              }
            }],
            [/".*?"/, 'string'],
            [/'.*?'/, 'string'],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],
            [/\d+/, 'number'],
            [/[{}()\[\]]/, '@brackets'],
            [/[<>]=?/, 'operator'],
            [/[+\-*/%&|^~!=<>]/, 'operator']
          ],
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
          ]
        }
      });
    }

    // Add click handler for contextual explanations
    editor.onMouseDown((e: any) => {
      if (e.target.type === 1) { // Line content
        const position = e.target.position;
        handleLineClick(position.lineNumber);
      }
    });
  };

  const handleLineClick = (lineNumber: number) => {
    const functions = parseSolidityFunctions(contractCode);
    const clickedFunction = functions.find(
      func => lineNumber >= func.range.startLine && lineNumber <= func.range.endLine
    );

    if (clickedFunction) {
      const explanation = getExplanationForFunction(clickedFunction.name, contractCode);
      const explanationWithRange: ExplanationWithRange = {
        id: `line-${lineNumber}-${Date.now()}`,
        explanation: `**${clickedFunction.name}()** (Lines ${clickedFunction.range.startLine}-${clickedFunction.range.endLine})\n\n${explanation}`,
        range: clickedFunction.range,
      };

      setExplanations(prev => [explanationWithRange, ...prev.slice(0, 2)]); // Keep only 3 recent
      handleExplanationClick(clickedFunction.range, explanationWithRange.id);

      toast({
        title: "Contextual explanation generated",
        description: `Analysis for ${clickedFunction.name}() function`,
      });
    }
  };

  const handleExplanationClick = (range: CodeRange, explanationId: string) => {
    setActiveExplanationId(explanationId);
    highlightAndScroll(range, true);
  };

  const handleExplain = async () => {
    const codeToExplain = getSelectedCodeOrFunction();
    if (!codeToExplain.trim()) {
      toast({
        title: "No code selected",
        description: "Please select code or place cursor inside a function",
        variant: "destructive"
      });
      return;
    }

    const settings = loadSettings();
    if (!hasCredentials(settings)) {
      toast({
        title: "Add your AI keys",
        description: "Open Settings to configure a provider.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, explain: true }));

    try {
      const content = await chatCompletion(
        [
          {
            role: 'system',
            content:
              'You are a senior Solidity auditor. Explain code clearly and concisely using markdown. Cover: purpose, state changes, control flow, and any risks. Keep it under 250 words.',
          },
          { role: 'user', content: `Explain this Solidity code:\n\n\`\`\`solidity\n${codeToExplain}\n\`\`\`` },
        ],
        settings
      );

      const range = getSelectionRange();
      const explanationWithRange: ExplanationWithRange = {
        id: `explain-${Date.now()}`,
        explanation: content,
        range,
      };

      setExplanations(prev => [explanationWithRange, ...prev.slice(0, 2)]);
      handleExplanationClick(explanationWithRange.range, explanationWithRange.id);

      toast({
        title: "Code explained",
        description: `via ${settings.provider ?? 'AI'} · ${settings.model}`,
      });
    } catch (error: any) {
      console.error('Explanation error:', error);
      toast({
        title: "Error generating explanation",
        description: error?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, explain: false }));
    }
  };

  const handleDebug = async () => {
    const codeToDebug = getSelectedCodeOrFunction();
    if (!codeToDebug.trim()) {
      toast({
        title: "No code selected",
        description: "Please select code or place cursor inside a function",
        variant: "destructive"
      });
      return;
    }

    const settings = loadSettings();
    if (!hasCredentials(settings)) {
      toast({
        title: "Add your AI keys",
        description: "Open Settings to configure a provider.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, debug: true }));

    try {
      const content = await chatCompletion(
        [
          {
            role: 'system',
            content:
              'You are a security-focused Solidity auditor. Analyze the provided code for: (1) vulnerabilities (reentrancy, integer issues, access control, oracle/timestamp, denial-of-service), (2) gas optimizations, (3) Avalanche C-Chain / Fuji-specific considerations. Group findings by Critical / High / Medium / Low / Info. Use concise markdown with bullet points.',
          },
          {
            role: 'user',
            content: `Analyze this Solidity code. Full contract for context is below the selection.\n\n### Selection\n\`\`\`solidity\n${codeToDebug}\n\`\`\`\n\n### Full contract\n\`\`\`solidity\n${contractCode}\n\`\`\``,
          },
        ],
        settings,
        { temperature: 0.1 }
      );
      setDebugSuggestions(content);

      toast({
        title: "Debug analysis complete",
        description: `via ${settings.provider ?? 'AI'} · ${settings.model}`,
      });
    } catch (error: any) {
      console.error('Debug error:', error);
      toast({
        title: 'Debug failed',
        description: error?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, debug: false }));
    }
  };

  const handleSimulate = async () => {
    const functionToSimulate = getSelectedCodeOrFunction();
    if (!functionToSimulate.trim()) {
      toast({
        title: "No function selected",
        description: "Please select a function to simulate",
        variant: "destructive"
      });
      return;
    }

    const functionMatch = functionToSimulate.match(/function\s+(\w+)/);
    const functionName = functionMatch ? functionMatch[1] : 'unknown';
    setSelectedFunction(functionName);

    setIsLoading(prev => ({ ...prev, simulate: true }));

    try {
      // Real Fuji chain state
      const rpc = readOnlyProvider();
      const [blockNumber, feeData, network] = await Promise.all([
        rpc.getBlockNumber(),
        rpc.getFeeData(),
        rpc.getNetwork(),
      ]);
      let walletBalance = 'not connected';
      if (address) {
        try {
          const bal = await rpc.getBalance(address);
          walletBalance = `${formatUnits(bal, 18)} AVAX`;
        } catch { /* ignore */ }
      }
      const gasPriceGwei = feeData.gasPrice ? formatUnits(feeData.gasPrice, 'gwei') : 'n/a';

      // AI-driven static simulation reasoning
      const settings = loadSettings();
      let aiSection = '';
      if (hasCredentials(settings)) {
        try {
          aiSection = await chatCompletion(
            [
              {
                role: 'system',
                content:
                  'You are simulating a Solidity function on Avalanche Fuji testnet. Given the full contract and target function, predict: gas estimate range, state changes, events emitted, revert conditions, and likely output. Reply in concise markdown. Do NOT invent tx hashes.',
              },
              {
                role: 'user',
                content: `Function: \`${functionName}\`\n\nContract:\n\`\`\`solidity\n${contractCode}\n\`\`\``,
              },
            ],
            settings,
            { temperature: 0.1 }
          );
        } catch (err: any) {
          aiSection = `_AI analysis unavailable: ${err?.message ?? 'error'}_`;
        }
      } else {
        aiSection = '_Add your AI keys in Settings for a full behavioral simulation._';
      }

      setSimulationOutput(
`**Avalanche Fuji Testnet — Live Chain State**

🔗 Network: ${network.name || 'Fuji'} (chainId ${network.chainId})
📦 Latest block: #${blockNumber.toLocaleString()}
⛽ Gas price: ${gasPriceGwei} gwei
👛 Wallet: ${address ?? 'not connected'} ${address && !isFuji ? '(wrong network)' : ''}
💰 Balance: ${walletBalance}
📝 Function: \`${functionName}\`
⏱ Timestamp: ${new Date().toISOString()}

---

### AI Behavioral Simulation
${aiSection}

---
_To submit a real transaction, deploy the contract to Fuji and interact via the deployed address._`
      );

      toast({
        title: "Simulation complete",
        description: `Fuji block #${blockNumber} · gas ${gasPriceGwei} gwei`,
      });
    } catch (error: any) {
      console.error('Simulation error:', error);
      toast({
        title: 'Simulation failed',
        description: error?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, simulate: false }));
    }
  };

  // Compute a CodeRange from the current editor selection, falling back to whole doc.
  const getSelectionRange = (): CodeRange => {
    const editor = editorRef.current as any;
    if (!editor) return { startLine: 1, endLine: 1 };
    const sel = editor.getSelection();
    if (sel && (sel.startLineNumber !== sel.endLineNumber || sel.startColumn !== sel.endColumn)) {
      return { startLine: sel.startLineNumber, endLine: sel.endLineNumber };
    }
    const model = editor.getModel();
    if (!model) return { startLine: 1, endLine: 1 };
    const line = editor.getPosition()?.lineNumber ?? 1;
    // Try to detect enclosing function bounds via the parser.
    const funcs = parseSolidityFunctions(contractCode);
    const enclosing = funcs.find((f) => line >= f.range.startLine && line <= f.range.endLine);
    return enclosing ? enclosing.range : { startLine: 1, endLine: model.getLineCount() };
  };

  // Get selected text or current function context
  const getSelectedCodeOrFunction = () => {
    if (!editorRef.current) return '';

    const selection = editorRef.current.getSelection();
    const selectedText = editorRef.current.getModel().getValueInRange(selection);

    if (selectedText.trim()) {
      return selectedText;
    }

    // If no selection, try to detect current function
    const position = editorRef.current.getPosition();
    const model = editorRef.current.getModel();
    const lineCount = model.getLineCount();

    // Simple function detection (can be enhanced)
    let functionStart = position.lineNumber;
    let functionEnd = position.lineNumber;

    // Find function start
    for (let i = position.lineNumber; i >= 1; i--) {
      const line = model.getLineContent(i);
      if (line.includes('function ')) {
        functionStart = i;
        break;
      }
    }

    // Find function end
    let braceCount = 0;
    for (let i = functionStart; i <= lineCount; i++) {
      const line = model.getLineContent(i);
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      if (braceCount === 0 && i > functionStart) {
        functionEnd = i;
        break;
      }
    }

    return model.getValueInRange({
      startLineNumber: functionStart,
      startColumn: 1,
      endLineNumber: functionEnd,
      endColumn: model.getLineMaxColumn(functionEnd)
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/icons/AVAX_logo.png" alt="AVAX Icon" className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Avalanche Smart Contract IDE</h1>
              <p className="text-sm text-gray-400">AI-Powered Debugging & Simulation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-red-500/20 text-red-400">
              {FUJI.name}
            </Badge>
            <SettingsDialog />
            <ConnectWallet />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Monaco Editor */}
        <div className="flex-1 border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span className="text-sm font-medium">Contract Editor</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExplain}
                  disabled={isLoading.explain}
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                >
                  {isLoading.explain ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <BookOpen className="h-3 w-3 mr-1" />
                  )}
                  Explain
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDebug}
                  disabled={isLoading.debug}
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                >
                  {isLoading.debug ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Bug className="h-3 w-3 mr-1" />
                  )}
                  Debug
                </Button>
                <Button
                  size="sm"
                  onClick={handleSimulate}
                  disabled={isLoading.simulate}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isLoading.simulate ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Play className="h-3 w-3 mr-1" />
                  )}
                  Simulate on Fuji
                </Button>
              </div>
            </div>
          </div>

          <div className="h-[calc(100%-60px)]">
            <Editor
              height="100%"
              defaultLanguage="solidity"
              theme="vs-dark"
              value={contractCode}
              onChange={(value) => setContractCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                bracketPairColorization: { enabled: true }
              }}
            />
          </div>
        </div>

        {/* Right Panel - AI Analysis Tabs */}
        <div className="w-96 bg-gray-900">
          <Tabs defaultValue="explanation" className="h-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="explanation" className="text-xs">
                AI Explain
              </TabsTrigger>
              <TabsTrigger value="debug" className="text-xs">
                Debug
              </TabsTrigger>
              <TabsTrigger value="simulation" className="text-xs">
                Simulate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explanation" className="h-[calc(100%-40px)] p-0">
              <Card className="h-full bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                      Synchronized Explanations
                    </div>
                    {explanations.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          clearHighlights();
                          setActiveExplanationId(null);
                        }}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Clear Highlights
                      </Button>
                    )}
                  </CardTitle>
                  <div className="text-xs text-gray-400">
                    Click on code lines or explanations to highlight and navigate
                  </div>
                </CardHeader>
                <Separator className="bg-gray-800" />
                <CardContent className="p-4 h-[calc(100%-100px)] overflow-auto space-y-3">
                  {explanations.length > 0 ? (
                    explanations.map((exp) => (
                      <ExplanationCard
                        key={exp.id}
                        explanation={exp}
                        isActive={activeExplanationId === exp.id}
                        onClick={(range) => handleExplanationClick(range, exp.id)}
                      />
                    ))
                  ) : (
                    <div className="text-sm text-gray-300">
                      <div className="mb-3">
                        <strong>💡 Getting Started:</strong>
                      </div>
                      <ul className="text-xs space-y-1 text-gray-400">
                        <li>• Click on any function to get contextual explanation</li>
                        <li>• Select code and click "Explain" for detailed analysis</li>
                        <li>• Explanations will highlight relevant code lines</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="debug" className="h-[calc(100%-40px)] p-0">
              <Card className="h-full bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center text-white">
                    <Bug className="h-4 w-4 mr-2 text-yellow-400" />
                    Debug Suggestions
                  </CardTitle>
                </CardHeader>
                <Separator className="bg-gray-800" />
                <CardContent className="p-4 h-[calc(100%-60px)] overflow-auto">
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">
                    {debugSuggestions || 'Select code and click "Debug" to get AI-powered security and optimization suggestions.'}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="simulation" className="h-[calc(100%-40px)] p-0">
              <Card className="h-full bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center text-white">
                    <Play className="h-4 w-4 mr-2 text-red-400" />
                    Fuji Simulation
                    {selectedFunction && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {selectedFunction}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <Separator className="bg-gray-800" />
                <CardContent className="p-4 h-[calc(100%-60px)] overflow-auto">
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">
                    {simulationOutput || 'Select a function and click "Simulate on Fuji" to test on Avalanche testnet.'}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AvalancheIDE;
