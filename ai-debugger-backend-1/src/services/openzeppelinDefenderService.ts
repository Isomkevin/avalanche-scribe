class OpenZeppelinDefenderService {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.openzeppelin.com';
  }

  async analyzeContract(contractAddress) {
    const response = await this._makeRequest(`/defender/analyze/${contractAddress}`, 'GET');
    return response.data;
  }

  async checkSecurity(contractAddress) {
    const response = await this._makeRequest(`/defender/security/${contractAddress}`, 'GET');
    return response.data;
  }

  async _makeRequest(endpoint, method, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const options = {
      method,
      headers,
      body: data ? JSON.stringify(data) : null,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  }
}

export default OpenZeppelinDefenderService;