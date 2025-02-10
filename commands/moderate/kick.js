const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Исключает (кикает) пользователя с сервера")
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Пользователь для исключения (кика)')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Причина исключения (кика)')
                .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return await interaction.reply({ content: 'У вас нет прав для исключения (кика) пользователей.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Не указана';

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return await interaction.reply({ content: 'Пользователь не найден.', ephemeral: true });
        }
        try {
            await interaction.guild.members.kick(user, reason);
        } catch (error) {
            return await interaction.reply({ content: 'Невозможно кикнуть пользователя.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("Исключение (кик) пользователя")
            .setDescription(`Пользователь ${user} был исключен (кикнут) с сервера! Причина: ${reason}`)
            .setColor(9789108)
            .setFooter({
                text: `Команду выполнил: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
        
        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};