import * as functions from 'firebase-functions';
import { telegramBot } from './command-router';

/**
 * Entry point
 */
export const telegramBotWebhook = functions.https.onRequest(async (req, res) => {
    if (req.get('content-type') === 'application/json') {
        console.log('Processing request: ', JSON.stringify(req.body));
        await telegramBot.handleUpdate(req.body);
        res.status(200).send('OK');
    } else {
        res.status(400).send('Invalid request');
    }
});

