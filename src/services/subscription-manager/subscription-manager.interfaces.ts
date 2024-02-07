import * as admin from 'firebase-admin';

/**
 * Subscription configuration
 */
export interface SubscriptionConfig {
    /**
     * Free recognitions per month
     */
    free_recognitions_per_month: number,

    /**
     * Default advertisement text
     */
    default_ads_text: string | false,
}

/**
 * Subscription firebase model
 */
export interface SubscriptionModel {
    /**
     * The start date of the month until which the plan_per_month is valid
     */
    plan_valid_until: null | admin.firestore.Timestamp,

    /**
     * Per month balance
     */
    plan_per_month: null | number,

    /**
     * Recognitions used balance
     */
    recognitions_used: number,

    /**
     * The start date of the month from which recognition_used is valid
     */
    recognitions_reset: admin.firestore.Timestamp,

    /**
     * Add the license plates to the message replay of not registered owners
     */
    show_plates_without_user: boolean,

    /**
     * Is bot is active for chat
     */
    active: boolean,

    /**
     * Preferred language
     */
    lang: 'ua' | 'en',

    /**
     * Advertisement text added to each replay message
     */
    ads_text: string | null | false,
}

/**
 * Subscription object
 */
export interface Subscription {
    /**
     * Amount of used recognitions
     */
    used: number,
    /**
     * Total available per month recognitions
     */
    total: number,
    /**
     * Use recognitions
     * @param amount Amount to use
     */
    use: (amount: number) => Promise<Subscription>,
}
