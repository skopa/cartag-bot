import { Context, Middleware } from 'telegraf';
import * as admin from 'firebase-admin';


/**
 * Firestore service
 */
export type Firestore = admin.firestore.Firestore;


/**
 * Context with firestore
 */
export interface FirestoreContext extends Context {
    firestore: Firestore;
}


/**
 * Init firestore for bot context
 */
export const firestoreCtx = (): Middleware<FirestoreContext> =>
    async (ctx: Context, next) => {
        Object.defineProperty(ctx, 'firestore', { value: admin.firestore() });

        return next();
    };
