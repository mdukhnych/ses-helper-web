import { FIREBASE_FIRESTORE } from '@/firebaseConfig';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeModal } from '@/store/slices/modalSlice';
import { setWarrantyDataStore } from '@/store/slices/servicesSlice';
import { Warranty, WarrantyService } from '@/types/services';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner';

const DATA_COLLECTION_PATH = "services/warranty-protection/data";

export default function useWarrantyProtection() {
  const store = useAppSelector(state => state.services.data.find(item => item.id === "warranty-protection")) as WarrantyService | undefined;
  const dispatch = useAppDispatch();
  const storeRef = useRef(store);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  const nextOrder = useMemo(() => {
    if (!store?.data || store.data.length === 0) return 1;
    return Math.max(...store.data.map(d => d.order ?? 0)) + 1;
  }, [store?.data]);
  

  const addWarranty = useCallback(async (data: Warranty) => {
    const currentStore = storeRef.current;
    if (!currentStore) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    try {
      const ref = doc(collection(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH));
      const newItem = {...data, order: nextOrder };

      await setDoc(ref, newItem);
      dispatch(setWarrantyDataStore([...currentStore.data, { ...newItem, id: ref.id }]));
      toast('Елемент додано!');
    } catch (error) {
      console.error("Помилка при додаванні: ", error);
      toast.error("Не вдалося додати дані. Спробуйте пізніше.");
    } finally {
      dispatch(closeModal());
    }
  }, [dispatch, nextOrder]);

  const updateWarranty = useCallback(async (id: string, data: Warranty) => {
    const currentStore = storeRef.current;
    if (!currentStore) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    try {
      const ref = doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, id);
      await updateDoc(ref, data);
      dispatch(setWarrantyDataStore(
        currentStore.data.map(item => item.id === id ? { ...item, ...data } : item)
      ));
      toast("Дані оновлено");
    } catch (error) {
      console.error("Помилка при оновлені: ", error);
      toast.error("Не вдалося оновити дані. Спробуйте пізніше.");
    } finally {
      dispatch(closeModal());
    }
  }, [dispatch]);

  const deleteWarranty = useCallback(async (id: string) => {
    const currentStore = storeRef.current;
    if (!currentStore) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    try {
      await deleteDoc(doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, id));
      dispatch(setWarrantyDataStore(
        currentStore.data.filter(item => item.id !== id)
      ));
      toast.success("Видалено");
    } catch (error) {
      console.error("Помилка при видалені: ", error);
      toast.error("Не вдалося видалити дані. Спробуйте пізніше.");
    }
  }, [dispatch]);

  const clearWarrantyData = useCallback(async () => {
    const currentStore = storeRef.current;
    if (!currentStore) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    try {
      const ref = collection(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH);
      const snapshot = await getDocs(ref);

      const batch = writeBatch(FIREBASE_FIRESTORE);
      if (snapshot.empty) {
          console.log('Документів для видалення не знайдено');
          return;
      }
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      dispatch(setWarrantyDataStore([]));
      toast.success("Всі дані видалено");

    } catch (error) {
      console.error("Помилка при видалені всіх обєктів: ", error);
      toast.error("Не вдалося видалити дані. Спробуйте пізніше.");
    }
  }, [dispatch]);

  return {
    addWarranty,
    updateWarranty,
    deleteWarranty,
    clearWarrantyData
  }
}
