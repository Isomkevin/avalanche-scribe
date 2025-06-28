import { Request, Response } from "express";
import OpenAIService from "../services/openaiService";
import OpenZeppelinDefenderService from "../services/openzeppelinDefenderService";
import AvalancheRpcService from "../services/avalancheRpcService";
import ClaudeService from "../services/claudeService";
import { ApiResponse, ExplainRequest, DebugRequest, SimulateRequest } from "../types";

class IndexController {
  private openAIService: OpenAIService;
  private openZeppelinDefenderService: OpenZeppelinDefenderService;
  private avalancheRpcService: AvalancheRpcService;
  private claudeService: ClaudeService;

  constructor() {
    this.openAIService = new OpenAIService(process.env.OPENAI_API_KEY);
    this.openZeppelinDefenderService = new OpenZeppelinDefenderService(process.env.OPENZEPP_API_KEY, process.env.OPENZEPP_API_SECRET);
    this.avalancheRpcService = new AvalancheRpcService(process.env.AVALANCHE_RPC_URL);
    this.claudeService = new ClaudeService(process.env.CLAUDE_API_KEY);
  }

  async explain(req: Request<{}, ApiResponse<string>, ExplainRequest>, res: Response<ApiResponse<string>>) {
    try {
      const { code } = req.body;
      const explanation = await this.openAIService.generateExplanation(code);
      res.json({ success: true, data: explanation });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to explain code", details: err.message });
    }
  }

  async debug(req: Request<{}, ApiResponse<string>, DebugRequest>, res: Response<ApiResponse<string>>) {
    try {
      const { contractAddress } = req.body;
      const debugResult = await this.openZeppelinDefenderService.analyzeContract(contractAddress);
      res.json({ success: true, data: debugResult });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to debug contract", details: err.message });
    }
  }

  async simulate(req: Request<{}, ApiResponse<any>, SimulateRequest>, res: Response<ApiResponse<any>>) {
    try {
      const { contractAddress, method, params } = req.body;
      const simulation = await this.avalancheRpcService.simulateTransaction({ to: contractAddress, data: method, args: params });
      res.json({ success: true, data: simulation });
    } catch (err) {
      res.status(500).json({ success: false, error: "Simulation failed", details: err.message });
    }
  }

  async decorations(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { code, explanations } = req.body;
      const decorations = await this.claudeService.explainSolidityCode(code);
      res.json({ success: true, data: decorations });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to get decorations", details: err.message });
    }
  }
}

export default new IndexController();