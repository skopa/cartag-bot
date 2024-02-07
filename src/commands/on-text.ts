import { Message, User } from '@telegraf/types';
import { message } from 'telegraf/filters';

import { Bot } from '../bot';
import { Commands, getCommandsMenu, ukrToEng } from '../utils';


/**
 * Raw text processing
 * @param bot
 */
export const onText = (bot: Bot) => bot
    .on(message('text'), async (ctx) => {
        const message: Message.TextMessage = ctx.message;
        const user: User = ctx.from;

        if (!message || !user || !ctx.session?.action) {
            console.warn('Invalid request', JSON.stringify({ message, user, session: ctx.session }));
            return;
        }

        const { action } = ctx.session;
        delete ctx.session.action;

        switch (action) {
        case Commands.BACK: {
            await ctx.reply('Returning home', getCommandsMenu());
            return;
        }

        case Commands.REMOVE: {
            const plateToRemove = await ctx.licensePlateManager.getLicensePlateInfo(ukrToEng(message.text));

            if (plateToRemove.exists && plateToRemove.user_id === user.id) {
                await ctx.licensePlateManager.removeLicensePlate(plateToRemove.plate);
                await ctx.reply('License plate was removed successfully.', getCommandsMenu());
                return;
            }

            if (!plateToRemove.exists) {
                console.info('Selected license plate not found.', JSON.stringify({ plateToRemove, user }));
            }

            if (plateToRemove.user_id !== user.id) {
                await ctx.reply('License plate does not owned by you.');
            }

            return;
        }

        case Commands.ADD: {
            const plateToAdd = await ctx.licensePlateManager.getLicensePlateInfo(ukrToEng(message.text));

            if (!plateToAdd.exists) {
                await ctx.licensePlateManager.addLicensePlate(user.id, plateToAdd.plate);
                await ctx.reply('License plate added successfully.', getCommandsMenu());
            }

            if (plateToAdd.exists) {
                await ctx.reply('License plate already exists.', getCommandsMenu());
            }

            const toAddLeft = ((ctx.session.candidates as string[]) || [])
                .filter((plate: string) => plate !== plateToAdd.plate);

            if (toAddLeft.length === 0) {
                ctx.session.action = Commands.ADD;
                ctx.session.context = { toAdd: toAddLeft };
            }

            return;
        }

        default:
            console.warn('Unexpected action', JSON.stringify({ action, message }));
            return;
        }
    });
