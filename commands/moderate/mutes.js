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
        .setName('mutes')
        .setDescription('Показывает список заглушенных пользователей'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return await interaction.reply({ content: "У вас нет прав на просмотр списка заглушенных пользователей.", ephemeral: true });
        }
        const [rows] = await db.execute("SELECT * FROM mutes");
        const embed = new EmbedBuilder()
            .setTitle("Список заглушенных пользователей")
            .setColor(9789108)
            .setFooter({
                text: `Команду выполнил: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            });
        
        // Проверка на наличие заглушенных пользователей
        if (rows.length > 0) {
            embed.setDescription(rows.map(row => `<@${row.user_id}> (${row.user_id}). Причина: ${row.reason}. Заглушен до: <t:${Math.floor(row.expires_at / 1000)}:F>`).join("\n"));
        } else {
            embed.setDescription("Нет заглушенных пользователей.");
        }
        
        return interaction.reply({ embeds: [embed] });
    }
};