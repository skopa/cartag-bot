import { Telegraf } from 'telegraf';
import { BotContext } from './interfaces';
import { sessionsCollections } from '../firestore.service';
import { sessionFirestore } from './session-firestore';


/**
 * Telegram Bot Token
 */
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;


/**
 * Plates collection ref
 */
export const telegramBot = (new Telegraf<BotContext>(TELEGRAM_BOT_TOKEN))
    // bot.use(session());
    .use(sessionFirestore(sessionsCollections));

