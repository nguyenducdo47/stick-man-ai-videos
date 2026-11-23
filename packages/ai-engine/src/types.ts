export interface LLMProvider {
  checkHealth(): Promise<{ reachable: boolean; error?: string }>;
  listModels(): Promise<string[]>;
  verifyModel(model: string): Promise<boolean>;
  generateText(prompt: string, options?: GenerateTextOptions): Promise<string>;
}

export interface GenerateTextOptions {
  model?: string;
  system?: string;
  temperature?: number;
  timeoutMs?: number;
}