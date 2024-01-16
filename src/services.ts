import * as firebase from 'firebase-admin';
import * as TelegramBot from 'node-telegram-bot-api';
import { Plate } from './models/plate';
import { Converter } from './models/converter';
import { User } from './models/user';
import { RecognitionClient } from './recognitionClient';


firebase.initializeApp();

/**
 * Telegram Bot Token
 */
const TELEGRAM_BOT_TOKEN: string = '6651799692:AAEA459PnXDEaQHTwu_N1VzIjrTHe1yWt2I'

/**
 * Telegram bot instance
 */
export const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);


/**
 * Firestore collection name with plates
 */
const FIRESTORE_PLATES_COLLECTION_NAME: string = 'plates';


/**
 * Firestore collection nane with users
 */
const FIRESTORE_USERS_COLLECTION_NAME: string = 'plates';


/**
 * Firestore instance
 */
const db = firebase.firestore();


/**
 * Plates collection ref
 */
export const platesCollection = db.collection(FIRESTORE_PLATES_COLLECTION_NAME).withConverter(new Converter<Plate>);


/**
 * Users collection ref
 */
export const usersCollection = db.collection(FIRESTORE_USERS_COLLECTION_NAME).withConverter(new Converter<User>);


/**
 * Plate recognition API token
 */
const PLATE_RECOGNITION_API_TOKEN: string = '41ad8b7ba0fbd541e30ffea79c8c3b3387e92aa5';

export const recognitionClient = new RecognitionClient(PLATE_RECOGNITION_API_TOKEN)
