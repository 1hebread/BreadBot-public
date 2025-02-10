const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("flip")
        .setDescription("Подбросить монетку"),
    async execute(interaction) {
        const random = Math.random();
        const result = random < 0.5 ? "Орёл" : "Решку";
        const embed = new EmbedBuilder()
            .setTitle("Результат подбрасывания монетки")
            .setDescription(`Монетка упала на **${result}**`)
            .setColor(9789108)
            .setFooter({
                text: `Команду выполнил: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            })

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};