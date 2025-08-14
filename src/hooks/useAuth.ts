'use client'
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { getUserData } from "@/services/authServices";
import { useDispatch } from "react-redux";
import { resetUserState, setUserState } from "@/store/slices/userSlice";
import { IUser } from "@/types/user";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const user = (await signInWithEmailAndPassword(FIREBASE_AUTH, email, password)).user;
      const userData = await getUserData(user.uid) as IUser;
      dispatch(setUserState(userData));
      router.replace('/');
    } catch(error) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;
        switch(errorCode) {
          case "auth/invalid-email":
            alert("Невірна електрона пошта!");
            break;
          case "auth/missing-password":
            alert("Введіть ваш пароль!");
            break;
          case "auth/invalid-credential":
            alert("Невірні пошта або пароль!");
            break;
          default:
            break;
        }
      }
    }
  }

  const logout = async () => {
    signOut(FIREBASE_AUTH);
    dispatch(resetUserState());
  }

  return ({ login, logout })
}
