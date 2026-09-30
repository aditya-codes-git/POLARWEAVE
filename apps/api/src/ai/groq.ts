import { env, hasGroq } from '../config/env.js';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callGroqChat(
  messages: GroqMessage[],
  options?: {
    model?: string;
    temperature?: number;
    jsonMode?: boolean;
    maxTokens?: number;
  }
): Promise<string> {
  if (!hasGroq) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const model = options?.model || 'openai/gpt-oss-120b';
  const temperature = options?.temperature ?? 0.2;
  const jsonMode = options?.jsonMode ?? false;

  const payload: Record<string, any> = {
    model,
    messages,
    temperature,
    max_tokens: options?.maxTokens || 4096
  };

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API request failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error('No content returned from Groq');
  }

  return choice.message.content;
}
