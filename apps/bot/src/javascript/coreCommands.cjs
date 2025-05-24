const { ApplicationCommandType } = require('@antibot/interactions');
const { MessageFlags } = require('discord.js');

const { defineCommand } = require('../define');

exports.Command = defineCommand({
    command: {
        description: 'test',
        name: 'ping',
        options: [],
        type: ApplicationCommandType.CHAT_INPUT,
    },
    on: (ctx, interaction) => {
        return interaction.reply({
            content: 'pong!',
            flags: MessageFlags.Ephemeral,
        });
    },
});
