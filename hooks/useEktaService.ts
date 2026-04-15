import { FIREBASE_FIRESTORE } from "@/firebaseConfig"; 
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal } from "@/store/slices/modalSlice";
import { setEktaServicesData } from "@/store/slices/servicesSlice";
import { EktaListItem, EktaService, EktaServicesDataItem, UpdateEktaGroup } from "@/types/services";
import { arrayUnion, collection, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import useFirebaseStorage from "./useFirebaseStorage";
import { handleError } from "@/utils";

const DATA_COLLECTION_PATH = "/services/ekta-services/data";

export default function useEktaService() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  
  const store = useAppSelector(state => 
    state.services.data.find(item => item.id === 'ekta-services')
  ) as EktaService | undefined;

  const { uploadFile, deleteFile, deleteFolder } = useFirebaseStorage();

  // --- Groups ---
  const addEktaGroup = useCallback(async (group: UpdateEktaGroup) => {
    if (!store) return toast.error("Сервіс не знайдено");
    
    setIsLoading(true);
    try {
      const nextOrder = store.data.length > 0 
        ? Math.max(...store.data.map(d => d.order ?? 0)) + 1 
        : 1;

      const ref = doc(collection(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH));
      const newGroupData = { ...group, order: nextOrder };

      await setDoc(ref, newGroupData);
      
      dispatch(setEktaServicesData([
        ...store.data, 
        { ...newGroupData, id: ref.id, list: [] }
      ]));
      
      toast.success('Групу додано!');
      dispatch(closeModal());
    } catch (e) {
      handleError(e, "Не вдалося додати групу");
    } finally {
      setIsLoading(false);
    }
  }, [store, dispatch]);

  const updateEktaGroup = useCallback(async (id: string, data: UpdateEktaGroup) => {
    if (!store) return;

    setIsLoading(true);
    try {
      const ref = doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, id);
      await updateDoc(ref, { title: data.title });

      dispatch(setEktaServicesData(
        store.data.map(i => i.id === id ? { ...i, ...data } : i)
      ));
      
      toast.success("Дані групи оновлені");
      dispatch(closeModal());
    } catch (e) {
      handleError(e, "Не вдалося оновити групу");
    } finally {
      setIsLoading(false);
    }
  }, [store, dispatch]);

  const deleteEktaGroup = useCallback(async (docId: string) => {
    if (!store) return;

    setIsLoading(true);
    try {
      const docRef = doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, docId);
      
      await deleteDoc(docRef);
      await deleteFolder(`/services/ekta/${docId}/`).catch(e => console.warn("Папка Storage не видалена:", e));

      dispatch(setEktaServicesData(
        store.data.filter(doc => doc.id !== docId)
      ));
      
      toast.success("Групу видалено!");
    } catch (e) {
      handleError(e, "Не вдалося видалити групу");
    } finally {
      setIsLoading(false);
    }
  }, [store, deleteFolder, dispatch]);

  // --- Items ---
  const addEktaItem = useCallback(async ({ docId, item, file }: {
    docId: string;
    item: EktaListItem;
    file: File | null
  }) => {
    if (!store) return;

    setIsLoading(true);
    try {
      let downloadURL = "";
      if (file) {
        downloadURL = await uploadFile({ path: `/services/ekta/${docId}/`, file });
      }

      const newItem: EktaListItem = {
        ...item,
        id: crypto.randomUUID(),
        description: downloadURL 
      };

      const ref = doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, docId);
      await updateDoc(ref, { list: arrayUnion(newItem) });

      dispatch(setEktaServicesData(
        store.data.map(g => g.id === docId ? { ...g, list: [...g.list, newItem] } : g)
      ));

      toast.success("Елемент додано!");
      dispatch(closeModal());
    } catch (e) {
      handleError(e, "Помилка при додаванні елемента");
    } finally {
      setIsLoading(false);
    }
  }, [store, dispatch, uploadFile]);

  const updateEktaItem = useCallback(async ({ docId, newData, fileData }: {
    docId: string;
    newData: EktaListItem;
    fileData: { prevURL: string; file: File | null; }
  }) => {
    if (!store) return;

    setIsLoading(true);
    let newDownloadURL = fileData.prevURL;
    let shouldDeleteOldFile = false;

    try {
      if (fileData.file) {
        newDownloadURL = await uploadFile({ path: `/services/ekta/${docId}/`, file: fileData.file });
        shouldDeleteOldFile = !!fileData.prevURL;
      } 
      else if (!newData.description && fileData.prevURL) {
        newDownloadURL = "";
        shouldDeleteOldFile = true;
      }

      const currentGroup = store.data.find(d => d.id === docId);
      if (!currentGroup) throw new Error("Групу не знайдено");

      const newList = currentGroup.list.map(item => 
        item.id === newData.id ? { ...newData, description: newDownloadURL } : item
      );

      const docRef = doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, docId);
      await updateDoc(docRef, { list: newList });

      dispatch(setEktaServicesData(
        store.data.map(doc => doc.id === docId ? { ...doc, list: newList } : doc)
      ));

      if (shouldDeleteOldFile && fileData.prevURL) {
        await deleteFile(fileData.prevURL).catch(e => console.warn("Файл не видалено:", e));
      }

      toast.success("Дані оновлено!");
      dispatch(closeModal());
    } catch (e) {
      handleError(e, "Помилка оновлення");
    } finally {
      setIsLoading(false);
    }
  }, [store, dispatch, uploadFile, deleteFile]);

  const deleteEktaItem = useCallback(async (service: EktaServicesDataItem, item: EktaListItem) => {
    if (!store) return;

    setIsLoading(true);
    try {
      const updatedList = service.list.filter(i => i.id !== item.id);
      const docRef = doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, service.id);

      await updateDoc(docRef, { list: updatedList });
      
      if (item.description) {
        await deleteFile(item.description).catch(e => console.warn("Файл не знайдено:", e));
      }

      dispatch(setEktaServicesData(
        store.data.map(doc => doc.id === service.id ? { ...doc, list: updatedList } : doc)
      ));
      toast.success("Елемент видалено");
    } catch (e) {
      handleError(e, "Помилка видалення");
    } finally {
      setIsLoading(false);
    }
  }, [store, dispatch, deleteFile]);

  const clearEktaItems = useCallback(async (docId: string) => {
    if (!store) return;

    setIsLoading(true);
    try {
      const docRef = doc(FIREBASE_FIRESTORE, DATA_COLLECTION_PATH, docId);
      await updateDoc(docRef, { list: [] });
      await deleteFolder(`/services/ekta/${docId}`).catch(e => console.warn("Папка не очищена:", e));

      dispatch(setEktaServicesData(
        store.data.map(doc => doc.id === docId ? { ...doc, list: [] } : doc)
      ));
      toast.success("Всі елементи видалено");
    } catch (e) {
      handleError(e, "Помилка очищення");
    } finally {
      setIsLoading(false);
    }
  }, [store, deleteFolder, dispatch]);

  return {
    isLoading,
    addEktaGroup,
    updateEktaGroup,
    deleteEktaGroup,
    addEktaItem,
    updateEktaItem,
    deleteEktaItem,
    clearEktaItems
  };
}