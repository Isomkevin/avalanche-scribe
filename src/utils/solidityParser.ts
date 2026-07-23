
import { CodeRange } from '@/hooks/useMonacoDecorations';

export interface SolidityFunction {
  name: string;
  range: CodeRange;
  signature: string;
  params: SolidityParam[];
  stateMutability: 'pure' | 'view' | 'payable' | 'nonpayable';
  isConstructor?: boolean;
}

export interface SolidityParam {
  name: string;
  type: string;
}

const STATE_MUTABILITIES = ['pure', 'view', 'payable'] as const;

export function parseFunctionSignature(header: string): {
  name: string;
  params: SolidityParam[];
  stateMutability: 'pure' | 'view' | 'payable' | 'nonpayable';
  isConstructor: boolean;
} | null {
  const constructorMatch = header.match(/constructor\s*\(([^)]*)\)/);
  if (constructorMatch) {
    return {
      name: 'constructor',
      params: parseParams(constructorMatch[1]),
      stateMutability: /payable/.test(header) ? 'payable' : 'nonpayable',
      isConstructor: true,
    };
  }
  const m = header.match(/function\s+(\w+)\s*\(([^)]*)\)([^{;]*)/);
  if (!m) return null;
  const [, name, paramsRaw, tail] = m;
  const mutability =
    STATE_MUTABILITIES.find((s) => new RegExp(`\\b${s}\\b`).test(tail)) ?? 'nonpayable';
  return {
    name,
    params: parseParams(paramsRaw),
    stateMutability: mutability,
    isConstructor: false,
  };
}

function parseParams(raw: string): SolidityParam[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  return trimmed.split(',').map((p, i) => {
    const parts = p.trim().split(/\s+/).filter((x) => !['memory', 'calldata', 'storage', 'indexed'].includes(x));
    const type = parts[0] ?? 'unknown';
    const name = parts[parts.length - 1] && parts.length > 1 ? parts[parts.length - 1] : `arg${i}`;
    return { type, name };
  });
}

export function defaultArgForType(type: string): string {
  if (/^u?int/.test(type)) return '0';
  if (type === 'bool') return 'false';
  if (type === 'address') return '0x0000000000000000000000000000000000000000';
  if (type.startsWith('bytes')) return '0x';
  if (type === 'string') return '';
  if (type.endsWith('[]')) return '[]';
  return '';
}

export const parseSolidityFunctions = (code: string): SolidityFunction[] => {
  const lines = code.split('\n');
  const functions: SolidityFunction[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look at a small window so we can capture headers that span lines.
    const headerCandidate = lines.slice(i, Math.min(i + 4, lines.length)).join(' ');
    const parsed = parseFunctionSignature(headerCandidate);
    if (parsed && (line.startsWith('function ') || line.startsWith('constructor'))) {
      const startLine = i + 1;
      
      // Find the end of the function by counting braces
      let braceCount = 0;
      let endLine = startLine;
      let foundFirstBrace = false;
      
      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        
        // Count opening braces
        const openBraces = (currentLine.match(/{/g) || []).length;
        const closeBraces = (currentLine.match(/}/g) || []).length;
        
        braceCount += openBraces - closeBraces;
        
        if (openBraces > 0) foundFirstBrace = true;
        
        if (foundFirstBrace && braceCount === 0) {
          endLine = j + 1;
          break;
        }
      }
      
      functions.push({
        name: parsed.name,
        range: { startLine, endLine },
        signature: headerCandidate.match(/(function[^\{;]*|constructor[^\{;]*)/)?.[0]?.trim() ?? parsed.name,
        params: parsed.params,
        stateMutability: parsed.stateMutability,
        isConstructor: parsed.isConstructor,
      });
    }
  }
  
  return functions;
};

export const getExplanationForFunction = (
  functionName: string,
  code: string
): string => {
  // This would normally call an AI service, but for now return structured explanations
  const functionExplanations: Record<string, string> = {
    'set': 'This function updates the stored data value and emits a DataStored event. It accepts a uint256 parameter and assigns it to the private storedData variable.',
    'get': 'This is a view function that returns the current value of storedData without modifying the contract state. It costs no gas when called externally.',
    'increment': 'This function increases the stored data by 1 and emits a DataStored event with the new value. It modifies the contract state.',
    'constructor': 'The constructor initializes the contract with an initial value for storedData. It runs only once when the contract is deployed.',
  };
  
  return functionExplanations[functionName] || 
    `This function "${functionName}" performs specific contract operations. Analysis requires connection to AI service for detailed explanation.`;
};
