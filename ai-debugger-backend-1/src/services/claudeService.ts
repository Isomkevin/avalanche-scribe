class ClaudeService {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.claude.ai/v1'; // Replace with the actual Claude API endpoint
  }

  async explainSolidityCode(code: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/explain`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.explanation;
  }

  async debugSolidityCode(code: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/debug`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.debugInfo;
  }

  async simulateSolidityCode(code: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/simulate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.simulationResult;
  }
}

export default ClaudeService;