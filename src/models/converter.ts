import {firestore} from "firebase-admin";

export class Converter<Model> implements firestore.FirestoreDataConverter<Model> {
  toFirestore(plate: Model): firestore.DocumentData {
    return plate as firestore.DocumentData;
  }

  fromFirestore(snapshot: firestore.QueryDocumentSnapshot): Model {
    return snapshot.data()! as Model;
  }
}
