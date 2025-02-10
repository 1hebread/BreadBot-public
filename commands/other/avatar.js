const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Аватар пользователя")
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Пользователь для получения аватара')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const embed = new EmbedBuilder()
            .setTitle(`Аватар ${user.displayName}`)
            .setColor(9789108)
            .setImage(user.displayAvatarURL({ dynamic: true }) + "?size=512");

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};