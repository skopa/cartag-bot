import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Firestore collection names
 */
enum Collections {
    LICENSE_PLATES = 'plates',
    SESSIONS = 'sessions',
}


/**
 * License plate model
 */
export interface LicensePlateModel {
    user_id: number;
}


/**
 * Types converter
 * @return {FirestoreDataConverter}
 */
const converter = <T>(): admin.firestore.FirestoreDataConverter<T> => ({
    toFirestore(plate: T): admin.firestore.DocumentData {
        return plate as admin.firestore.DocumentData;
    },

    fromFirestore(snapshot: admin.firestore.QueryDocumentSnapshot): T {
        return snapshot.data() as T;
    },
});


export type LicensePlateCollectionRef = admin.firestore.CollectionReference<LicensePlateModel>;

/**
 * Plates collection ref
 */
export const platesCollection: LicensePlateCollectionRef = admin
    .firestore()
    .collection(Collections.LICENSE_PLATES)
    .withConverter(converter<LicensePlateModel>());


/**
 * Sessions collection ref
 */
export const sessionsCollections = admin
    .firestore()
    .collection(Collections.SESSIONS);
