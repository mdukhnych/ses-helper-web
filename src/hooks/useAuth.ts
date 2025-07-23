'use client'

import { signInWithEmailAndPassword } from "firebase/auth"
import { FIREBASE_AUTH } from "../../firebaseConfig"
import { getUserData } from "@/services"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { setUser } from "@/store/slices/userSlice"
import { IUserState } from "@/types"

export default function useAuth() {
  const dispatch = useDispatch()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
      const userData: IUserState = await getUserData(userCredential.user.uid) as IUserState
      dispatch(setUser(userData))
      router.replace('/')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === "auth/invalid-email") {
        alert("Невірна пошта!")
      } else if (error.code === "auth/missing-password") {
        alert("Невірний пароль!")
      } else if (error.code === "auth/invalid-credential") {
        alert("Недійсні облікові дані!")
      } else {
        alert("Виникла невідома помилка при вході.")
        console.error(error)
      }
    }
  }

  return ({ login })
}
