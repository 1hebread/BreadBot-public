const { Client, PermissionsBitField } = require('discord.js');
const mysql = require("mysql2/promise");

const client = new Client({
    intents: [
        'Guilds',
        'GuildMembers'
    ]
});

client.config = require('./config.json');
client.cooldowns = new Map();
client.cache = new Map();

require('./utils/ComponentLoader.js')(client);
require('./utils/EventLoader.js')(client);
require('./utils/RegisterCommands.js')(client);

console.log(`Logging in...`);
client.login(client.config.TOKEN);
client.on('ready', function () {
    console.log(`Logged in as ${client.user.tag}!`);
});

const db = mysql.createPool({
    host: client.config.DB_HOST,
    user: client.config.DB_USER,
    password: client.config.DB_PASSWORD,
    database: client.config.DB_NAME
});

async function InteractionHandler(interaction, type) {

    const component = client[type].get( interaction.customId ?? interaction.commandName );
    if (!component) {
        // console.error(`${type} not found: ${interaction.customId ?? interaction.commandName}`);
        return;
    }

    try {
        //command properties
        if (component.admin) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `⚠️ Only administrators can use this command!`, ephemeral: true });
        }

        if (component.owner) {
            if (interaction.user.id !== 'YOURUSERID') return await interaction.reply({ content: `⚠️ Only bot owners can use this command!`, ephemeral: true });
        }

        //the mod command property requires additional setup, watch the video here to set it up: https://youtu.be/2Tqy6Cp_10I?si=bharHI_Vw7qjaG2Q

        /*
            COMMAND PROPERTIES:

            module.exports = {
                admin: true,
                data: new SlashCommandBuilder()
                .setName('test')
                .setDescription('test'),
                async execute(interaction) { 
                
                }
                }
            }

            You can use command properties in the module.exports statement by adding a valid property to : true,

            VALID PROPERTIES:

            admin : true/false
            owner : true/false


            You can add more command properties by following the prompt below and pasting it above in location with all the other statements:
            
            if (component.propertyname) {
                if (logic statement logic) return await interaction.reply({ content: `⚠️ response to flag`, ephemeral: true });
            }
        */

        await component.execute(interaction, client);
    } catch (error) {
        console.error("stack" in error ? error.stack : error);
        await interaction.deferReply({ ephemeral: true }).catch( () => {} );
        await interaction.editReply({
            content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``,
            embeds: [],
            components: [],
            files: []
        }).catch( () => {} );
    }
}

client.on('guildMemberAdd', async member => {
    const [mutes] = await db.execute("SELECT expires_at FROM mutes WHERE user_id = ? AND guild_id = ?", [member.id, member.guild.id]);
    const currentTime = Date.now();

    if (mutes.length > 0) {
        const mute = mutes[0];
        const muteRole = member.guild.roles.cache.find(r => r.name === "Muted");
        if (muteRole) {
            await member.roles.add(muteRole);
            const remainingTime = mute.expires_at - currentTime;

            // Размут через оставшееся время
            setTimeout(async () => {
                if (member.roles.cache.has(muteRole.id)) {
                    await member.roles.remove(muteRole);
                    await db.execute("DELETE FROM mutes WHERE user_id = ? AND guild_id = ?", [member.id, member.guild.id]);
                }
            }, remainingTime);
        }
    }
});

client.on('interactionCreate', async function(interaction) {
    if (!interaction.isCommand()) return;
    await InteractionHandler(interaction, 'commands');
});


client.on('interactionCreate', async function(interaction) {
    if (!interaction.isButton()) return;
    await InteractionHandler(interaction, 'buttons');
});


client.on('interactionCreate', async function(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    await InteractionHandler(interaction, 'dropdowns');
});


client.on('interactionCreate', async function(interaction) {
    if (!interaction.isModalSubmit()) return;
    await InteractionHandler(interaction, 'modals');
});