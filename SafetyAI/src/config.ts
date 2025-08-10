import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

export type ProviderName = 'openai' | 'anthropic' | 'mistral' | 'groq' | 'xai' | 'huggingface';

export interface BotConfig {
  provider: ProviderName;
  model: string;
  productionReady: boolean;
  triggerPatterns: string[];
  hardBlockRegexes: string[];
  rateLimit: {
    maxCallsPerMinute: number;
    perChannelCooldownSec: number;
  };
  moderation: {
    minConfidenceToDelete: number;
    minConfidenceToFlag: number;
    deleteIfHardBlockRegex: boolean;
    actions: {
      deleteMessage: boolean;
      dmUserOnDelete: boolean;
      postModAlert: boolean;
    };
  };
  fewShot: {
    maxSeedExamples: number;
    maxLearnedExamples: number;
    maxExamplesPerPrompt: number;
    prioritizeHardNegatives: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

export const ENV = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
  MOD_CHANNEL_ID: process.env.MOD_CHANNEL_ID,
  DEBUG_CHANNEL_ID: process.env.DEBUG_CHANNEL_ID,
  GUILD_ID: process.env.GUILD_ID,
  WHITELIST_CHANNELS: (process.env.WHITELIST_CHANNELS || '').split(',').filter(Boolean),
  WHITELIST_CATEGORIES: (process.env.WHITELIST_CATEGORIES || '').split(',').filter(Boolean),

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  XAI_API_KEY: process.env.XAI_API_KEY,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,

  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  GROQ_BASE_URL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  XAI_BASE_URL: process.env.XAI_BASE_URL || 'https://api.x.ai/v1'
};

export function loadConfig(): BotConfig {
  const cfgPath = path.join(process.cwd(), 'config.json');
  const raw = fs.readFileSync(cfgPath, 'utf8');
  return JSON.parse(raw);
}
