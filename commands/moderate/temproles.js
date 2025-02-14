const { Client, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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
        .setName('temproles')
        .setDescription('Показывает все временные роли'),
    async execute(interaction) {
        // Проверка на наличие прав
        if (!interaction.member.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
            return await interaction.reply({ content: "У вас нет прав на просмотр временных ролей.", ephemeral: true });
        }

        const [rows] = await db.execute('SELECT * FROM temp_roles');
        const rolesEmbed = new EmbedBuilder()
            .setTitle('Временные роли')
            .setColor(9789108)
            .setFooter({
                text: `Команду выполнил: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        // Проверка на наличие временных ролей
        if (rows.length > 0) {
            rolesEmbed.setDescription(rows.map(row => `<@${row.user_id}> (${row.user_id}). Роль: <@&${row.role_id}>. Роль будет удалена: <t:${Math.floor(row.expires_at / 1000)}:F>`).join("\n"));
        } else {
            rolesEmbed.setDescription("Нет временных ролей.");
        }

        return interaction.reply({ embeds: [rolesEmbed] });
    }
};