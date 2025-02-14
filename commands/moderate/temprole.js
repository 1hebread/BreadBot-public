const { Client, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const mysql = require("mysql2/promise");
const ms = require("ms");

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
        .setName("temprole")
        .setDescription("Временно выдаёт роль пользователю")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Пользователь, которому будет выдана роль")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Роль, которая будет выдана")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("duration")
                .setDescription("Длительность роли (например, 10m, 1h, 1d)")
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await interaction.reply({ content: "У вас нет прав на управление ролями.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");
        const duration = interaction.options.getString("duration");
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return await interaction.reply({ content: "Пользователь не найден.", ephemeral: true });
        }

        if (member.roles.cache.has(role.id)) {
            return await interaction.reply({ content: "Этот пользователь уже имеет данную роль.", ephemeral: true });
        }

        const roleDuration = ms(duration);
        if (!roleDuration) {
            return await interaction.reply({ content: "Неверный формат времени. Используйте например: 10m, 1h, 1d", ephemeral: true });
        }

        try {
            await member.roles.add(role);
            const expiresAt = Date.now() + roleDuration;
            
            // Записываем выдачу роли в базу данных
            await db.execute("INSERT INTO temp_roles (user_id, guild_id, role_id, expires_at) VALUES (?, ?, ?, ?)", [
                user.id, interaction.guild.id, role.id, expiresAt
            ]);

            const embed = new EmbedBuilder()
                .setTitle("Выдана временная роль")
                .setDescription(`Пользователь ${user} получил роль ${role} на ${duration}!`)
                .setColor(9789108)
                .setFooter({
                    text: `Команду выполнил: ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            await interaction.reply({ embeds: [embed] });

            // Удаление роли через указанное время
            setTimeout(async () => {
                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                    await db.execute("DELETE FROM temp_roles WHERE user_id = ? AND guild_id = ? AND role_id = ?", [user.id, interaction.guild.id, role.id]);
                }
            }, roleDuration);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Ошибка при попытке выдачи роли.", ephemeral: true });
        }
    }
};