import { Context } from 'telegraf';


interface SessionData {
    action?: string;
    licensePlate?: string;
}


export interface BotContext extends Context {
    session?: any | SessionData;
}
