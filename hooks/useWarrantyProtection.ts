import { FIREBASE_FIRESTORE } from '@/firebaseConfig';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeModal } from '@/store/slices/modalSlice';
import { setWarrantyDataStore } from '@/store/slices/servicesSlice';
import { Warranty, WarrantyDataItem, WarrantyService } from '@/types/services';
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner';
import useFirebaseStorage from './useFirebaseStorage';

const DATA_COLLECTION_PATH = "services/warranty-protection/data";

export default function useWarrantyProtection() {
  const store = useAppSelector(state => state.services.data.find(item => item.id === "warranty-protection")) as WarrantyService | undefined;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const { uploadFile, deleteFile, deleteFolder } = useFirebaseStorage();

  const nextOrder = useMemo(() => {
    if (!store?.data || store.data.length === 0) return 1;
    return Math.max(...store.data.map(d => d.order ?? 0)) + 1;
  }, [store?.data]);

  const addWarranty = useCallback(async ({data, file}: {
    data: Warranty;
    file: File | null;
  }) => {
    if (!store) {
      toast.error("Не вдалося знайти поточний сервіс!");
      return;
    }
    setIsLoading(true);
    try {
      const ref = doc(collection(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH));
      let downloadURL = "";
      if (file) {
        downloadURL = await uploadFile({ path: `/services/warranty/`, file });
      }
      const newItem: Warranty = {...data, order: nextOrder, fileURL: downloadURL };

      await setDoc(ref, newItem);
      dispatch(setWarrantyDataStore([...store.data, { ...newItem, id: ref.id }]));
      toast('Елемент додано!');
    } catch (error) {
      console.error("Помилка при додаванні: ", error);
      toast.error("Не вдалося додати дані. Спробуйте пізніше.");
    } finally {
      dispatch(closeModal());
      setIsLoading(false);
    }
  }, [dispatch, nextOrder, store, uploadFile]);

  const updateWarranty = useCallback(async ({id, data, fileData}: {
    id: string;
    data: Warranty;
    fileData: { prevURL: string; file: File | null; }
  }) => {
    if (!store) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }
    setIsLoading(true);
    try {
      const ref = doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, id);
      let newDownloadURL = fileData.prevURL;
      let shouldDeleteOldFile = false;

      if (fileData.file) {
        newDownloadURL = await uploadFile({ path: `/services/warranty/`, file: fileData.file });
        shouldDeleteOldFile = !!fileData.prevURL;
      } 
      else if (!data.fileURL && fileData.prevURL) {
        newDownloadURL = "";
        shouldDeleteOldFile = true;
      }

      const newData: Warranty = {...data, fileURL: newDownloadURL};

      await updateDoc(ref, newData);
      dispatch(setWarrantyDataStore(
        store.data.map(item => item.id === id ? { ...item, ...newData } : item)
      ));
      if (shouldDeleteOldFile && fileData.prevURL) {
        await deleteFile(fileData.prevURL).catch(e => console.warn("Файл не видалено:", e));
      }
      toast("Дані оновлено");
    } catch (error) {
      console.error("Помилка при оновлені: ", error);
      toast.error("Не вдалося оновити дані. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
      dispatch(closeModal());
    }
  }, [deleteFile, dispatch, store, uploadFile]);

  const deleteWarranty = useCallback(async (data: WarrantyDataItem) => {
    if (!store) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    setIsLoading(true);
    try {
      await deleteDoc(doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, data.id));
      dispatch(setWarrantyDataStore(
        store.data.filter(item => item.id !== data.id)
      ));
      await deleteFile(data.fileURL);
      toast.success("Видалено");
    } catch (error) {
      console.error("Помилка при видалені: ", error);
      toast.error("Не вдалося видалити дані. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
    }
  }, [deleteFile, dispatch, store]);

  const clearWarrantyData = useCallback(async () => {
    if (!store) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }
    setIsLoading(true);

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
      await deleteFolder('/services/warranty');
      toast.success("Всі дані видалено");

    } catch (error) {
      console.error("Помилка при видалені всіх обєктів: ", error);
      toast.error("Не вдалося видалити дані. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
    }
  }, [deleteFolder, dispatch, store]);

  return {
    isLoading,
    addWarranty,
    updateWarranty,
    deleteWarranty,
    clearWarrantyData
  }
}
