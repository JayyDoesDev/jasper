import fs from 'node:fs';
import path from 'node:path';
import { BotConfig } from './config.js';

export interface LabeledExample {
  content: string;
  label: 'scam' | 'not_scam';
  reason?: string;
  id?: string;
  meta?: {
    channel?: string;
    authorAgeDays?: number;
    accountCreatedAt?: string;
  };
  weight?: number;
}

function readJsonl(file: string): LabeledExample[] {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

export function loadExamples(cfg: BotConfig) {
  const seedPath = path.join(process.cwd(), 'examples/seed_examples.jsonl');
  const learnedPath = path.join(process.cwd(), 'examples/learned_examples.jsonl');
  const seed = readJsonl(seedPath).slice(-cfg.fewShot.maxSeedExamples);
  let learned = readJsonl(learnedPath).slice(-cfg.fewShot.maxLearnedExamples);

  if (cfg.fewShot.prioritizeHardNegatives) {
    learned = learned.sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1));
  }

  return [...seed, ...learned].slice(-cfg.fewShot.maxExamplesPerPrompt);
}

export function buildSystemPrompt(examples: LabeledExample[]) {
  const criteria = [
    '- Requests for DMs, off-platform contacts, wallets, seeds, private keys.',
    '- Fake giveaways/airdrops, Nitro scams, payment/billing links.',
    '- Urgency, push to bypass moderators, or impersonation.',
    '- Links to suspicious domains or URL shorteners.',
    '- Language patterns indicative of social engineering.'
  ].join('\n');

  const ex = examples.map((e, i) => {
    const ctx = e.meta?.authorAgeDays != null ? ` (author_age_days=${e.meta.authorAgeDays})` : '';
    return `Example ${i + 1} [${e.label.toUpperCase()}]${ctx}:\n${e.content}\nReason: ${e.reason ?? 'n/a'}`;
  }).join('\n\n');

  const schema = `You are a security classifier. Output ONLY valid JSON matching:\n{\n  \"is_scam\": boolean,\n  \"confidence\": number,\n  \"reasons\": string[],\n  \"tags\": string[],\n  \"risk_factors\": {\n    \"impersonation\"?: number,\n    \"off_platform\"?: number,\n    \"credential_theft\"?: number,\n    \"malware_link\"?: number\n  }\n}`;

  return [
    schema,
    'Be conservative: only mark true when signals are clear. Prefer false if ambiguous.',
    'Do not include code fences or commentary. Return JSON only.',
    '',
    'Scam indicators:',
    criteria,
    '',
    'Few-shot guidance:',
    ex || '(no examples provided)'
  ].join('\n');
}

export function buildUserPrompt(messageContent: string, meta: { authorAgeDays?: number; links?: string[] } = {}) {
  return [
    `Message: \"\"\"${messageContent}\"\"\"`,
    `AuthorAgeDays: ${meta.authorAgeDays ?? 'unknown'}`,
    `Links: ${meta.links?.join(', ') || 'none'}`
  ].join('\n');
}
