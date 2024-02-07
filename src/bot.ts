import { Context, Telegraf } from 'telegraf';
import { defineString } from 'firebase-functions/params';

import { FirestoreContext, SessionContext, firestoreCtx, sessionCtx } from './middlewares';
import { ServicesContext, servicesCtx } from './services/middleware';


/**
 * Bot context
 */
export declare type BotContext =
    Context &
    FirestoreContext &
    SessionContext &
    ServicesContext;


export type Bot = Telegraf<BotContext>;

/**
 * Plates collection ref
 */
export const initBot = () => {
    return (new Telegraf<BotContext>(defineString('TELEGRAM_BOT_TOKEN').value()))
        .use(firestoreCtx())
        .use(sessionCtx())
        .use(servicesCtx());
};
