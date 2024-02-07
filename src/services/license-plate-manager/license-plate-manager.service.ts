import * as admin from 'firebase-admin';
import { LicensePlateCollectionRef, LicensePlateModel, LicensePlateInfo } from './license-plate-manager.interface';

/**
 * Subscriptions collection
 */
const FIRESTORE_COLLECTION = 'plates';


export class LicensePlateManagerService {
    /**
     * Collection ref
     * @private
     */
    private collection: LicensePlateCollectionRef;

    constructor(firestore: admin.firestore.Firestore) {
        this.collection = firestore
            .collection(FIRESTORE_COLLECTION)
            .withConverter<LicensePlateModel>({
                fromFirestore: (snapshot): LicensePlateModel => snapshot.data() as LicensePlateModel,
                toFirestore: (model): FirebaseFirestore.DocumentData => model,
            });
    }

    async getUserLicensePlates(userId: number): Promise<Set<string>> {
        const plateList = await this.collection.where('user_id', '==', userId).get();
        return new Set<string>(plateList.docs.map(({ id }) => id));
    }

    async getLicensePlateInfo(plate: string): Promise<LicensePlateInfo> {
        const doc = await this.collection.doc(plate).get();
        return { plate, exists: doc.exists, user_id: doc.data()?.user_id || null };
    }

    async getUsersIds(plates: string[]): Promise<LicensePlateInfo[]> {
        const docLists = plates.map((plate) => this.getLicensePlateInfo(plate));
        return await Promise.all(docLists);
    }

    async addLicensePlate(userId: number, licensePlate: string) {
        await this.collection.doc(licensePlate).set({ user_id: userId });
    }

    async removeLicensePlate(licensePlate: string) {
        await this.collection.doc(licensePlate).delete();
    }
}
