import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { onCommand, onText, onPhoto } from './commands';
import { initBot } from './bot';

admin.initializeApp();

/**
 * Entry point
 */
export const telegramBotWebhook = functions.region('europe-west1').https.onRequest(
    async (req, res) => {
        if (req.get('content-type') === 'application/json') {
            const bot = initBot();
            console.log('Processing request: ', JSON.stringify(req.body));

            onCommand(bot);
            onPhoto(bot);
            onText(bot);

            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } else {
            res.status(400).send('Invalid request');
        }
    },
);

