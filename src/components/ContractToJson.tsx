// components/ContractToJson.tsx
import { useEffect } from 'react';
import { chatCompletion, loadSettings, hasCredentials } from '@/lib/byok';

interface ContractToJsonProps {
  contractCode: string;
  onParsed: (jsonResult: any) => void;
  onError?: (error: string) => void;
}

function isValidContractJson(obj: any): boolean {
  // Basic structure check, expand as needed
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.contractName === 'string' &&
    typeof obj.solidityVersion === 'string' &&
    typeof obj.license === 'string' &&
    typeof obj.description === 'string' &&
    Array.isArray(obj.structure)
  );
}

const ContractToJson: React.FC<ContractToJsonProps> = ({
  contractCode,
  onParsed,
  onError,
}) => {
  useEffect(() => {
    const processContract = async () => {
      try {
        const settings = loadSettings();
        if (!hasCredentials(settings)) {
          onError?.('AI provider not configured. Open Settings to add your API key.');
          onParsed(null);
          return;
        }
        const prompt = `
You are an expert Solidity code analyst.

Analyze the following Solidity smart contract and return a structured JSON with:
- contractName
- solidityVersion
- license
- description
- structure: array of sections with keys:
  - section (title)
  - lines (line numbers as integers)
  - explanation (description of those lines)

Only return valid JSON.

--- CONTRACT START ---
${contractCode}
--- CONTRACT END ---
        `;

        const content = await chatCompletion(
          [{ role: 'user', content: prompt }],
          settings,
          { temperature: 0.2 }
        );

        // Strip common ```json fences if present.
        const cleaned = content.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
        let parsedJson: any = null;
        try {
          parsedJson = JSON.parse(cleaned);
        } catch {
          if (onError) onError('Failed to parse AI response as JSON.');
          return;
        }

        if (!isValidContractJson(parsedJson)) {
          if (onError) onError('AI response JSON is missing required fields.');
          return;
        }

        onParsed(parsedJson);
      } catch (error: any) {
        onError?.(error?.message || 'Failed to process contract.');
        onParsed(null);
      }
    };

    if (contractCode) processContract();
  }, [contractCode, onParsed, onError]);

  return null; // No UI rendering
};

export default ContractToJson;
