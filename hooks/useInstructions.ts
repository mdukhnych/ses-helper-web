import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { InformationBase, InstructionsItem } from '@/types/information';
import React, { useCallback } from 'react';
import { doc, collection, setDoc, updateDoc, deleteDoc } from "firebase/firestore"; 
import { FIREBASE_FIRESTORE } from '@/firebaseConfug';
import { addInstructionToStore, updateInstructionsCategories, updateInstructionsInStore } from '@/store/slices/informationSlice';
import useFirebaseStorage from './useFirebaseStorage';
import { toast } from 'sonner';

export default function useInstructions() {
  const store = useAppSelector(state => state.information.data.instructions);
  const dispatch = useAppDispatch();

  const { uploadFile, deleteFile } = useFirebaseStorage();

  const addInstruction = useCallback(async ({item, file, setIsLoading}:{
    item: InstructionsItem;
    file: File | null;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  }) => {
    try {
      setIsLoading(true);
      const ref = doc(collection(FIREBASE_FIRESTORE, "information", "instructions", "items"));
      let downloadURL: string = "";

      if (file) {
        downloadURL = await uploadFile({path: `/information/instructions/`, file: file});
      }
      const newItem = {
        ...item,
        id: ref.id,
        url: downloadURL
      }
      await setDoc(ref, newItem);
      dispatch(addInstructionToStore(newItem));
    } catch (error) {
      console.error("Помилка при додаванні: ", error);
      toast.error("Не вдалося додати дані. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, uploadFile]);

  const updateInstruction = useCallback(async ({item, file, setIsLoading}: {
    item: InstructionsItem;
    file: File | null;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  }) => {
    try {
      setIsLoading(true);
      const ref = doc(FIREBASE_FIRESTORE, "information", "instructions", "items", item.id);
      let downloadURL: string = item.url;
      const prevUrl = store.items.find(i => i.id === item.id)?.url ?? "";

      if (file) {
        if (prevUrl.length > 0) {
          await deleteFile(prevUrl);
        }
        downloadURL = await uploadFile({path: `/information/instructions/`, file: file});
      } else {
        await deleteFile(prevUrl);
      }
      
      const newItem = {
        ...item,
        url: downloadURL
      }
      await updateDoc(ref, newItem);
      const newItems: InstructionsItem[] = store.items.map(i => i.id === newItem.id ? newItem : i);
      dispatch(updateInstructionsInStore(newItems));
    } catch (error) {
      console.error("Помилка при додаванні: ", error);
      toast.error("Не вдалося додати дані. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
      console.log(`Instruction with ID: ${item.id} updated!`);
    }
  }, [deleteFile, dispatch, store, uploadFile]);

  const deleteInstruction = useCallback(async (item: InstructionsItem) => {
    if (item.url) {
      await deleteFile(item.url);
    }
    await deleteDoc(doc(FIREBASE_FIRESTORE, "information", "instructions", "items", item.id));
    const newItems: InstructionsItem[] = store.items.filter(i => i.id !== item.id);

    dispatch(updateInstructionsInStore(newItems));

  }, [deleteFile, dispatch, store.items]);

  const updateCategories = useCallback(async (categories: InformationBase[]) => {
    try {
      const ref = doc(FIREBASE_FIRESTORE, "information", "instructions");
      await updateDoc(ref, { categories });
      dispatch(updateInstructionsCategories(categories));
    } catch (error) {
      console.error("Помилка при змінені категорій", error);
      toast.error("Не вдалося змінити дані в категоріях. Спробуйте пізніше.");
    }
  }, [dispatch]);

  return {addInstruction, deleteInstruction, updateInstruction, updateCategories}
}
