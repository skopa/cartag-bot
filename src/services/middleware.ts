import { Context, Middleware } from 'telegraf';
import { FirestoreContext, SessionContext } from '../middlewares';
import { LicensePlateManagerService } from './license-plate-manager';
import { Subscription, SubscriptionManagerService } from './subscription-manager';
import { LicensePlateRecognitionService } from './license-plate-recognition';
import { defineString } from 'firebase-functions/lib/params';

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

    const chatId = ctx?.chat?.id || null;

    if (chatId) {
        const subscriptionManagerService = new SubscriptionManagerService(ctx.firestore);
        await register(ctx, 'subscription', () => subscriptionManagerService.getSubscription(chatId));
    }

    return next();
};
