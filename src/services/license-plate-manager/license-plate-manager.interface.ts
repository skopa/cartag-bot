import * as admin from 'firebase-admin';

/**
 * License plate model
 */
export interface LicensePlateModel extends admin.firestore.DocumentData {
    user_id: number;
}

/**
 * License plates collection ref
 */
export type LicensePlateCollectionRef = admin.firestore.CollectionReference<LicensePlateModel>;


export interface LicensePlateInfo {
    plate: string,
    exists: boolean;
    user_id: number | null
}
