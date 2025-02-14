const { Client } = require('discord.js');
const mysql = require("mysql2/promise");

const client = new Client({
    intents: []
});

client.config = require('../config.json');

module.exports = {
    name: 'ready', 

    once: true,
    async execute(client) { 
        // Подключение к базе данных
        const db = mysql.createPool({
            host: client.config.DB_HOST,
            user: client.config.DB_USER,
            password: client.config.DB_PASSWORD,
            database: client.config.DB_NAME
        });

        try {
            const [mutes] = await db.execute("SELECT user_id, guild_id, expires_at FROM mutes");
            const currentTime = Date.now();

            for (const mute of mutes) {
                const guild = client.guilds.cache.get(mute.guild_id);
                if (!guild) continue;
                
                const member = await guild.members.fetch(mute.user_id).catch(() => null);
                if (!member) continue;
                
                const muteRole = guild.roles.cache.find(r => r.name === "Muted");
                if (!muteRole) continue;
                
                if (mute.expires_at <= currentTime) {
                    await member.roles.remove(muteRole);
                    await db.execute("DELETE FROM mutes WHERE user_id = ? AND guild_id = ?", [mute.user_id, mute.guild_id]);
                } else {
                    setTimeout(async () => {
                        await member.roles.remove(muteRole);
                        await db.execute("DELETE FROM mutes WHERE user_id = ? AND guild_id = ?", [mute.user_id, mute.guild_id]);
                    }, mute.expires_at - currentTime);
                }
            }
        } catch (error) {
            console.error("Ошибка при проверке мутов:", error);
        }
    },
};
