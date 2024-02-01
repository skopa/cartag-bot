import { Context, Markup } from 'telegraf';

import { telegramBot } from './services/telegram-bot/telegram-bot.service';
import { platesManager } from './services/license-plates-manager.service';
import { escapeMarkdown, ukrToEngConverter } from './services/utils';
import { message } from 'telegraf/filters';
import { licensePlateRecognitionService } from './services/license-plate-recognition/license-plate-recognition.service';


enum Commands {
    LIST = 'List',
    ADD = 'Add',
    TRANSITION = 'Transition',
    REMOVE = 'Remove',
    BACK = 'Back'
}


const menu = Markup
    .keyboard([
        Commands.LIST,
        Commands.ADD,
        Commands.REMOVE,
    ])
    .resize()
    .persistent();

telegramBot.use(async (ctx: Context, next: () => void) => {
    switch (true) {
    case ctx?.chat?.type === 'private':
    case ctx?.message && ('photo' in ctx.message):
        await next();
        break;
    default:
        console.log('Unacceptable request: ', JSON.stringify(ctx));
    }
});


telegramBot.on(message('photo'), async (ctx) => {
    const photo = ctx.message.photo.pop();

    if (photo === undefined) {
        await ctx.reply('Something went wrong: photo not found.');
        return;
    }

    const photoUrl = (await ctx.telegram.getFileLink(photo.file_id)).toString();
    console.log('Photo url: ', photoUrl);

    const plates = await licensePlateRecognitionService.recognize(photoUrl);
    console.log('Recognised plates: ', JSON.stringify({ photoUrl, plates }));

    const userIdProcessor = async (plate: string) => {
        const document = await platesManager.getLicensePlate(plate);
        return { plate, userId: document.user_id || null };
    };

    const usersIds = await Promise.all(plates.map(userIdProcessor));
    console.log('Recognized users id`s: ', JSON.stringify(usersIds));

    const userTagsProcessor = async ({ plate, userId }: { plate: string, userId: number | null }) => {
        if (!userId) {
            return { plate, tag: null };
        }

        const user = await ctx.telegram.getChatMember(ctx.chat.id, userId).catch(() => null);

        if (!user || !user.user) {
            return { plate, tag: null };
        }

        const tag = user.user.username
            ? `@${ user.user.username }`
            : `[${ user.user.first_name }](tg://user?id=${ user.user.id })`;

        return { plate, tag };
    };

    const userTags = await Promise.all(usersIds.map(userTagsProcessor));
    console.log('Users to mention: ', JSON.stringify(userTags));

    const text = userTags
        .filter(({ tag }) => !!tag)
        .map(({ plate, tag }) => `${ tag } (${ plate })`)
        .join(', ');

    await ctx.replyWithMarkdownV2(escapeMarkdown('FaFa ' + text + '\n\nDon`t wait, add your plate @fafa2u_bot'), {
        reply_to_message_id: ctx.message.message_id,
    });
});


// Command to display the main menu
telegramBot.start(async (ctx: Context) => {
    await ctx.reply('Welcome! Use the buttons below to manage your plates:', menu);
});

telegramBot.hears(Commands.ADD, async (ctx) => {
    ctx.reply('Please type the plate number:');
    ctx.session.action = Commands.ADD;
});


// Command handler for the "Remove" button
telegramBot.hears(Commands.REMOVE, async (ctx) => {
    const list = await platesManager.getUserPlates(ctx.from.id);

    list.push(Commands.BACK);

    switch (true) {
    case (!list.length):
        ctx.reply('No plates to remove.');
        break;
    default:
        ctx.reply('Select a plate to remove:', Markup.keyboard(list).oneTime().resize());
        ctx.session.action = Commands.REMOVE;
    }
});


// Command handler for the "List" button
telegramBot.hears(Commands.LIST, async (ctx) => {
    const list = await platesManager.getUserPlates(ctx.from.id);
    const message = list.join(', ') || 'No plates added yet.';
    ctx.reply(message);
});


telegramBot.hears(Commands.BACK, async (ctx) => {
    delete ctx.session.action;
    await ctx.reply('Returning home.', menu);
});


telegramBot.on(message('text'), async (ctx) => {
    const userId = ctx.from.id;
    const licencePlateText = ukrToEngConverter(ctx.message.text);
    console.log('Transformed text: ', licencePlateText);

    if (!licencePlateText.length) {
        console.log('Empty plate text.');
        return;
    }

    switch (ctx.session?.action) {
    case Commands.ADD: {
        const licensePlate = await platesManager.getLicensePlate(licencePlateText);

        switch (true) {
        case licensePlate?.user_id === userId:
            await ctx.reply('License plate already registered to you.');
            break;

        case licensePlate?.exists:
            await ctx.reply(
                'License plate registered by another user.',
                Markup.keyboard([Commands.BACK]).resize().oneTime(),
            );
            break;

        default:
            delete ctx.session.action;
            await platesManager.addPlate(userId, licensePlate.id);
            await ctx.reply('License plate added successfully.', menu);
        }
        break;
    }

    case Commands.REMOVE: {
        const licensePlate = await platesManager.getLicensePlate(licencePlateText);

        switch (true) {
        case !licensePlate.exists:
            delete ctx.session.action;
            await ctx.reply('License plate not found.', menu);
            break;

        case licensePlate.user_id !== userId:
            await ctx.reply(
                'License plate registered by another user.',
                Markup.keyboard([Commands.BACK]).resize().oneTime(),
            );
            break;

        default:
            await platesManager.removePlate(licensePlate.id);
            await ctx.reply('License plate removed successfully.', menu);
        }
        break;
    }

    default:
        await ctx.reply('Unknown action ;(', menu);
    }
});

export { telegramBot };
