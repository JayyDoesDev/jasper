import { Client, GatewayIntentBits, Partials, Collection, Message, Interaction, ButtonInteraction, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { loadConfig, ENV } from './config.js';
import { logger } from './util.js';
import { classifyMessage } from './moderation.js';

const cfg = loadConfig();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message]
});

const channelCooldown = new Collection<string, number>();

function canScan(channelId: string): boolean {
  const last = channelCooldown.get(channelId) || 0;
  const now = Date.now();
  if (now - last < cfg.rateLimit.perChannelCooldownSec * 1000) return false;
  channelCooldown.set(channelId, now);
  return true;
}

let bucket = cfg.rateLimit.maxCallsPerMinute;
setInterval(() => { bucket = cfg.rateLimit.maxCallsPerMinute; }, 60_000);
function takeToken(): boolean {
  if (bucket <= 0) return false;
  bucket -= 1;
  return true;
}

client.on('ready', () => {
  logger.info(`Logged in as ${client.user?.tag}. Provider=${cfg.provider}, model=${cfg.model}, productionReady=${cfg.productionReady}`);
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  // Whitelist check
  if (ENV.WHITELIST_CHANNELS.includes(message.channelId)) return;
  const parentId = (message.channel as any).parentId as string | null | undefined;
  if (parentId && ENV.WHITELIST_CATEGORIES.includes(parentId)) return;

  const content = message.content?.trim() || '';
  if (!content) return;

  if (!canScan(message.channelId)) return;
  if (!takeToken()) return;

  try {
    await classifyMessage(cfg, message, cfg.provider);
  } catch (e: any) {
    logger.error({ err: String(e) }, 'classifyMessage failed');
  }
});

// Handle moderation buttons
client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isButton()) return;

  const [action, channelId, targetMsgId] = interaction.customId.split(':');
  if (!channelId || !targetMsgId) return;

  // Permission check: require ManageMessages
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({ content: 'You lack permission to perform this action.', ephemeral: true });
    return;
  }

  const targetChannel = await client.channels.fetch(channelId).catch(() => null);
  if (!targetChannel || !targetChannel.isTextBased()) {
    await interaction.reply({ content: 'Could not find target channel.', ephemeral: true });
    return;
  }

  const msg = await targetChannel.messages.fetch(targetMsgId).catch(() => null);

  if (action === 'scam_del') {
    if (msg) await msg.delete().catch(() => null);
    await interaction.update({ components: [] });
    await interaction.followUp({ content: `Deleted message ${targetMsgId}.`, ephemeral: true });
    return;
  }

  if (action === 'flag_false') {
    if (!msg) {
      await interaction.reply({ content: 'Original message missing.', ephemeral: true });
      return;
    }
    const { adoptExample } = await import('./memory.js');
    const authorAgeDays = Math.max(0, Math.floor((Date.now() - msg.author.createdTimestamp) / 86400000));
    adoptExample({
      content: msg.content || '',
      predicted: 'not_scam',
      groundTruth: 'scam',
      confidence: 1,
      meta: { channel: channelId, authorAgeDays },
      reason: `mod_${interaction.user.id}_flagged`
    });
    await interaction.update({ components: [] });
    await interaction.followUp({ content: 'Flag submitted, thank you.', ephemeral: true });
    return;
  }

  if (!msg) {
    await interaction.reply({ content: 'Original message no longer exists.', ephemeral: true });
    return;
  }

  // Load memory adoption function dynamically to avoid circular deps
  const { adoptExample } = await import('./memory.js');
  const authorAgeDays = Math.max(0, Math.floor((Date.now() - msg.author.createdTimestamp) / 86400000));
  if (action === 'scam_correct') {
    adoptExample({
      content: msg.content || '',
      predicted: 'scam',
      groundTruth: 'scam',
      confidence: 1,
      meta: { channel: channelId, authorAgeDays },
      reason: `mod_${interaction.user.id}_approved`
    });
    await interaction.reply({ content: 'Marked as correct. Thanks!', ephemeral: true });
  } else if (action === 'scam_incorrect') {
    adoptExample({
      content: msg.content || '',
      predicted: 'scam',
      groundTruth: 'not_scam',
      confidence: 1,
      meta: { channel: channelId, authorAgeDays },
      reason: `mod_${interaction.user.id}_rejected`
    });
    await interaction.reply({ content: 'Marked as incorrect. Thanks!', ephemeral: true });
  }
});

client.login(ENV.DISCORD_TOKEN);
