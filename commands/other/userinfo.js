const { Client, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const client = new Client({
    intents: []
});

client.config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Информация о пользователе")
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Пользователь для получения информации')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`Информация о ${user.username}`)
            .setColor(9789108)
            .addFields(
                { name: "Имя:", value: `${user.username}`, inline: true },
                { name: "ID:", value: `${user.id}`, inline: true },
                { name: "Дата регистрации:", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`, inline: false },
                { name: "Дата присоединения:", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setFooter({
                text: `Команду выполнил: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        if (interaction.channel.id === client.config.COMMANDS_CHANNEL_ID || interaction.user.id === client.config.OWNER_ID) {
            await interaction.reply({ embeds: [embed], ephemeral: false });
        } else {
            await interaction.reply({ content: `Эта команда доступна только в канале <#${client.config.COMMANDS_CHANNEL_ID}>`, ephemeral: true });
        }
    }
};