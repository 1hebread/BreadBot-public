const { SlashCommandBuilder, Client } = require("discord.js");

const client = new Client({
    intents: []
});

client.config = require('../../config.json');

module.exports = {

    data: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("Случайное число")
        .addIntegerOption(option => 
            option.setName('min')
                .setDescription('От какого числа? (если не указать, то 1)')
                .setRequired(false)
        )
        .addIntegerOption(option => 
            option.setName('max')
                .setDescription('До какого числа? (если не указать, то 100)')
                .setRequired(false)
        ),
    async execute(interaction) {
        const min = interaction.options.getInteger('min') || 1;
        const max = interaction.options.getInteger('max') || 100;

        const random = Math.floor(Math.random() * (max - min + 1)) + min;
        if (interaction.channel.id === client.config.COMMANDS_CHANNEL_ID || interaction.user.id === client.config.OWNER_ID) {
            await interaction.reply({ content: `Выпало число **${random}**`, ephemeral: true });
        } else {
            await interaction.reply({ content: `Эта команда доступна только в канале <#${client.config.COMMANDS_CHANNEL_ID}>`, ephemeral: true });
        }
    }
};