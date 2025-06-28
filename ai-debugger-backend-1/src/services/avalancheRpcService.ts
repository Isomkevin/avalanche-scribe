import { ethers } from 'ethers';

class AvalancheRpcService {
  private provider: ethers.providers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  async simulateTransaction(transaction: ethers.providers.TransactionRequest) {
    try {
      const response = await this.provider.call(transaction);
      return response;
    } catch (error) {
      throw new Error(`Simulation failed: ${error.message}`);
    }
  }

  async getBlockNumber() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      throw new Error(`Failed to fetch block number: ${error.message}`);
    }
  }

  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return gasPrice;
    } catch (error) {
      throw new Error(`Failed to fetch gas price: ${error.message}`);
    }
  }
}

export default AvalancheRpcService;