const { Client, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mysql = require("mysql2/promise");

const client = new Client({
    intents: []
});

client.config = require('../../config.json');

// Подключение к базе данных
const db = mysql.createPool({
    host: client.config.DB_HOST,
    user: client.config.DB_USER,
    password: client.config.DB_PASSWORD,
    database: client.config.DB_NAME
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Разглушает пользователя')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Пользователь, которого нужно разглушить')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return await interaction.reply({ content: "У вас нет прав на размут пользователей.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return interaction.reply({ content: 'Пользователь не найден', ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(r => r.name === "Muted");
        if (!muteRole || !member.roles.cache.has(muteRole.id)) {
            return interaction.reply({ content: 'Пользователь не заглушен.', ephemeral: true });
        }

        try {
            await member.roles.remove(muteRole);
            await db.execute("DELETE FROM mutes WHERE user_id = ? AND guild_id = ?", [user.id, interaction.guild.id]);
            const embed = new EmbedBuilder()
                .setTitle("Пользователь разглушен")
                .setDescription(`Пользователь ${user} был разглушен!`)
                .setColor(9789108)
                .setFooter({
                    text: `Команду выполнил: ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Ошибка при попытке размутирования пользователя.", ephemeral: true });
        }
    },
};