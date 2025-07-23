import { doc, getDoc } from "firebase/firestore"
import { FIREBASE_DB } from "../../firebaseConfig";


export const getUserData = async (uid: string) => {
  const docRef = doc(FIREBASE_DB, "users", uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const userData = docSnap.data()
    userData.id = uid
    return userData
  } else {
    return null
  }
  
} 