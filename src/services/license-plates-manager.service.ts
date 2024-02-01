import { LicensePlateCollectionRef, platesCollection } from './firestore.service';


export interface LicensePlateDoc {
    exists: boolean,
    id: string,
    user_id?: number,
}


export class LicensePlatesManagerService {
    constructor(private collection: LicensePlateCollectionRef) {
    }

    async getUserPlates(userId: number): Promise<string[]> {
        const plateList = await this.collection.where('user_id', '==', userId).get();
        return plateList.docs.map((doc) => doc.id);
    }

    async getLicensePlate(licencePlate: string): Promise<LicensePlateDoc> {
        const doc = await this.collection.doc(licencePlate).get();
        return {
            exists: doc.exists,
            id: doc.id,
            user_id: doc.data()?.user_id,
        };
    }

    async addPlate(userId: number, licensePlate: string) {
        await this.collection.doc(licensePlate).set({ user_id: userId });
    }

    async removePlate(licensePlate: string) {
        await this.collection.doc(licensePlate).delete();
    }
}


export const platesManager = new LicensePlatesManagerService(platesCollection);
