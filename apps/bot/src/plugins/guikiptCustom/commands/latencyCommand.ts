import { ApplicationCommandType } from '@antibot/interactions';
import {
    APIEmbed,
    ChatInputCommandInteraction,
} from 'discord.js';

import { Context } from '../../../classes/context';
import { defineCommand } from '../../../define';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Check bot latency and ping!',
            name: 'latency',
            options: [],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            const start = Date.now();
            
            // Get WebSocket ping
            const wsLatency = ctx.ws.ping;
            
            // Send initial reply to measure API latency
            await interaction.deferReply({});
            
            const apiLatency = Date.now() - start;
            
            // Determine latency status and color
            const getLatencyStatus = (latency: number) => {
                if (latency < 100) return { color: 0x00ff00, status: 'Excellent' };
                if (latency < 200) return { color: 0xffff00, status: 'Good' };
                if (latency < 300) return { color: 0xff8800, status: 'Fair' };
                return { color: 0xff0000, status: 'Poor' };
            };

            const wsStatus = getLatencyStatus(wsLatency);
            const apiStatus = getLatencyStatus(apiLatency);

            const latencyEmbed: APIEmbed = {
                color: global.embedColor,
                fields: [
                    {
                        inline: false,
                        name: '🌐 API Ping',
                        value: `\`\`\`\n${wsLatency}ms (${wsStatus.status})\`\`\``,
                    },
                    {
                        inline: false,
                        name: '📡 Bot Latency',
                        value: `\`\`\`\n${apiLatency}ms (${apiStatus.status})\`\`\``,
                    },
                    {
                        inline: false,
                        name: '📊 Overall Status',
                        value: Math.max(wsLatency, apiLatency) < 200 ? '\`\`\`\n✅ Optimal\`\`\`' : '\`\`\`\n⚠️ Degraded\`\`\`',
                    },
                ],
                thumbnail: {
                    url: ctx.user?.displayAvatarURL(),
                },
                timestamp: new Date().toISOString(),
                title: 'Bot Latency Information',
            };
            
            return interaction.editReply({
                embeds: [latencyEmbed],
            });
        },
        restrictToConfigRoles: [],
    }),
};
