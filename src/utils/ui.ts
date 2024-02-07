import { Markup } from 'telegraf';
import { Commands } from '../commands/commands';

/**
 * Get menu with plates to choose
 *
 * @param plates
 */
export function getPlatesMenu(plates: string[]) {
    return Markup
        .keyboard([...plates, Commands.BACK])
        .resize()
        .oneTime();
}


/**
 * Menu with commands
 */
export function getCommandsMenu() {
    const commands = [
        Commands.LIST,
        Commands.ADD,
        Commands.REMOVE,
    ];

    return Markup
        .keyboard(commands)
        .resize()
        .persistent();
}
