import type { GenerateTextOptions, LLMProvider } from './types.js';

export class MockLLMProvider implements LLMProvider {
  async checkHealth(): Promise<{ reachable: boolean; error?: string }> {
    return { reachable: true };
  }

  async listModels(): Promise<string[]> {
    return ['mock-llm'];
  }

  async verifyModel(model: string): Promise<boolean> {
    return model === 'mock-llm';
  }

  async generateText(_prompt: string, _options?: GenerateTextOptions): Promise<string> {
    throw new Error('MockLLMProvider.generateText is for tests only and must not mask real AI output.');
  }
}