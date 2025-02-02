const { defineCommand } = require('../Common/define');
const { MessageFlags } = require('discord.js');
const { ApplicationCommandType } = require('@antibot/interactions');

exports.Command = defineCommand({
    command: {
        name: 'ping',
        type: ApplicationCommandType.CHAT_INPUT,
        description: 'test',
        options: [],
    },
    on: (ctx, interaction) => {
        return interaction.reply({
            content: 'pong!',
            flags: MessageFlags.Ephemeral,
        });
    },
});
