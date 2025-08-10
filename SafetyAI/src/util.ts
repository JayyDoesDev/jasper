import pino from 'pino';
import fs from 'node:fs';
import path from 'node:path';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: true }
  } : undefined
});

export function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export function appendLog(file: string, line: string) {
  const dir = path.dirname(file);
  ensureDir(dir);
  fs.appendFileSync(file, line + '\n', 'utf8');
}

export function nowIso() {
  return new Date().toISOString();
}

export function safeJson<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}
