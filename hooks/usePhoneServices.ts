import { FIREBASE_FIRESTORE } from '@/firebaseConfig';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeModal } from '@/store/slices/modalSlice';
import { setPhoneServicesData } from '@/store/slices/servicesSlice';
import { AddPhoneServiceItem, GoodsAndServicesItem, PhoneService, UpdateGoodsAndServiceItem } from '@/types/services';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useCallback, useState } from 'react'
import { toast } from 'sonner';

const DATA_COLLECTION_PATH = "/services/phone-services";

export default function usePhoneServices() {
  const store = useAppSelector(state => state.services.data.find(item => item.id === "phone-services")) as PhoneService | undefined;
  const dispatch = useAppDispatch();
  
  const [isLoading, setIsLoading] = useState(false);

  const updateGoodsAndServices = useCallback(async (items: UpdateGoodsAndServiceItem[]) => {
    if (!store) return toast.error("Сервіс не знайдено");

    setIsLoading(true); 
    try {
      const ref = collection(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, 'goodsAndServices');
      const snapshot = await getDocs(ref);

      const newItems: GoodsAndServicesItem[] = [];
      const batch = writeBatch(FIREBASE_FIRESTORE);

      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      items.forEach(item => {
        const newDocRef = doc(ref);
        batch.set(newDocRef, item);
        newItems.push({...item, id: newDocRef.id});
      });

      await batch.commit();
      dispatch(setPhoneServicesData({...store.data, goodsAndServices: newItems}));
      toast.success("Дані оновлено");
    } catch (error) {
      console.error(error);
      toast.error("Помилка при оновлені");
    } finally {
      setIsLoading(false); 
      dispatch(closeModal());
    }
  }, [dispatch, store]);

  const addPhoneService = useCallback(async (item: AddPhoneServiceItem) => {
    if (!store) return;

    setIsLoading(true);
    try {
      const ref = doc(collection(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, 'servicesItems'));
      await setDoc(ref, item);
      dispatch(setPhoneServicesData({
        ...store.data, 
        servicesItems: [...store.data.servicesItems, {...item, id: ref.id}] 
      }));
      toast.success("Додано успішно");
    } catch (error) {
      console.error(error);
      toast.error("Помилка при додаванні");
    } finally {
      setIsLoading(false);
      dispatch(closeModal());
    }
  }, [dispatch, store]);

  const updatePhoneService = useCallback(async (id: string, item: AddPhoneServiceItem) => {
    if (!store) return;

    setIsLoading(true);
    try {
      const ref = doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, 'servicesItems', id);
      await updateDoc(ref, item);
      dispatch(setPhoneServicesData({
        ...store.data, 
        servicesItems: store.data.servicesItems.map(i => i.id === id ? {...item, id} : i)
      }));
      toast.success("Оновлено");
    } catch (error) {
      console.error(error);
      toast.error("Помилка оновлення");
    } finally {
      setIsLoading(false);
      dispatch(closeModal());
    }
  }, [dispatch, store]);

  const deletePhoneService = useCallback(async (id: string) => {
    if (!store) return;

    setIsLoading(true);
    try {
      await deleteDoc(doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, 'servicesItems', id));
      dispatch(setPhoneServicesData({
        ...store.data,
        servicesItems: store.data.servicesItems.filter(item => item.id !== id),
      }));
      toast.success("Видалено");
    } catch (error) {
      console.error(error);
      toast.error("Помилка видалення");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, store]);

  const clearPhoneServices = useCallback(async () => {
    if (!store) return;

    setIsLoading(true);
    try {
      const ref = collection(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, 'servicesItems');
      const snapshot = await getDocs(ref);

      if (snapshot.empty) {
        setIsLoading(false);
        return;
      }

      const batch = writeBatch(FIREBASE_FIRESTORE);
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      dispatch(setPhoneServicesData({...store.data, servicesItems: []}));
      toast.success("Очищено");
    } catch (error) {
      console.error(error);
      toast.error("Помилка очищення");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, store]);

  return {
    isLoading, 
    updateGoodsAndServices,
    addPhoneService,
    updatePhoneService,
    deletePhoneService,
    clearPhoneServices
  }
}