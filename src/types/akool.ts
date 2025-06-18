export interface AkoolGenerateRequest {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'anime' | 'abstract';
  aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3';
  quality?: 'standard' | 'high' | 'ultra';
}

export interface AkoolGenerationResult {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result_url?: string;
}

export interface AkoolApiResponse {
  code: number;
  message: string;
  data?: AkoolGenerationResult;
}

export interface AkoolErrorResponse {
  error: string;
}
