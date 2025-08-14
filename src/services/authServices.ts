import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_FIRESTORE } from "../../firebaseConfig";

export const getUserData = async (uid: string) => {
  const docRef = doc(FIREBASE_FIRESTORE, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } 
}