'use client'

import { onAuthStateChanged } from "firebase/auth";
import { ReactNode, useEffect } from "react"
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { getUserData } from "@/services";
import { IUserState } from "@/types";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/store/slices/userSlice";


export default function AuthProvider({ children }: {children: ReactNode}) {  
  const dispatch = useDispatch()
  const router = useRouter()
  
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const userData: IUserState = await getUserData(user.uid) as IUserState
        dispatch(setUser(userData))
      } else {
        router.replace('/login')
      }
    })
  }, [dispatch, router])

  return (
    <>{children}</>
  )
}
