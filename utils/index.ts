import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { FIREBASE_FIRESTORE } from "@/firebaseConfug";

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
  }).format(value);

export async function renameFirestoreDocument({
  collectionName, oldId, newId
}: {
  collectionName: string, 
  oldId: string, 
  newId: string
}) {
  const oldDocRef = doc(FIREBASE_FIRESTORE, collectionName, oldId);
  const newDocRef = doc(FIREBASE_FIRESTORE, collectionName, newId);

  const docSnap = await getDoc(oldDocRef);

  if (docSnap.exists()) {
    await setDoc(newDocRef, docSnap.data());
    await deleteDoc(oldDocRef);
    
    console.log(`Документ ${oldId} успішно перейменовано на ${newId}`);
  } else {
    console.error("Старий документ не знайдено!");
  }
}