import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { FIREBASE_FIRESTORE } from "@/firebaseConfug";
import { toast } from "sonner";

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
  }).format(value);

export const checkUniqueId = (id: string, ids: string[]) => {
    if (id === "") {
      toast.error("Поле ID не може бути порожнім.", { position: "top-center" });
      return false;
    }

    if (ids.includes(id)) {
      toast.error("Послуга з таким ID вже зареєстрована.", { position: "top-center" });
      return false;
    } else {
      return true;
    }
  }

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