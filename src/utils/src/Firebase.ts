import * as Firebase from "firebase-admin";
import serviceAccount from "../../../serviceAccount.json";
import { Database } from "../../whatsapp/types";

export const firebase = Firebase.initializeApp({
  credential: Firebase.credential.cert(serviceAccount as Firebase.ServiceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

export const dbSnapshot = async (): Promise<Database> =>
  firebase
    .database()
    .ref()
    .once("value")
    .then(x => x.val());
