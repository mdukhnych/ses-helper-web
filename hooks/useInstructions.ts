import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { InformationBase, Instructions, InstructionsItem } from '@/types/information';
import { useCallback, useState } from 'react';
import { doc, collection, setDoc, updateDoc, deleteDoc, query, where, getDocs, writeBatch } from "firebase/firestore"; 
import { FIREBASE_FIRESTORE } from '@/firebaseConfig';
import { addInstructionToStore, updateInstructionsCategories, updateInstructionsInStore } from '@/store/slices/informationSlice';
import useFirebaseStorage from './useFirebaseStorage';
import { toast } from 'sonner';
import { handleError } from '@/utils';

export default function useInstructions() {
  const [isLoading, setIsLoading] = useState(false);
  const store = useAppSelector(state => state.information.data.instructions) as Instructions | undefined;
  const dispatch = useAppDispatch();

  const { uploadFile, deleteFile, deleteFolder } = useFirebaseStorage();

  // --- Actions ---
  const addInstruction = useCallback(async ({ item, file }: {
    item: InstructionsItem;
    file: File | null;
  }) => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);
    
    try {
      const ref = doc(collection(FIREBASE_FIRESTORE, "information", "instructions", "items"));
      let downloadURL: string = "";

      if (file) {
        downloadURL = await uploadFile({ path: `/information/instructions/`, file });
      }

      const newItem = { ...item, id: ref.id, url: downloadURL };
      
      await setDoc(ref, newItem);
      dispatch(addInstructionToStore(newItem));
      toast.success("Інструкцію додано");
    } catch (error) {
      handleError(error, "Помилка при додаванні");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, store, uploadFile]);

  const updateInstruction = useCallback(async ({ item, file }: {
    item: InstructionsItem;
    file: File | null;
  }) => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);
    let newDownloadURL = item.url;
    let shouldDeleteOldFile = false;
    const prevUrl = store.items.find(i => i.id === item.id)?.url ?? "";

    try {
      if (file) {
        newDownloadURL = await uploadFile({ path: `/information/instructions/`, file });
        shouldDeleteOldFile = !!prevUrl;
      } 
      else if (!item.url && prevUrl) {
        newDownloadURL = "";
        shouldDeleteOldFile = true;
      }

      const newItem = { ...item, url: newDownloadURL };
      const ref = doc(FIREBASE_FIRESTORE, "information", "instructions", "items", item.id);
      
      await updateDoc(ref, newItem); 

      const newItems = store.items.map(i => i.id === item.id ? newItem : i);
      dispatch(updateInstructionsInStore(newItems));

      if (shouldDeleteOldFile && prevUrl) {
        await deleteFile(prevUrl).catch(e => console.warn("Старий файл не видалено:", e));
      }

      toast.success("Дані оновлено!");
    } catch (error) {
      handleError(error, "Помилка при оновленні");
    } finally {
      setIsLoading(false);
    }
  }, [deleteFile, dispatch, store, uploadFile]);

  const deleteInstruction = useCallback(async (item: InstructionsItem) => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);
    try {
      await deleteDoc(doc(FIREBASE_FIRESTORE, "information", "instructions", "items", item.id));

      if (item.url) {
        await deleteFile(item.url).catch(e => console.warn("Файл не знайдено в Storage:", e));
      }

      const newItems = store.items.filter(i => i.id !== item.id);
      dispatch(updateInstructionsInStore(newItems));
      toast.success("Видалено успішно");
    } catch (error) {
      handleError(error, "Помилка при видаленні");
    } finally {
      setIsLoading(false);
    }
  }, [deleteFile, dispatch, store]);

  const clearInstructions = useCallback(async (categoryId?: string) => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);
    try {
      const collectionRef = collection(FIREBASE_FIRESTORE, 'information', 'instructions', 'items');
      const q = categoryId && categoryId !== 'all' 
        ? query(collectionRef, where('categoryId', '==', categoryId))
        : collectionRef;

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return;

      const batch = writeBatch(FIREBASE_FIRESTORE);
      querySnapshot.docs.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();

      if (!categoryId || categoryId === 'all') {
        await deleteFolder("/information/instructions").catch(e => console.warn(e));
        dispatch(updateInstructionsInStore([]));
      } else {
        const remainingItems = store.items.filter(i => i.categoryId !== categoryId);
        dispatch(updateInstructionsInStore(remainingItems));
      }

      toast.success('Записи успішно очищені');
    } catch (error) {
      handleError(error, "Помилка при масовому видаленні");
    } finally {
      setIsLoading(false);
    }
  }, [deleteFolder, dispatch, store]);

  const updateCategories = useCallback(async (categories: InformationBase[]) => {
    if (!store) return toast.error("Сервіс не знайдено");
    setIsLoading(true);
    try {
      const ref = doc(FIREBASE_FIRESTORE, "information", "instructions");
      await updateDoc(ref, { categories });
      dispatch(updateInstructionsCategories(categories));
      toast.success("Категорії оновлено");
    } catch (error) {
      handleError(error, "Помилка оновлення категорій");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, store]);

  return {
    isLoading,
    addInstruction, 
    deleteInstruction, 
    updateInstruction, 
    updateCategories, 
    clearInstructions
  };
}