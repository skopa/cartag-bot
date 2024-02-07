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

        const { advertisement } = ctx.subscription;
        const ads = advertisement.show ? `\n\n>${italic`${advertisement.text}`.text}` : '';

        if (ctx.subscription.used >= ctx.subscription.total) {
            await ctx.reply(fmt`No recognitions left. All ${ctx.subscription.total} turns were used.${ads}`, {
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

            await ctx.subscription.use(1);
            await ctx.reply(
                fmt`${bold`FaFa: `}${combinedMentions}${ads}`,
                { reply_to_message_id: ctx.message.message_id },
            );
            break;

        default:
            const candidates = await ctx.recognition.recognizeCandidates(photoUrl);
            const plateInfos = await ctx.licensePlateManager.getUsersIds([...candidates.keys()]);

            const registeredPlates = plateInfos
                .filter((info) => info.exists)
                .map(({ plate }) => plate);

            const newPlates = plateInfos
                .filter((info) => !info.exists)
                .map(({ plate }) => plate);

            console.info('Adding from photo', JSON.stringify({ candidates, registeredPlates, newPlates }));

            ctx.session.action = Commands.ADD;
            ctx.session.candidates = newPlates;

            const newPlatesList = newPlates
                .map((plate) => ({ plate, chance: (candidates.get(plate) || 0) * 100 }))
                .sort((a, b) => b.chance - a.chance)
                .map(({ plate, chance }) => plate + ': ' + chance.toFixed(2) + '%')
                .join('\n');

            const registeredPlatesText = registeredPlates.length
                ? fmt`List of already added:\n${registeredPlates.join('\n')}\n\n`
                : fmt``;

            const newPlatesText = newPlatesList.length
                ? fmt`Choose the plates to add from all recognized license plates:\n${newPlatesList}\n\n`
                : fmt`No license plates to add.`;

            await ctx.reply(fmt`${registeredPlatesText.text}${newPlatesText.text}`, getPlatesMenu(newPlates));
        }
    });
