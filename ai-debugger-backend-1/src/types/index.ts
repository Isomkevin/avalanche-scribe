export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DebugRequest {
  contractAddress: string;
  abi: any;
  inputData: string;
}

export interface ExplainRequest {
  code: string;
}

export interface SimulateRequest {
  contractAddress: string;
  method: string;
  params: any[];
}

export interface UploadAbiRequest {
  contractAddress: string;
  abi: any;
}

export interface SecurityCheckRequest {
  contractAddress: string;
}