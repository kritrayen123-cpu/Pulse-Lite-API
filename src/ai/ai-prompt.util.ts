export interface ExplainInput {
  source: string;
  metric: string;
  operator: 'gt' | 'lt';
  threshold: number;
  consecutiveReadings: number;
  severity: string;
  values: number[]; // newest first
}

function direction(operator: 'gt' | 'lt'): string {
  return operator === 'gt' ? 'above' : 'below';
}

export function buildPrompt(input: ExplainInput): string {
  return [
    'You are a monitoring assistant. Explain this incident in 2 or 3 short sentences.',
    'Say what happened, why it may matter, and one thing to check first.',
    'Do not invent facts that are not in the data. No greeting, no markdown.',
    '',
    `Source: ${input.source}`,
    `Metric: ${input.metric}`,
    `Rule: ${input.metric} ${direction(input.operator)} ${input.threshold} for ${input.consecutiveReadings} readings in a row`,
    `Severity: ${input.severity}`,
    `Readings that broke the rule (newest first): ${input.values.join(', ')}`,
  ].join('\n');
}

// used when Ollama is missing, slow or returns nothing
export function buildTemplateSummary(input: ExplainInput): string {
  return (
    `${input.metric} on ${input.source} stayed ${direction(input.operator)} ` +
    `${input.threshold} for ${input.consecutiveReadings} readings in a row ` +
    `(${input.values.join(', ')}). Severity: ${input.severity}. ` +
    `Check what changed on this machine around the time of the first reading.`
  );
}