const { Telegraf } = require('telegraf');
const { Configuration, OpenAIApi } = require("openai");
const cron = require('node-cron')

require('dotenv').config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const bot = new Telegraf(process.env.TOKEN);
const openai = new OpenAIApi(configuration);

let chatId;

bot.start((ctx) => {
    ctx.reply('Всем привет! Этот бот каждый час отправляет задачки по программированию \n /generate - сгенерировать задачку');
    chatId = ctx.message.chat.id;
});

async function runCompletion () {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Сгенерируй задачку по программированию вход и выход сложное",
        temperature: 0.7,
        max_tokens: 700,
    });

    return completion.data.choices[0].text;
}

cron.schedule('0 * * * *', async () => {
    bot.telegram.sendMessage(chatId, await runCompletion())
});

bot.command('generate', async (ctx) => {
    ctx.reply(await runCompletion())
})

bot.help((ctx) => {
    ctx.reply('Все команды этого бота: \n /generate - сгенерировать задачку')
});

bot.launch();