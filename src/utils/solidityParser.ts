
import { CodeRange } from '@/hooks/useMonacoDecorations';

export interface SolidityFunction {
  name: string;
  range: CodeRange;
  signature: string;
}

export const parseSolidityFunctions = (code: string): SolidityFunction[] => {
  const lines = code.split('\n');
  const functions: SolidityFunction[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match function declarations (simplified regex)
    const functionMatch = line.match(/function\s+(\w+)\s*\([^)]*\)/);
    if (functionMatch) {
      const functionName = functionMatch[1];
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
        name: functionName,
        range: { startLine, endLine },
        signature: functionMatch[0],
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
