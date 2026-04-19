import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Motivations, MotivationsItem } from "@/types/information"
import { useCallback, useState } from "react";
import useFirebaseStorage from "./useFirebaseStorage";
import { toast } from "sonner";
import { handleError } from "@/utils";
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { FIREBASE_FIRESTORE } from "@/firebaseConfig";
import { updateMotivationsInStore } from "@/store/slices/informationSlice";
import { closeModal } from "@/store/slices/modalSlice";

const ITEMS_COLLECTION_PATH = "/information/motivations/items";

export default function useMotivations() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
    
  const store = useAppSelector(state => state.information.data.motivations) as Motivations | undefined;

  const { uploadFile, deleteFile, deleteFolder } = useFirebaseStorage();

  const addMotivation = useCallback(async ({item, file}: {
    item: MotivationsItem;
    file: File | null;
  }) => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);

    try {
      const ref = doc(collection(FIREBASE_FIRESTORE, ITEMS_COLLECTION_PATH));
      let downloadURL: string = "";

      if (file) {
        downloadURL = await uploadFile({ path: `/information/motivations/`, file });
      }

      const newItem = { ...item, id: ref.id, url: downloadURL };
      await setDoc(ref, newItem);
      dispatch(updateMotivationsInStore([...store.items, newItem]));
      toast.success("Інструкцію додано");
    } catch (error) {
      handleError(error, "Помилка при додаванні");
    } finally {
      dispatch(closeModal());
      setIsLoading(false);
    }
  }, [dispatch, store, uploadFile]);

  const updateMotivation = useCallback(async ({ item, file }: {
    item: MotivationsItem;
    file: File | null;
  }) => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);
    let newDownloadURL = item.url;
    let shouldDeleteOldFile = false;
    const prevUrl = store.items.find(i => i.id === item.id)?.url ?? "";

    try {
      if (file) {
        newDownloadURL = await uploadFile({ path: `/information/motivations/`, file });
        shouldDeleteOldFile = !!prevUrl;
      } 
      else if (!item.url && prevUrl) {
        newDownloadURL = "";
        shouldDeleteOldFile = true;
      }

      const newItem = { ...item, url: newDownloadURL };
      const ref = doc(FIREBASE_FIRESTORE, ITEMS_COLLECTION_PATH, item.id);
      
      await updateDoc(ref, newItem); 

      const newItems = store.items.map(i => i.id === item.id ? newItem : i);
      dispatch(updateMotivationsInStore(newItems));

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

  const deleteMotivation = useCallback(async (item: MotivationsItem) => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);
    try {
      await deleteDoc(doc(FIREBASE_FIRESTORE, ITEMS_COLLECTION_PATH, item.id));
      if (item.url) {
        await deleteFile(item.url).catch(e => console.warn("Файл не знайдено в Storage:", e));
      }
      const newItems = store.items.filter(i => i.id !== item.id);
      dispatch(updateMotivationsInStore(newItems));
      toast.success("Видалено успішно");
    } catch (error) {
      handleError(error, "Помилка при видаленні");
    } finally {
      setIsLoading(false);
    }
  }, [deleteFile, dispatch, store]);

  const clearMotivations = useCallback(async () => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);
    try {
      const collectionRef = collection(FIREBASE_FIRESTORE, ITEMS_COLLECTION_PATH);
      const querySnapshot = await getDocs(collectionRef);
      if (querySnapshot.empty) return;

      const batch = writeBatch(FIREBASE_FIRESTORE);
      querySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      await deleteFolder('/information/motivations');
      dispatch(updateMotivationsInStore([]));
      toast.success('Записи успішно очищені');
    } catch (error) {
      handleError(error, "Помилка при масовому видаленні");
    } finally {
      setIsLoading(false);
    }
  }, [deleteFolder, dispatch, store]);

  return {
    isLoading,
    addMotivation,
    updateMotivation,
    deleteMotivation,
    clearMotivations
  }
}
