import { Telegraf } from 'telegraf';
import { BotContext } from './interfaces';
import { sessionsCollections } from '../firestore.service';
import { sessionFirestore } from './session-firestore';
import { defineString } from 'firebase-functions/params';


/**
 * Telegram Bot Token
 */
const TELEGRAM_BOT_TOKEN = defineString('TELEGRAM_BOT_TOKEN');


/**
 * Plates collection ref
 */
export const telegramBot = (new Telegraf<BotContext>(TELEGRAM_BOT_TOKEN.value()))
    // bot.use(session());
    .use(sessionFirestore(sessionsCollections));

