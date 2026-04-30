import { FIREBASE_FIRESTORE } from '@/firebaseConfig';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { PromoItem, Promos } from '@/types/information'
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useCallback, useState } from 'react'
import { toast } from 'sonner';
import useFirebaseStorage from './useFirebaseStorage';
import { handleError } from '@/utils';
import { closeModal } from '@/store/slices/modalSlice';
import { updatePromosInStore } from '@/store/slices/informationSlice';

const ITEMS_COLLECTION_PATH = "/information/promos/items";

export default function usePromos() {
  const store = useAppSelector(state => state.information.data.promos) as Promos | undefined;
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();

  const { uploadFile, deleteFile, deleteFolder } = useFirebaseStorage();

  const addPromo = useCallback(async ({item, file}: {
    item: PromoItem;
    file: File | null;
  }) => {
    if (!store) return toast.error("Акції не знайдено");
    setIsLoading(true);
    try {
      const ref = doc(collection(FIREBASE_FIRESTORE, ITEMS_COLLECTION_PATH));
      let downloadURL = "";

      if (file) {
        downloadURL = await uploadFile({path: "/information/promos/", file: file});
      }

      const newItem = { ...item, id: ref.id, sku: downloadURL };
      await setDoc(ref, newItem);
      dispatch(updatePromosInStore([...store.items, newItem]));
      toast.success("Інструкцію додано");

    } catch (error) {
      handleError(error, "Помилка при додаванні");
    } finally {
      dispatch(closeModal());
      setIsLoading(false);
    }
  }, [dispatch, store, uploadFile]);

  const updatePromo = useCallback(async ({ item, file }: {
      item: PromoItem;
      file: File | null;
  }) => {
    if (!store) return toast.error("Акцій не знайдено");
    setIsLoading(true);
    let newDownloadURL = item.sku;
    let shouldDeleteOldFile = false;
    const prevUrl = store.items.find(i => i.id === item.id)?.sku ?? "";

    try {
      if (file) {
        newDownloadURL = await uploadFile({ path: `/information/promos/`, file });
        shouldDeleteOldFile = !!prevUrl;
      } 
      else if (!item.sku && prevUrl) {
        newDownloadURL = "";
        shouldDeleteOldFile = true;
      }

      const newItem = { ...item, sku: newDownloadURL };
      const ref = doc(FIREBASE_FIRESTORE, ITEMS_COLLECTION_PATH, item.id);
      
      await updateDoc(ref, newItem); 

      const newItems = store.items.map(i => i.id === item.id ? newItem : i);
      dispatch(updatePromosInStore(newItems));

      if (shouldDeleteOldFile && prevUrl) {
        await deleteFile(prevUrl).catch(e => console.warn("Старий файл не видалено:", e));
      }

      toast.success("Дані оновлено!");
    } catch (error) {
      handleError(error, "Помилка при оновленні");
    } finally {
      dispatch(closeModal())
      setIsLoading(false);
    }
  }, [deleteFile, dispatch, store, uploadFile]);

  const deletePromo = useCallback(async (item: PromoItem) => {
    if (!store) return toast.error("Акцій не знайдено");
    setIsLoading(true);
    try {
      await deleteDoc(doc(FIREBASE_FIRESTORE, ITEMS_COLLECTION_PATH, item.id));
      if (item.sku) {
        await deleteFile(item.sku).catch(e => console.warn("Файл не знайдено в Storage:", e));
      }
      const newItems = store.items.filter(i => i.id !== item.id);
      dispatch(updatePromosInStore(newItems));
      toast.success("Видалено успішно");
    } catch (error) {
      handleError(error, "Помилка при видаленні");
    } finally {
      setIsLoading(false);
    }
  }, [deleteFile, dispatch, store]);

  const clearPromos = useCallback(async () => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);
    try {
      const collectionRef = collection(FIREBASE_FIRESTORE, ITEMS_COLLECTION_PATH);
      const querySnapshot = await getDocs(collectionRef);
      if (querySnapshot.empty) return;

      const batch = writeBatch(FIREBASE_FIRESTORE);
      querySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      await deleteFolder('/information/promos');
      dispatch(updatePromosInStore([]));
      toast.success('Записи успішно очищені');
    } catch (error) {
      handleError(error, "Помилка при масовому видаленні");
    } finally {
      setIsLoading(false);
    }
  }, [deleteFolder, dispatch, store]);

  return {
    isLoading,
    addPromo,
    updatePromo,
    deletePromo,
    clearPromos
  }
}
