import { Message, EmbedBuilder, TextBasedChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BotConfig } from './config.js';
import { getClient } from './providers/index.js';
import { buildSystemPrompt, buildUserPrompt, loadExamples } from './prompt.js';
import { adoptExample } from './memory.js';
import { appendLog, nowIso, logger } from './util.js';

const ERROR_LOG = 'logs/errors.log';

const URL_REGEX = /\bhttps?:\/\/[^\s]+/gi;

function buildRegex(pattern: string): RegExp {
  let flags = 'g';
  if (pattern.startsWith('(?i)')) {
    flags += 'i';
    pattern = pattern.slice(4); // remove the inline flag
  }
  return new RegExp(pattern, flags);
}

function matchAny(regexes: string[], text: string): boolean {
  return regexes.some(r => buildRegex(r).test(text));
}

function extractLinks(text: string): string[] {
  const m = text.match(URL_REGEX);
  return m ? Array.from(new Set(m)) : [];
}

export interface Decision {
  isScam: boolean;
  confidence: number;
  reasons: string[];
  tags: string[];
  hardBlocked: boolean;
}

export async function classifyMessage(cfg: BotConfig, message: Message, providerName: string) {
  const content = message.content || '';
  const authorAgeDays = Math.max(0, Math.floor((Date.now() - message.author.createdTimestamp) / (1000 * 60 * 60 * 24)));
  const links = extractLinks(content);

  const hardBlocked = matchAny(cfg.hardBlockRegexes, content);
  const triggered = hardBlocked || matchAny(cfg.triggerPatterns, content);

  if (!triggered) return null;

  const examples = loadExamples(cfg);
  const system = buildSystemPrompt(examples);
  const user = buildUserPrompt(content, { authorAgeDays, links });
  const client = getClient(providerName);

  let isScam = false, confidence = 0, reasons: string[] = [], tags: string[] = [];
  let rawLLM = '';

  if (hardBlocked && cfg.moderation.deleteIfHardBlockRegex) {
    isScam = true;
    confidence = 0.99;
    reasons = ['Matched hard-block pattern'];
    tags = ['hard_block'];
  } else {
    try {
      const res = await client.classify({ model: cfg.model, system, user });
      const j = res.json || {};
      rawLLM = res.raw || '';
      isScam = !!j.is_scam;
      confidence = typeof j.confidence === 'number' ? Math.max(0, Math.min(1, j.confidence)) : 0.5;
      reasons = Array.isArray(j.reasons) ? j.reasons.slice(0, 6) : [];
      tags = Array.isArray(j.tags) ? j.tags.slice(0, 6) : [];
    } catch (e: any) {
      appendLog(ERROR_LOG, JSON.stringify({ t: nowIso(), err: String(e) }));
      isScam = hardBlocked || (links.length > 0 && /nitro|airdrop|wallet|seed/i.test(content));
      confidence = isScam ? 0.7 : 0.3;
      reasons = ['Heuristic fallback'];
      tags = ['fallback'];
    }
  }

  const decision: Decision = { isScam, confidence, reasons, tags, hardBlocked };

  logger.info({
    msgId: message.id,
    triggered,
    hardBlocked,
    decision,
    rawLLM,
    systemPrompt: system.substring(0, 500),
    userPrompt: user.substring(0, 500)
  }, 'classification');

  await maybeSendDebug(message, {
    triggered,
    hardBlocked,
    decision,
    rawLLM,
    system,
    user
  });

  await handleDecision(cfg, message, decision);
  return decision;
}

async function maybeSendDebug(message: Message, data: { triggered: boolean; hardBlocked: boolean; decision: Decision; rawLLM: string; system: string; user: string; }) {
  const debugChanId = process.env.DEBUG_CHANNEL_ID;
  if (!debugChanId) return;
  let ch;
  try { ch = await message.client.channels.fetch(debugChanId).catch(() => null); } catch { return; }
  if (!ch || !ch.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setTitle('Debug Trace')
    .setColor(data.decision.isScam ? 0xE74C3C : 0x95a5a6)
    .addFields(
      { name: 'Triggered', value: String(data.triggered), inline: true },
      { name: 'HardBlocked', value: String(data.hardBlocked), inline: true },
      { name: 'Decision', value: `${data.decision.isScam} (${data.decision.confidence.toFixed(2)})`, inline: true },
      { name: 'Reasons', value: data.decision.reasons.join('\n') || 'n/a', inline: false },
      { name: 'Tags', value: data.decision.tags.join(', ') || 'none', inline: false },
      { name: 'Raw LLM', value: data.rawLLM.slice(0, 900) || 'n/a', inline: false }
    )
    .setTimestamp(new Date());

  const components = [] as any[];
  if (!data.decision.isScam) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`flag_false:${message.channelId}:${message.id}`).setLabel('Flag as scam').setStyle(ButtonStyle.Danger)
    );
    components.push(row);
  }

  await (ch as any).send({ embeds: [embed], components });
}

async function handleDecision(cfg: BotConfig, message: Message, d: Decision) {
  const modChanId = process.env.MOD_CHANNEL_ID;
  const shouldDelete = cfg.moderation.actions.deleteMessage && d.isScam && (d.hardBlocked || d.confidence >= cfg.moderation.minConfidenceToDelete) && cfg.productionReady;
  const shouldFlag = cfg.moderation.actions.postModAlert && (d.isScam ? d.confidence >= cfg.moderation.minConfidenceToFlag : false);

  if (shouldDelete) {
    try {
      await message.delete();
      if (cfg.moderation.actions.dmUserOnDelete) {
        await message.author.send('Your message was removed for likely scam content. If you think this was a mistake, contact the moderators.');
      }
    } catch {}
  }

  if (shouldFlag && modChanId) {
    const embed = new EmbedBuilder()
      .setTitle(d.isScam ? 'Possible Scam' : 'Notice')
      .setDescription(message.content?.slice(0, 1000) || '(no content)')
      .setColor(d.isScam ? 0xE74C3C : 0x3498DB)
      .addFields(
        { name: 'User', value: `<@${message.author.id}> (age ~${Math.max(0, Math.floor((Date.now() - message.author.createdTimestamp) / 86400000))} days)`, inline: false },
        { name: 'Confidence', value: d.confidence.toFixed(2), inline: true },
        { name: 'Tags', value: d.tags.join(', ') || 'none', inline: true },
        { name: 'Reasons', value: d.reasons.join(' • ') || 'n/a', inline: false },
        { name: 'Channel', value: `<#${message.channelId}>`, inline: true }
      )
      .setFooter({ text: `productionReady=${cfg.productionReady}` })
      .setTimestamp(new Date());

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`scam_del:${message.channelId}:${message.id}`).setLabel('Delete').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`scam_correct:${message.channelId}:${message.id}`).setLabel('Correct').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`scam_incorrect:${message.channelId}:${message.id}`).setLabel('Incorrect').setStyle(ButtonStyle.Secondary)
    );

    const ch = await message.client.channels.fetch(modChanId).catch(() => null);
    if (ch && ch.isTextBased()) {
      await (ch as any).send({ embeds: [embed], components: [row] });
    }
  }

  adoptExample({
    content: message.content || '',
    predicted: d.isScam ? 'scam' : 'not_scam',
    confidence: d.confidence,
    meta: { channel: message.channelId, authorAgeDays: Math.max(0, Math.floor((Date.now() - message.author.createdTimestamp) / 86400000)) },
    reason: d.reasons[0]
  });
}
