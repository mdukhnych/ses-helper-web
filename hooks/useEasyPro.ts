import { FIREBASE_FIRESTORE } from '@/firebaseConfig';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setEasyproPricelist } from '@/store/slices/servicesSlice';
import { EasyProPricelistItem } from '@/types/services';
import { collection, doc, DocumentData, DocumentReference, getDocs, writeBatch } from 'firebase/firestore';
import { useCallback, useState } from 'react'
import { toast } from 'sonner';

export default function useEasyPro() {
  const [isLoading, setIsLoading] = useState(false);
  const store = useAppSelector(state => state.services.data.find(item => item.id === "easy-pro"));
  const dispatch = useAppDispatch();

  const updateEasyproPricelist = useCallback(async (
    newPricelist: EasyProPricelistItem[], 
  ) => {

    if (!store) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    try {
      setIsLoading(true);
      const colRef = collection(FIREBASE_FIRESTORE, "services", "easy-pro", "pricelist");
      const snapshot = await getDocs(colRef);
      
      const operations: { type: 'set' | 'delete', ref: DocumentReference<DocumentData, DocumentData>, data?: EasyProPricelistItem }[] = [];
      
      const newModelsSet = new Set(newPricelist.map(item => String(item.model)));

      snapshot.docs.forEach(docSnap => {
        if (!newModelsSet.has(docSnap.id)) {
          operations.push({ type: 'delete', ref: docSnap.ref });
        }
      });

      newPricelist.forEach(item => {
        const docRef = doc(colRef, String(item.model));
        operations.push({ type: 'set', ref: docRef, data: item });
      });

      const CHUNK_SIZE = 450;
      for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
        const batch = writeBatch(FIREBASE_FIRESTORE);
        const chunk = operations.slice(i, i + CHUNK_SIZE);

        chunk.forEach(op => {
          if (op.type === 'delete') batch.delete(op.ref);
          if (op.type === 'set') batch.set(op.ref, op.data, { merge: true });
        });

        await batch.commit();
      }

      dispatch(setEasyproPricelist(newPricelist));
      toast.success(newPricelist.length === 0 ? "Прайс очищено" : "Прайс оновлено");

    } catch (error) {
      console.error("Firestore Update Error:", error);
      toast.error("Помилка при оновленні бази даних");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, store]);

  return {
    isLoading,
    updateEasyproPricelist
  }
}
