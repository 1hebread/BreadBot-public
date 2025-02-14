const { Client } = require('discord.js');
const mysql = require("mysql2/promise");

const client = new Client({
    intents: []
});

client.config = require('../config.json');

// Подключение к базе данных
const db = mysql.createPool({
    host: client.config.DB_HOST,
    user: client.config.DB_USER,
    password: client.config.DB_PASSWORD,
    database: client.config.DB_NAME
});

module.exports = {
    name: 'ready',

    once: true,
    async execute(client) {
        const [rows] = await db.execute('SELECT * FROM temp_roles');
        const currentTime = Date.now();

        for (const row of rows) {
            const expiresAt = row.expires_at;
            if (expiresAt <= currentTime) {
                const guild = client.guilds.cache.get(row.guild_id);
                if (!guild) continue;

                const member = await guild.members.fetch(row.user_id).catch(() => null);
                if (!member) continue;

                const role = guild.roles.cache.get(row.role_id);
                if (!role) continue;

                await member.roles.remove(role);
                await db.execute("DELETE FROM temp_roles WHERE user_id = ?", [row.user_id]);
            }
        }
    }
};