// lib/cf-ai.ts
// Re-exporting from lib/ai.js for backwards compatibility

import { callAI as universalCallAI, parseJSON as universalParseJSON, checkRateLimit } from './ai';

export interface AIOptions {
  maxTokens?: number;
  temperature?: number;
  userId?: string;
}

export async function callAI(
  system: string,
  user: string,
  options: AIOptions = {}
): Promise<string> {
  return universalCallAI({
    system,
    user,
    maxTokens: options.maxTokens ?? 800,
    userId: options.userId ?? 'anonymous'
  });
}

export function parseJSON<T>(raw: string): T | null {
  return universalParseJSON(raw) as T | null;
}

export async function callCfAI(
  prompt: string,
  options: AIOptions = {}
): Promise<string> {
  return universalCallAI({
    system: 'You are a helpful AI assistant.',
    user: prompt,
    maxTokens: options.maxTokens ?? 800,
    userId: options.userId ?? 'anonymous'
  });
}

export function parseCfAIJson<T>(raw: string): T | null {
  return universalParseJSON(raw) as T | null;
}

export { checkRateLimit };
export default { callAI, parseJSON, callCfAI, parseCfAIJson };
