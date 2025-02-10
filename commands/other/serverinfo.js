const { Client, SlashCommandBuilder, EmbedBuilder, ChannelType, } = require("discord.js");

const client = new Client({
    intents: []
});

client.config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("si")
        .setDescription("Информация о сервере"),
    async execute(interaction) {
        const guild = interaction.guild;
        const members = await guild.members.fetch();
        const totalMembers = members.size;
        const totalHumans = members.filter(member => !member.user.bot).size;
        const totalBots = members.filter(member => member.user.bot).size;
        
        // Проверяем, есть ли у участника presence
        const totalOnline = members.filter(member => member.presence?.status && member.presence.status !== 'offline').size;

        const timestamp = Math.floor(guild.createdAt.getTime() / 1000);

        // Исправленные фильтры каналов
        const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice);
        const categories = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory);

        // Список уровней Модерации
        const verificationLevels = {
            0: 'Нет',
            1: 'Низкий',
            2: 'Средний',
            3: 'Высокий',
            4: 'Самый высокий',
        }

        const embed = new EmbedBuilder()
            .setColor(9789108)
            .setTitle(`Информация о ${guild.name}`)
            .setThumbnail(guild.iconURL({ size: 128 }))
            .addFields(
                { name: "Участники:", value: `<:all_members:1337388966600642570> Всего: **${totalMembers}**\n<:peoples:1337388970295820349> Людей: **${totalHumans}**\n<:robots:1337388972413816832> Ботов: **${totalBots}**\n<:online_members:1337388968567902209> Онлайн: **${totalOnline}**`, inline: true },
                { name: "Каналы:", value: `<:all_channels:1337420563328536667> Всего: **${textChannels.size + voiceChannels.size + categories.size}**\n<:text_channels:1337420592042999880> Текстовых: **${textChannels.size}**\n<:voice_channels:1337420593804476446> Голосовых: **${voiceChannels.size}**\n<:categories:1337420565262368788> Категорий: **${categories.size}**`, inline: true }
            )
            .setImage(guild.bannerURL({ size: 256 }))
            .addFields(
                { name: "Создатель:", value: `<:server_owner:1337420590235258900> ${guild.ownerId ? `<@${guild.ownerId}>` : 'Неизвестен'}`, inline: true },
                { name: "Модерация:", value: `<:guild_protection_level:1337420586510712944> ${verificationLevels[guild.verificationLevel]}`, inline: true },
                { name: "Бусты:", value: `<:guild_boost_level:1337420584669413458> Бустов: **${guild.premiumSubscriptionCount || 0}**`, inline: true },
                { name: "ID сервера:", value: `<:id_custom:1337420588293292093> ${guild.id}`, inline: true },
                { name: "Сервер создан:", value: `<:creation_date:1337421614949732412> <t:${timestamp}:D>`, inline: true }
            );

        if (interaction.channel.id === client.config.COMMANDS_CHANNEL_ID || interaction.user.id === client.config.OWNER_ID) {
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ content: `Эта команда доступна только в канале <#${client.config.COMMANDS_CHANNEL_ID}>`, ephemeral: true });
        }
    }
};
