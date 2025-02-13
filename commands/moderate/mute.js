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
        .setName("mute")
        .setDescription("Заглушает пользователя на указанное время.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("Пользователь для заглушения")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("duration")
                .setDescription("Длительность мута (например, 10m, 1h, 1d)")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Причина мута")
                .setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return await interaction.reply({ content: "У вас нет прав на мут пользователей.", ephemeral: true });
        }

        const user = interaction.options.getUser("user");
        const duration = interaction.options.getString("duration");
        const reason = interaction.options.getString("reason") || "Не указана";
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return await interaction.reply({ content: "Пользователь не найден.", ephemeral: true });
        }

        if (member.user.bot) {
            return await interaction.reply({ content: "Боты не могут быть заглушены.", ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(r => r.name === "Muted");
        if (!muteRole) {
            return await interaction.reply({ content: "Роль 'Muted' не найдена.", ephemeral: true });
        }

        const muteDuration = ms(duration);
        if (!muteDuration) {
            return await interaction.reply({ content: "Неверный формат времени. Используйте например: 10m, 1h, 1d", ephemeral: true });
        }

        if (reason.length > 255) {
            return await interaction.reply({ content: "Причина не может быть длиннее 255 символов.", ephemeral: true });
        }

        try {
            await member.roles.add(muteRole);
            const expiresAt = Date.now() + muteDuration;
            
            // Записываем мут в базу данных
            await db.execute("INSERT INTO mutes (user_id, guild_id, reason, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE expires_at = ?", [
                user.id, interaction.guild.id, reason, expiresAt, expiresAt
            ]);

            const embed = new EmbedBuilder()
                .setTitle("Пользователь заглушен")
                .setDescription(`Пользователь ${user} был заглушен на ${duration}! Причина: ${reason}`)
                .setColor(9789108)
                .setFooter({
                    text: `Команду выполнил: ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
            
            await interaction.reply({ embeds: [embed] });

            // Размут через указанное время
            setTimeout(async () => {
                if (member.roles.cache.has(muteRole.id)) {
                    await member.roles.remove(muteRole);
                    await db.execute("DELETE FROM mutes WHERE user_id = ? AND guild_id = ?", [user.id, interaction.guild.id]);
                }
            }, muteDuration);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Ошибка при попытке заглушения пользователя.", ephemeral: true });
        }
    }
};