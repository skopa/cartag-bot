import * as admin from 'firebase-admin';
import { Subscription, SubscriptionConfig, SubscriptionModel } from './subscription-manager.interfaces';
import { baseSubscription } from './subscription-manager.config';

/**
 * Subscriptions collection
 */
const FIRESTORE_COLLECTION = 'subscriptions';

/**
 * DocumentData shortcut
 */
declare type DocumentData = FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>;

/**
 * Chat type
 */
declare type ChatType = 'group' | 'private' | 'supergroup' | 'channel';

/**
 * Subscription manager service
 */
export class SubscriptionManagerService {
    constructor(
        private firestore: admin.firestore.Firestore,
        private configs: SubscriptionConfig = baseSubscription) {
    }

    /**
     * Use chat subscription balance
     */
    async getSubscription(chatId: number, chatType: ChatType): Promise<Subscription> {
        const subscription = await this.getSubscriptionDocument(chatId.toString(), chatType);
        return this.useBalance(subscription, 0);
    }

    /**
     * Get group subscription information
     */
    private async getSubscriptionDocument(chatId: string, chatType: ChatType): Promise<DocumentData> {
        return await this.firestore.runTransaction(async (transaction) => {
            const docSnapshot = await this.firestore
                .collection(FIRESTORE_COLLECTION)
                .doc(chatId)
                .get();

            if (!docSnapshot.exists) {
                transaction.set(docSnapshot.ref, this.getInitialData(chatType));
                return await docSnapshot.ref.get();
            } else {
                const data = docSnapshot.data() as SubscriptionModel;
                const monthStart = new Date();
                const update: Partial<SubscriptionModel> = {};
                monthStart.setDate(0);
                monthStart.setHours(0, 0, 0, 0);

                if (data.recognitions_reset.toMillis() < monthStart.getTime()) {
                    update.recognitions_reset = admin.firestore.Timestamp.fromDate(monthStart);
                    update.recognitions_used = 0;
                }

                if (data.plan_per_month &&
                    data.plan_valid_until &&
                    data.plan_valid_until?.toMillis() < Date.now()) {
                    update.plan_per_month = null;
                    update.plan_valid_until = null;
                }

                if (Object.keys(update).length) {
                    transaction.update(docSnapshot.ref, update);
                    return await docSnapshot.ref.get();
                }

                return docSnapshot;
            }
        });
    }

    /**
     * Use balance transaction. At this moment model data is checked.
     * The last action to do is check if recognitions left and use one.
     * @param subscription Subscription firebase document data
     * @param usage Amount of recognitions to use
     * @private
     */
    private async useBalance(subscription: DocumentData, usage = 1): Promise<Subscription> {
        return await this.firestore.runTransaction(async (transaction) => {
            const documentSnapshot = await transaction.get(subscription.ref);
            const document: SubscriptionModel = documentSnapshot.data() as SubscriptionModel;
            const total = this.getBalance(document.plan_per_month);
            const used = document.recognitions_used + usage;

            if (usage && total > used) {
                transaction.update(documentSnapshot.ref, { recognitions_used: document.recognitions_used + usage });
            }

            return {
                used,
                total,
                use: (amount) => this.useBalance(subscription, amount),
                advertisement: this.getAdvertisement(document.ads_text),
                show_anonymous_license_plates: document.show_plates_without_user,
                is_private: document.private,
            };
        });
    }

    /**
     * Get valid balance
     * @param planPerMonth
     */
    private getBalance = (planPerMonth: number | null) => (planPerMonth || this.configs.free_recognitions_per_month);

    /**
     * Get advertisement info
     * @param ads
     */
    private getAdvertisement = (ads: string | false | null): { show: boolean, text: string | null } => ({
        show: ads !== false,
        text: ads || this.configs.default_ads_text,
    });

    /**
     * Get initial document data
     */
    private getInitialData = (type: ChatType): SubscriptionModel => ({
        plan_valid_until: null,
        plan_per_month: null,
        active: true,
        ads_text: this.configs.default_ads_text,
        recognitions_reset: admin.firestore.Timestamp.now(),
        recognitions_used: 0,
        show_plates_without_user: true,
        private: type === 'private',
        lang: 'en',
    });
}
