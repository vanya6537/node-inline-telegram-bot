const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const BOT_TOKEN = process.env.BOT_TOKEN
const CHANNEL_ID = process.env.CHANNEL_ID

const bot = new Telegraf(BOT_TOKEN)

// bot.use(Telegraf.log())
bot.use((ctx, next) => {
    // console.log(`from ${ctx.state.emoji}`)
    if (ctx.message && ctx.message.entities) {
        const urlEntity = ctx.message.entities.find((entity) => entity.type === 'url')
        const tagCloserIndex = ctx.message.text.indexOf('</a>')
        console.log(ctx.message.text.slice(urlEntity.offset + urlEntity.length + 2, tagCloserIndex))
        if (urlEntity && tagCloserIndex) {
            ctx.state.emoji = ctx.message.text.slice(urlEntity.offset + urlEntity.length + 2, tagCloserIndex)
            console.log(ctx.state.emoji)
        }
    }
    return next()
})
bot.catch((error, context) => {
    console.log(error);
    // console.log(context);
})

bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username
})

const extraMarkup = Extra.webPreview(false).HTML().markup((m) =>
    m.inlineKeyboard([
        m.callbackButton('👉СМОТРЕТЬ ВИДЕО👈', 'check')
    ])
)
bot.on('message', (ctx) => {
    ctx.telegram.sendCopy(CHANNEL_ID, ctx.message, extraMarkup)
})

bot.action('check', (ctx) => {
    ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id).then((member) => {
        // console.log(member);
        const isMember = member.status !== 'left' && member.status !== 'kicked'
        console.log(ctx.state.emoji)
        if (isMember) {
            return ctx.answerCbQuery(`✅Спасибо что подписался! Ткни на ${ctx.state.emoji || '⚽'}️ и наслаждайся просмотром!`, true);
        } else {
            return ctx.answerCbQuery("☑️Чтобы посмотреть контент тебе нужно подписаться на канал👇", true)
        }
    })
})

bot.launch()