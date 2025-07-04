// components/ContractToJson.tsx
import { useEffect } from 'react';
import axios from 'axios';

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

        const response = await axios.post(
          'https://azureai3111594496.openai.azure.com/openai/deployments/MeallensAI/chat/completions?api-version=2025-01-01-preview',
          {
            model: 'MeallensAI',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
          },
          {
            headers: {
              'api-key': '7HDDKgz8kbcwyhrMVuB1uhlWGjRYusdLkMKWjmtBoWDKJ0slp7QlJQQJ99BCACHYHv6XJ3w3AAAAACOGeRlr',
              'Content-Type': 'application/json',
            },
          }
        );

        let parsedJson = null;
        try {
          parsedJson = JSON.parse(response.data.choices[0].message.content);
        } catch (parseErr) {
          if (onError) onError('Failed to parse AI response as JSON.');
          return;
        }

        if (!isValidContractJson(parsedJson)) {
          if (onError) onError('AI response JSON is missing required fields.');
          return;
        }

        onParsed(parsedJson);
      } catch (error: any) {
        if (onError) {
          onError(
            error?.response?.data?.error?.message ||
              error?.message ||
              'Failed to process contract.'
          );
        }
        onParsed(null);
      }
    };

    if (contractCode) processContract();
  }, [contractCode, onParsed, onError]);

  return null; // No UI rendering
};

export default ContractToJson;
