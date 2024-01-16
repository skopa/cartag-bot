import * as functions from 'firebase-functions';
import * as TelegramBot from 'node-telegram-bot-api';


import { bot, platesCollection, recognitionClient } from './services';
import { escapeMarkdown, toEngConverter } from './toEngConverter';

/**
 * Welcome reaction
 */
bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
    await bot.sendMessage(msg.chat.id, `Hello, @${ msg.from?.username || msg.from?.id || 'guest' } Welcome to the bot\\.`, {
        parse_mode: 'MarkdownV2',
    });

    return 'ok';
});


bot.on('photo', async (msg: TelegramBot.Message) => {
    const imageId: string | undefined = msg.photo?.slice(-1)?.pop()?.file_id;

    if (imageId === undefined) {
        await bot.sendMessage(msg.chat.id, `No image in the message.`, {
            reply_to_message_id: msg.message_id
        });

        return 'ok';
    }

    const imageUrl = await bot.getFileLink(imageId);
    console.log('Image url:', imageUrl);
    const results = await recognitionClient.recognize(imageUrl);

    if (!results.length) {
        await bot.sendMessage(msg.chat.id, `No plates on photo.`, {
            reply_to_message_id: msg.message_id
        });

        return 'ok';
    }

    for (const plateText of results) {
        const engPlate = toEngConverter(plateText);
        const plate = await platesCollection.doc(engPlate).get();
        const userId = plate.data()?.user_id;

        if (!plate.exists || !userId) {
            await bot.sendMessage(msg.chat.id, `${ engPlate } owner not registered. Don't wait: /plateadd ${ engPlate }`, {
                reply_to_message_id: msg.message_id
            });
        } else {
            try {

                const { user } = await bot.getChatMember(msg.chat.id, userId);

                let mention = escapeMarkdown(
                    user.username
                        ? `@${ user.username }`
                        : `[@${ user.first_name }](tg://user?id=${ user.id })`
                );

                await bot.sendMessage(msg.chat.id, `FaFa, ${ mention }`, {
                    reply_to_message_id: msg.message_id,
                    parse_mode: 'MarkdownV2',
                });
            } catch (e) {
                console.log('No access to user or user not found.');
            }
        }
    }

    return 'ok';
});


/**
 * Add plate
 */
bot.onText(/\/plateadd (.*)/, async (msg: TelegramBot.Message, match) => {
    const plateText: string | undefined = match?.pop();
    const userId: number | undefined = msg.from?.id;

    if (plateText === undefined || userId === undefined) {
        await bot.sendMessage(msg.chat.id, 'Sorry, Invalid license plate number or userId.');
        return 'ok';
    }

    try {
        const engPlate = toEngConverter(plateText);
        await bot.sendMessage(msg.chat.id, 'Adding plate: ' + engPlate);
        const plate = platesCollection.doc(engPlate);

        if (!(await plate.get()).exists) {
            await plate.create({ user_id: userId });
            await bot.sendMessage(msg.chat.id, 'Successfully added.');
        } else {
            await bot.sendMessage(msg.chat.id, 'Plate already assigned.');
        }
    } catch (error: any) {
        await bot.sendMessage(msg.chat.id, 'Sorry, something went wrong: ' + error.message);
    }

    return 'ok';
});


/**
 * Remove plates
 */
bot.onText(/\/plateremove (.*)/, async (msg: TelegramBot.Message, match) => {
    const plateText: string | undefined = match?.pop();
    const userId: number | undefined = msg.from?.id;

    if (plateText === undefined || userId === undefined) {
        await bot.sendMessage(msg.chat.id, 'Sorry, Invalid license plate number or userId.');
        return 'ok';
    }

    try {
        const engPlate = toEngConverter(plateText);
        await bot.sendMessage(msg.chat.id, 'Deleting plate: ' + engPlate);
        const plate = platesCollection.doc(engPlate);
        const plateData = await plate.get();

        if (plateData.exists && plateData.data()?.user_id === userId) {
            await plate.delete();
            await bot.sendMessage(msg.chat.id, 'Successfully deleted.');
        } else {
            await bot.sendMessage(msg.chat.id, 'Plate not found or relates to other user.');
        }
    } catch (error: any) {
        await bot.sendMessage(msg.chat.id, 'Sorry, something went wrong: ' + error.message);
    }

    return 'ok';
});


bot.onText(/\/plates/, async (msg: TelegramBot.Message) => {
    const userId: number | undefined = msg.from?.id;

    if (userId === undefined) {
        await bot.sendMessage(msg.chat.id, 'Sorry, Invalid userId.', {
            reply_to_message_id: msg.message_id
        });
        return 'ok';
    }

    try {
        const plates = await platesCollection.where('user_id', '==', userId).get();
        const formatted = plates.docs.map((doc) => '>' + doc.id).join('\n');

        if (formatted) {
            await bot.sendMessage(msg.chat.id, 'Your plates: \n' + formatted, {
                parse_mode: 'MarkdownV2',
            });
        } else {
            await bot.sendMessage(msg.chat.id, 'You have not plates.');
        }
    } catch (error: any) {
        await bot.sendMessage(msg.chat.id, 'Sorry, something went wrong: ' + error.message);
    }

    return 'ok';
});

bot.command()


/**
 * Entry point
 */
export const telegramBotWebhook = functions.https.onRequest((req, res) => {
    // Verify the request is from Telegram by checking the request's content type
    if (req.get('content-type') === 'application/json') {
        console.log('Processing request: ', JSON.stringify(req.body));
        bot.processUpdate(req.body);
        res.status(200).send('OK');
    } else {
        res.status(400).send('Invalid request');
    }
});
