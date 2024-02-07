import { Bot } from '../bot';
import { Commands, getCommandsMenu, getPlatesMenu } from '../utils';

/**
 * On Defined command reaction
 * @param bot
 */
export const onCommand = (bot: Bot) => bot
    // On start
    .start(async (ctx) => {
        await ctx.reply('Welcome to the bot. Here You can manage your license plates.', getCommandsMenu());
    })
    // Handle list command
    .hears(Commands.LIST, async (ctx) => {
        const list = [...await ctx.licensePlateManager.getUserLicensePlates(ctx.from.id)];
        const message = list.join('\n') || 'No plates added yet.';
        await ctx.reply(message);
    })

    // Handle add command
    .hears(Commands.ADD, async (ctx) => {
        ctx.session.action = Commands.ADD;
        await ctx.reply('Please type the plate number:');
    })

    // Handle remove command
    .hears(Commands.REMOVE, async (ctx) => {
        const plates = [...await ctx.licensePlateManager.getUserLicensePlates(ctx.from.id)];

        if (plates.length === 0) {
            await ctx.reply('You have not plates.');
            return;
        }

        ctx.session.action = Commands.REMOVE;
        await ctx.reply('Select a plate to remove:', getPlatesMenu(plates));
    })

    // Handle back command
    .hears(Commands.BACK, async (ctx) => {
        delete ctx.session.action;
        delete ctx.session.context;
        await ctx.reply('Returning back', getCommandsMenu());
    });

