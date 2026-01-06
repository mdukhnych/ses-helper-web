import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from "@/firebaseConfug";
import { useAppDispatch } from "@/store/hooks";
import { fetchServices, resestServicesStore } from "@/store/slices/servicesSlice";
import { resetUserStore, setUserStore } from "@/store/slices/userSlice";
import { IUser } from "@/types/user";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function useAuth() {
  const dispatch =useAppDispatch();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
    .then((userCredential) => {
      return getDoc(doc(FIREBASE_FIRESTORE, "users", userCredential.user.uid));
    })
    .then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data() as IUser;
        dispatch(setUserStore(userData));  
        dispatch(fetchServices());
        router.replace('/');
        toast.success("Авторизація успішна");
      } else {
        toast.error('Користувача не знайдено', {
          position: "top-center"
        });
      }
    })
    .catch((error) => {
      switch (error.code) {
        case "auth/invalid-email":
          toast.error('Невірно введена пошта', {position: 'top-center'});
          break;
        case "auth/missing-password":
          toast.error('Введіть пароль', {position: 'top-center'});
          break;
        case "auth/invalid-credential":
          toast.error('Користувача не знайдено', {position: 'top-center'});
          break;
        default:
          toast.error('Щось пішло не так!', {position: 'top-center'});
          break;
      }
    });
  }

  const logout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      dispatch(resetUserStore());
      dispatch(resestServicesStore());
      router.replace('/login');
      toast.success("Ви успішно вийшли з акаунта");
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Logout error: ", error.message);
        toast.error("Помилка при виході: " + error.message);
      } else {
        toast.error("Невідома помилка при вході");
        console.log(error);
      }
    }
  }

  return ({ login, logout })
}
