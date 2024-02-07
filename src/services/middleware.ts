import { Context, Middleware } from 'telegraf';
import { defineString } from 'firebase-functions/params';

import { FirestoreContext, SessionContext } from '../middlewares';

import { LicensePlateRecognitionService } from './license-plate-recognition';
import { LicensePlateManagerService } from './license-plate-manager';
import { Subscription, SubscriptionManagerService } from './subscription-manager';
import { ReplayService } from './replay.service';

/**
 * Bot context
 */
declare type BotContext =
    Context &
    FirestoreContext &
    SessionContext;

/**
 * Context with services
 */
export interface ServicesContext extends BotContext {
    licensePlateManager: LicensePlateManagerService;
    recognition: LicensePlateRecognitionService;
    subscription: Subscription;
    replays: ReplayService;
}

/**
 * Registration shortcut
 *
 * @param ctx
 * @param name
 * @param resolver
 */
const register = async (ctx: BotContext, name: string, resolver: () => Promise<object> | object) => {
    const value = (typeof resolver === 'function') ? await resolver() : resolver;
    Object.defineProperty(ctx, name, { value });
};

/**
 * Init firestore for bot context
 */
export const servicesCtx = (): Middleware<ServicesContext> => async (ctx: ServicesContext, next) => {
    const recognitionApiKey = defineString('PLATE_RECOGNITION_API_TOKEN').value();

    await register(ctx, 'recognition', () => new LicensePlateRecognitionService(recognitionApiKey));
    await register(ctx, 'licensePlateManager', () => new LicensePlateManagerService(ctx.firestore));
    await register(ctx, 'replays', () => new ReplayService(ctx.telegram, ctx.recognition, ctx.licensePlateManager));

    const chatId = ctx?.chat?.id || null;
    const chatType = ctx?.chat?.type || 'private';

    if (chatId && chatType) {
        const subscriptionManagerService = new SubscriptionManagerService(ctx.firestore);
        await register(ctx, 'subscription', () => subscriptionManagerService.getSubscription(chatId, chatType));
    }

    return next();
};
