const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Удаляет сообщения")
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Количество сообщений для удаления')
                .setRequired(true)
        ),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'У вас нет прав для удаления сообщений.', ephemeral: true });
        }

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Количество должно быть от 1 до 100', ephemeral: true });
        }

        await interaction.channel.bulkDelete(amount, true).catch(error => {
            console.error('Ошибка при очистке сообщений:', error);
        });

        const pluralize = (num) => {
            if (num % 10 === 1 && num % 100 !== 11) return 'сообщение';
            if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'сообщения';
            return 'сообщений';
        };

        // Создание Embed-сообщения
        const embed = new EmbedBuilder()
            .setColor(9789108)
            .setTitle("Очистка чата")
            .setDescription(`Удалено **${amount}** ${pluralize(amount)}`)
            .setFooter({
                text: `Команду выполнил: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            })

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
};
