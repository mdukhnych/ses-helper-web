import { FIREBASE_FIRESTORE } from "@/firebaseConfug";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEasyproPricelist, setWarrantyDataStore } from "@/store/slices/servicesSlice";
import { EasyProPricelistItem, WarrantyDataItem } from "@/types/services";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

type ActionType = "add" | "update" | "delete";

export default function useFirestore() {
  const dispatch = useAppDispatch();
  const store = useAppSelector(state =>
    state.services.data
  );

  const modifyWarrantyService = async (action: ActionType, item: WarrantyDataItem) => {
    if (!store.find(item => item.id === "warranty-protection")) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    try {
      const ref = doc(FIREBASE_FIRESTORE, "services", "warranty-protection");
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        toast.error("Документ не знайдено!", { position: "top-center" });
        return;
      }

      const warrantyData = (snap.data()?.data || []) as WarrantyDataItem[];
      let updatedData: WarrantyDataItem[] = [];

      switch (action) {
        case "add":
          updatedData = [...warrantyData, item];
          break;

        case "update":
          updatedData = warrantyData.map((el) => (el.id === item.id ? { ...el, ...item } : el));
          break;

        case "delete":
          updatedData = warrantyData.filter((el) => el.id !== item.id);
          break;

        default:
          toast.error("Невідома дія!", { position: "top-center" });
          return;
      }

      await updateDoc(ref, { data: updatedData });
      dispatch(setWarrantyDataStore(updatedData));

      if (action === "add") toast.success("Елемент успішно додано!", { position: "top-center" });
      if (action === "update") toast.success("Елемент успішно оновлено!", { position: "top-center" });
      if (action === "delete") toast.success("Елемент успішно видалено!", { position: "top-center" });
    } catch (error) {
      console.error("Помилка при зміні елемента:", error);
      toast.error("Сталася помилка. Спробуйте пізніше.", { position: "top-center" });
    }
  };

  const updateEasyproPricelist = async (newPricelist: EasyProPricelistItem[], setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    setLoading(true);
    if (!store.find(item => item.id === "easypro")) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    try {
      const ref = doc(FIREBASE_FIRESTORE, "services", "easy-pro");
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        toast.error("Документ не знайдено!", { position: "top-center" });
        return;
      }

      await updateDoc(ref, { "data.pricelist": newPricelist });
      dispatch(setEasyproPricelist);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return { modifyWarrantyService, updateEasyproPricelist };
}
