import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExplainInput,
  buildPrompt,
  buildTemplateSummary,
} from './ai-prompt.util';

export interface ExplainResult {
  summary: string;
  engine: 'ollama' | 'template';
}

@Injectable()
export class OllamaClient {
  private readonly logger = new Logger(OllamaClient.name);

  constructor(private readonly config: ConfigService) {}

  // never throws: if Ollama fails, the template text is returned instead
  async explain(input: ExplainInput): Promise<ExplainResult> {
    const url = this.config.get<string>('OLLAMA_URL') ?? 'http://localhost:11434';
    const model = this.config.get<string>('OLLAMA_MODEL') ?? 'qwen2.5:1.5b';
    const timeoutMs = Number(this.config.get('OLLAMA_TIMEOUT_MS') ?? 60000);

    try {
      const res = await fetch(`${url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: buildPrompt(input),
          stream: false,
          options: { temperature: 0.2, num_predict: 150 },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`Ollama answered ${res.status}`);

      const data = (await res.json()) as { response?: string };
      const text = data.response?.trim();
      if (!text) throw new Error('Ollama returned an empty answer');

      return { summary: text, engine: 'ollama' };
    } catch (err) {
      this.logger.warn(`Ollama unavailable, using template: ${String(err)}`);
      return { summary: buildTemplateSummary(input), engine: 'template' };
    }
  }
}