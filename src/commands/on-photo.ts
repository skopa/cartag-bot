import { Message, User } from '@telegraf/types';
import { message } from 'telegraf/filters';
import { bold, fmt, italic } from 'telegraf/format';

import { Bot } from '../bot';
import { Commands, getPlatesMenu } from '../utils';


/**
 * On Photo reaction
 * @param bot
 */
export const onPhoto = (bot: Bot) => bot
    .on(message('photo'), async (ctx) => {
        const message = (ctx.message as Message.PhotoMessage) || undefined;
        const photo = message.photo.pop() || undefined;
        const user = (ctx.from as User) || undefined;

        if (photo === undefined) {
            await ctx.reply('Photo not found.');
            return;
        }

        if (user === undefined) {
            console.warn('User was not found.');
            return;
        }

        const photoUrl = (await ctx.telegram.getFileLink(photo.file_id)).toString();
        console.info('Photo url: ', photoUrl);

        if (ctx.subscription.used >= ctx.subscription.total) {
            await ctx.reply(`No recognitions left. All ${ctx.subscription.total} turns were used.`, {
                reply_to_message_id: message.message_id,
            });
            return;
        }

        switch (true) {
        case !ctx.subscription.is_private:
            const replays = await ctx.replays.getReplaysList(message?.chat.id, photoUrl);
            const combinedMentions = replays
                .filter(({ tag }) => !!tag || ctx.subscription.show_anonymous_license_plates)
                .map(({ plate, tag }) => (tag ? fmt`${plate} ${tag}` : fmt`${plate}`).text)
                .join(', ');

            const { advertisement } = ctx.subscription;
            const ads = advertisement.show ? `\n\n>${italic`${advertisement.text}`.text}` : '';

            await ctx.subscription.use(1);
            await ctx.reply(
                fmt`${bold`FaFa `}${combinedMentions}${ads}`,
                { reply_to_message_id: ctx.message.message_id },
            );
            break;

        default:
            const candidatePlates = await ctx.recognition.recognizeCandidates(photoUrl);
            const addedPlates = await ctx.licensePlateManager.getUserLicensePlates(user.id);
            const toAdd = [...candidatePlates.keys()].filter(((plate) => !addedPlates.has(plate)));
            console.info('Manage plates adding', JSON.stringify({ candidatePlates, addedPlates, toAdd }));

            ctx.session.action = Commands.ADD;
            ctx.session.candidates = toAdd;

            const list = toAdd
                .map((plate) => ({ plate, chance: (candidatePlates.get(plate) || 0) * 100 }))
                .sort((a, b) => b.chance - a.chance)
                .map(({ plate, chance }) => plate + ': ' + chance.toFixed(0) + '%')
                .join('\n');

            const escapedText = list.length
                ? fmt`There are all recognized license plates:\n${list}\nChoose the plates to add.`
                : fmt`No license plates on photo.`;

            await ctx.reply(escapedText, getPlatesMenu(toAdd));
        }
    });
