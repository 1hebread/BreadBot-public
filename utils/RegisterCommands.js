// Required libraries and variables
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = (client) => {

    console.log('Started refreshing application (/) commands.');

    const commands = [];
    for (const [_, command] of client.commands) {
        try {
            commands.push( command.data.toJSON() );
        } catch(error) {
            console.log(`[REGISTER] Failed to register ${command.data.name}: ${error}`);
        }
    }

    const rest = new REST({ version: '10' }).setToken(client.config.TOKEN);
    try {
        rest.put(
            Routes.applicationCommands(client.config.APP_ID),
            { body: commands },
        );
    
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.log(error);
    }
}