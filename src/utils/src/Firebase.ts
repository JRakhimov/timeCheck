import * as Firebase from "firebase-admin";
import serviceAccount from "../../../serviceAccount.json";

export const firebase = Firebase.initializeApp({
  credential: Firebase.credential.cert(serviceAccount as Firebase.ServiceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});
