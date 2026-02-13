import { FIREBASE_STORAGE } from "@/firebaseConfug";
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { useCallback, useState } from "react"

export default function useFirebaseStorage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleError(error: unknown, setError: (msg: string) => void) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Upload Error");
    }
  }

  const uploadFile = useCallback(async ({file, path}: {file: File; path: string}): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const storageRef = ref(
        FIREBASE_STORAGE,
        `${path}${Date.now()}-${file.name}`
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;

    } catch (error) {
      console.log("Upload error: ", error);
      handleError(error, setError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (fileURL: string) => {
    try {
      setLoading(true);
      const fileRef = ref(FIREBASE_STORAGE, fileURL);
      await deleteObject(fileRef);
      console.log("File deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      handleError(error, setError);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFolder = useCallback(async (folderPath: string) => {
    const folderRef = ref(FIREBASE_STORAGE, folderPath);

    try {
      setLoading(true);
      setError(null);

      const res = await listAll(folderRef);

      const deletePromises = res.items.map(itemRef => deleteObject(itemRef));
      await Promise.all(deletePromises);
      console.log(`Всі файли в папці "${folderPath}" успішно видалені`);
    } catch(error) {
      console.error("Помилка при видаленні папки:", error);
      handleError(error, setError);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploadFile,
    deleteFile,
    deleteFolder,
    loading,
    error
  }
}
