const { Client, ActivityType } = require('discord.js');

const client = new Client({
    intents: []
});

client.config = require('../config.json');

module.exports = {
    name: 'ready', 

    once: true,
    async execute(client) { 
        client.user.setActivity({
            name: '/help',
            type: ActivityType.Playing,
        });
    }
};
