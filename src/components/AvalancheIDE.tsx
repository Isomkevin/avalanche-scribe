import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Bug, BookOpen, Mountain, Code, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMonacoDecorations, ExplanationWithRange, CodeRange } from '@/hooks/useMonacoDecorations';
import { parseSolidityFunctions, getExplanationForFunction } from '@/utils/solidityParser';
import ExplanationCard from './ExplanationCard';
import '../styles/monaco-highlights.css';

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

    setIsLoading(prev => ({ ...prev, explain: true }));

    try {
      // Simulate backend API call with structured response
      const mockResponse = {
        explanation: `**AI Code Analysis**\n\nThis code segment implements smart contract functionality with the following characteristics:\n\n• State variable management\n• Event emission patterns\n• Access control considerations\n• Gas optimization opportunities\n\n*Note: Connect to AI service for detailed analysis.*`,
        startLine: 1,
        endLine: 10,
      };

      const explanationWithRange: ExplanationWithRange = {
        id: `explain-${Date.now()}`,
        explanation: mockResponse.explanation,
        range: {
          startLine: mockResponse.startLine,
          endLine: mockResponse.endLine
        },
      };

      setExplanations(prev => [explanationWithRange, ...prev.slice(0, 2)]);
      handleExplanationClick(explanationWithRange.range, explanationWithRange.id);

      toast({
        title: "Code explained",
        description: "AI analysis complete with line highlighting"
      });
    } catch (error) {
      console.error('Explanation error:', error);
      toast({
        title: "Error generating explanation",
        description: "Please try again or connect backend API"
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

    setIsLoading(prev => ({ ...prev, debug: true }));

    try {
      // Backend API call - replace with actual endpoint
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToDebug,
          contractCode: contractCode,
          language: 'solidity'
        })
      });

      if (!response.ok) throw new Error('Failed to get debug suggestions');

      const data = await response.json();
      setDebugSuggestions(data.suggestions || 'Debug suggestions will appear here...');

      toast({
        title: "Debug analysis complete",
        description: "AI suggestions generated"
      });
    } catch (error) {
      console.error('Debug error:', error);
      setDebugSuggestions(`**Debug Suggestions**

🔍 **Potential Issues Found:**
• Check for reentrancy vulnerabilities
• Validate input parameters
• Consider overflow/underflow protection
• Review access control modifiers

🛠️ **Recommendations:**
• Use OpenZeppelin's SafeMath library
• Add proper event emissions
• Implement circuit breakers
• Consider gas optimization

⚡ **Avalanche-Specific:**
• Optimize for C-Chain deployment
• Consider subnet-specific features
• Review gas pricing on Fuji testnet

*Note: This is a placeholder response. Connect to OpenZeppelin Defender API for detailed analysis.*`);

      toast({
        title: "Using placeholder response",
        description: "Connect backend API for real debug analysis"
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

    // Extract function name (simple regex - can be enhanced)
    const functionMatch = functionToSimulate.match(/function\s+(\w+)/);
    const functionName = functionMatch ? functionMatch[1] : 'unknown';
    setSelectedFunction(functionName);

    setIsLoading(prev => ({ ...prev, simulate: true }));

    try {
      // Backend API call for Avalanche Fuji simulation
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionName,
          contractCode,
          arguments: [], // Will be enhanced with dynamic argument input
          network: 'fuji-testnet'
        })
      });

      if (!response.ok) throw new Error('Failed to simulate on Fuji');

      const data = await response.json();
      setSimulationOutput(data.output || 'Simulation results will appear here...');

      toast({
        title: "Simulation complete",
        description: `Function ${functionName} executed on Fuji testnet`
      });
    } catch (error) {
      console.error('Simulation error:', error);
      setSimulationOutput(`**Avalanche Fuji Testnet Simulation**

🔗 **Network:** Fuji Testnet (Chain ID: 43113)
📝 **Function:** ${functionName}
⏱️ **Timestamp:** ${new Date().toISOString()}

📊 **Simulation Results:**
• Gas Estimate: ~45,000 gas
• Execution Status: Success (simulated)
• State Changes: Contract storage updated
• Events Emitted: DataStored event

💰 **Cost Analysis:**
• Gas Price: 25 nAVAX (estimated)
• Total Cost: ~0.001125 AVAX

🌐 **Fuji Explorer:**
• Transaction Hash: 0x1234...abcd (placeholder)
• Block Number: #8,523,891 (simulated)

*Note: This is a placeholder response. Connect to Avalanche RPC for real simulation.*`);

      toast({
        title: "Using placeholder simulation",
        description: "Connect Avalanche RPC for real testnet interaction"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, simulate: false }));
    }
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
            <img src="/public/icons/Avax_logo.png" alt="AVAX Icon" className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Avalanche Smart Contract IDE</h1>
              <p className="text-sm text-gray-400">AI-Powered Debugging & Simulation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-red-500/20 text-red-400">
              Fuji Testnet
            </Badge>
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              Connected
            </Badge>
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
                  <CardTitle className="text-sm flex items-center justify-between">
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
                  <CardTitle className="text-sm flex items-center">
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
                  <CardTitle className="text-sm flex items-center">
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
