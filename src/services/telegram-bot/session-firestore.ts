import { CollectionReference } from '@google-cloud/firestore';
import { Context, Middleware } from 'telegraf';

export function sessionFirestore<C extends Context>(
    collection: CollectionReference,
): Middleware<C> {
    async function getSession(key: string): Promise<C | undefined> {
        const snapshot = await collection.doc(key).get();
        return snapshot.exists ? (snapshot.data() as C) : undefined;
    }

    async function saveSession(key: string, session: any): Promise<void> {
        (session == null || Object.keys(session).length === 0)
            ? await collection.doc(key).delete()
            : await collection.doc(key).set(session);
    }

    return async (ctx, next) => {
        const key = ctx.from && ctx.chat && `${ ctx.from.id }-${ ctx.chat.id }`;

        if (key === undefined) {
            return next?.();
        }

        let session: any;

        session = (await getSession(key)) || {};

        Object.defineProperty(ctx, 'session', {
            get() {
                return session;
            },
            set(newValue) {
                session = Object.assign({}, newValue);
            },
        });

        const nextResult = await next?.();

        await saveSession(key, session);

        return nextResult;
    };
}

