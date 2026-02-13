import { FIREBASE_FIRESTORE } from "@/firebaseConfug";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEasyproPricelist, setEktaServicesData, setPhoneServicesData, setWarrantyDataStore } from "@/store/slices/servicesSlice";
import { EasyProPricelistItem, EktaService, EktaServicesDataItem, PhoneService, PhoneServiceItem, PhoneServicesData, WarrantyDataItem } from "@/types/services";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useCallback } from "react";
import { toast } from "sonner";

type WarrantyActionType = "add" | "update" | "delete";
type PhoneServicesActionType = 
  | {
    action: "goods";
    items: string[];
  }
  | {
    action: "services";
    items: PhoneServiceItem[];
  };

type EktaServicesActionType = {
  action: "add" | "update" | "delete";
  item: EktaServicesDataItem;
}

export default function useFirestore() {
  const dispatch = useAppDispatch();
  const store = useAppSelector(state => state.services.data);

  const modifyWarrantyService = useCallback(async (action: WarrantyActionType, item: WarrantyDataItem) => {
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
  }, [dispatch, store]);

  const updateEasyproPricelist = useCallback(async (newPricelist: EasyProPricelistItem[], setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    setLoading(true);
    if (!store.find(item => item.id === "easy-pro")) {
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
      dispatch(setEasyproPricelist(newPricelist));

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, store]);

  const updatePhoneServicesData = useCallback(async (data: PhoneServicesActionType) => {

    if (!store.find(item => item.id === "phone-services")) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    try {
      const ref = doc(FIREBASE_FIRESTORE, "services", "phone-services");
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        toast.error("Документ не знайдено!", { position: "top-center" });
        return;
      }

      const phoneServices = snap.data() as PhoneService;
      let updatedData: PhoneServicesData = phoneServices.data;

      switch (data.action) {
        case "goods":
          updatedData = { ...updatedData, goodsAndServices: data.items }
          break;
        case "services":
          updatedData = { ...updatedData, servicesItems: data.items }
          break;
        default:
          toast.error("Невідома дія!", { position: "top-center" });
          break;
      }
      dispatch(setPhoneServicesData(updatedData));
      updateDoc(ref, {data: updatedData});

    } catch (error) {
      toast.error("Сталась помилка.");
      console.error("Error => " + error)
    }

  }, [dispatch, store]);

  const updateEktaServicesData = useCallback(async (data: EktaServicesActionType) => {
    if (!store.find(item => item.id === "ekta-services")) {
      toast.error("Не вдалося знайти поточний сервіс!", { position: "top-center" });
      return;
    }

    try {
      const ref = doc(FIREBASE_FIRESTORE, "services", "ekta-services");
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        toast.error("Документ не знайдено!", { position: "top-center" });
        return;
      }

      const ektaServices = snap.data() as EktaService;
      let updatedData: EktaServicesDataItem[] = ektaServices.data;

      switch (data.action) {
        case "add":
          updatedData = [...updatedData, data.item]
          break;
        case "update":
          updatedData = ektaServices.data.map(item => item.id === data.item.id ? data.item : item);
          break;
        case "delete":
          
          updatedData = ektaServices.data.filter(item => item.id !== data.item.id);
          break;
        default:
          toast.error("Невідома дія!", { position: "top-center" });
          break;
      }

      dispatch(setEktaServicesData(updatedData));
      updateDoc(ref, {data: updatedData});

    } catch (error) {
      toast.error("Сталась помилка.");
      console.error("Error => " + error)
    }
  }, [dispatch, store]);

  return { 
    modifyWarrantyService, 
    updateEasyproPricelist, 
    updatePhoneServicesData,
    updateEktaServicesData 
  };
}
