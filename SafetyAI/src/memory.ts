import fs from 'node:fs';
import path from 'node:path';
import { LabeledExample } from './prompt.js';
import { appendLog, ensureDir, nowIso } from './util.js';

const LEARNED_PATH = path.join(process.cwd(), 'examples/learned_examples.jsonl');
const ACTIONS_LOG = path.join(process.cwd(), 'logs/actions.log');

export interface AdoptionInput {
  content: string;
  predicted: 'scam' | 'not_scam';
  confidence: number;
  meta: {
    channel?: string;
    authorAgeDays?: number;
  };
  groundTruth?: 'scam' | 'not_scam';
  reason?: string;
}

export function adoptExample(a: AdoptionInput) {
  ensureDir(path.dirname(LEARNED_PATH));
  const weight = a.groundTruth
    ? (a.groundTruth !== a.predicted ? 2.0 : 1.0)
    : (a.confidence >= 0.85 ? 0.5 : 1.0);

  const ex: LabeledExample = {
    content: a.content,
    label: a.groundTruth ?? a.predicted,
    reason: a.reason || `conf=${a.confidence.toFixed(2)} pred=${a.predicted}`,
    meta: { channel: a.meta.channel, authorAgeDays: a.meta.authorAgeDays },
    weight
  };
  fs.appendFileSync(LEARNED_PATH, JSON.stringify(ex) + '\n', 'utf8');

  appendLog(ACTIONS_LOG, JSON.stringify({ t: nowIso(), type: 'adopt', ...a, storedWeight: weight }));
}
