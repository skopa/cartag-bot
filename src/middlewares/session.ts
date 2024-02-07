import { Middleware } from 'telegraf';

import { FirestoreContext } from './firestore';


/**
 * Sessions collection
 */
const FIRESTORE_COLLECTION = 'sessions';


/**
 * Session data
 */
declare type SessionData = { [key: string]: object | string | number | Array<object | string | number> };

/**
 * Context with firestore
 */
export interface SessionContext extends FirestoreContext {
    session: SessionData;
}


/**
 * Firestore session middleware
 */
export const sessionCtx = (): Middleware<SessionContext> =>
    async (ctx: FirestoreContext, next) => {
        const collection = ctx.firestore.collection(FIRESTORE_COLLECTION);
        const key = ctx.from && ctx.chat && `${ctx.from.id}-${ctx.chat.id}`;

        if (key === undefined) {
            return next();
        }

        const snapshot = await collection.doc(key).get();
        let data = snapshot.exists ? snapshot.data() : {};

        Object.defineProperty(ctx, 'session', {
            get: () => data,
            set: (val) => (data = Object.assign({}, val)),
        });

        const nextResult = await next?.();

        (data == null || Object.keys(data).length === 0)
            ? await collection.doc(key).delete()
            : await collection.doc(key).set(data);

        return nextResult;
    };
