const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Помощь по командам")
        .addStringOption(option => 
            option.setName('category')
                .setDescription('Выберите категорию')
                .setRequired(false)
                .addChoices(
                    { name: "Модерирование", value: "moderation" },
                    { name: "Прочее", value: "other" },
                    { name: "Развлечения", value: "fun" }
                )
        ),
    async execute(interaction) {
        const category = interaction.options.getString('category');
        const embed = new EmbedBuilder();

        // Если категория не указана, то выводим все команды
        if (!category) {
            embed.setColor(9789108)
            .setTitle("Помощь по командам")
            .setFields(
                {
                    name: "Модерирование",
                    value: "</clear:1337356849418211368> </kick:1337471201215381580> </mute:1338023165661810698> </unmute:1339135398726860834>",
                    inline: false,
                },
                {
                    name: "Прочее",
                    value: "</si:1337400217032458324> </userinfo:1337480136207110144> </avatar:1337689963734634599> </math:1338499879957434418>",
                    inline: false,
                },
                {
                    name: "Развелечения",
                    value: "</roll:1337382361838518293> </flip:1337478340461858900>",
                    inline: false,
                        },
                    );
        }

        if (category === "moderation") {
            embed.setColor(9789108)
                .setTitle("Помощь по категории: Модерирование")
                .setDescription("Обязательные парамертры - <>, не обязательные параметры - []\n\n</clear:1337356849418211368> <количество сообщений> - удаляет определённое количество сообщений\n</kick:1337471201215381580> <пользователь> <причина> - исключает (кикает) пользователя с сервера\n</mute:1338023165661810698> <пользователь> <время> <причина> - заглушает пользователя на определённое время\n</unmute:1339135398726860834> <пользователь> - разглушивает пользователя")
        }

        if (category === "other") {
            embed.setColor(9789108)
                .setTitle("Помощь по категории: Прочее")
                .setDescription("Обязательные парамертры - <>, не обязательные параметры - []\n\n</si:1337400217032458324> - выводит информацию о сервере\n</userinfo:1337480136207110144> <пользователь> - выводит информацию о пользователе\n</avatar:1337689963734634599> <пользователь> - отправляет аватарку пользователя\n</math:1338499879957434418> <выражение> - вычисляет математическое выражение")
        }

        if (category === "fun") {
            embed.setColor(9789108)
                .setTitle("Помощь по категории: Развлечения")
                .setDescription("Обязательные парамертры - <>, не обязательные параметры - []\n\n</roll:1337382361838518293> [минимальное число] [максимальное число] - отправляет случайное число между двумя числами\n</flip:1337478340461858900> - подбрасывает монетку")
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};