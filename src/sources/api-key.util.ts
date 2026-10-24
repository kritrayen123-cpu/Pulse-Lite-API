import { createHash, randomBytes } from 'crypto';

// 24 random bytes = 192 bits of entropy, e.g. "pk_3f9a...(48 hex chars)"
export function generateApiKey(): string {
  return `pk_${randomBytes(24).toString('hex')}`;
}

// deterministic on purpose: ingest looks the source up by this hash
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}