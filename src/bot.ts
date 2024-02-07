import { Context, Telegraf } from 'telegraf';
import { defineString } from 'firebase-functions/params';

import { FirestoreContext, SessionContext, firestoreCtx, sessionCtx } from './middlewares';
import { ServicesContext, servicesCtx } from './services/middleware';


/**
 * Telegram Bot Token
 */
const TELEGRAM_BOT_TOKEN = defineString('TELEGRAM_BOT_TOKEN');


/**
 * Bot context
 */
declare type BotContext =
    Context &
    FirestoreContext &
    SessionContext &
    ServicesContext;


export type TelegrafService = Telegraf<BotContext>;

/**
 * Plates collection ref
 */
export const bot = (new Telegraf<BotContext>(TELEGRAM_BOT_TOKEN.value()))
    .use(firestoreCtx())
    .use(sessionCtx())
    .use(servicesCtx());

