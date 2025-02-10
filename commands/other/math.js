const { Client, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { evaluate } = require("mathjs");

const client = new Client({
    intents: []
});

client.config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("math")
        .setDescription("Вычисляет математическое выражение")
        .addStringOption(option =>
            option.setName("expression")
                .setDescription("Выражение для вычисления")
                .setRequired(true)
        ),
    async execute(interaction) {
        const expression = interaction.options.getString("expression");

        if (interaction.channel.id === client.config.COMMANDS_CHANNEL_ID || interaction.user.id === client.config.OWNER_ID) {
            try {
                const embed = new EmbedBuilder()
                .setColor(9789108)
                .setDescription(`Результат вычесления выражения \`${expression}\`:\n\`\`\`${evaluate(expression)}\`\`\``);
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: "Ошибка: некорректное математическое выражение.", ephemeral: true });
            }
        } else {
            await interaction.reply({ content: `Эта команда доступна только в канале <#${client.config.COMMANDS_CHANNEL_ID}>`, ephemeral: true });
        }
    }
};
