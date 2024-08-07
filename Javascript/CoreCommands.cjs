const { DefineCommand } = require("../Common/DefineCommand");
const { ApplicationCommandType } = require("@antibot/interactions");

exports.Command = DefineCommand({
        command: {
            name: "ping",
            type: ApplicationCommandType.CHAT_INPUT,
            description: "test",
            options: []
        },
        on: (ctx, interaction) => {
            return interaction.reply({
                content: "pong!",
                ephemeral: true
            });
        }
    })

