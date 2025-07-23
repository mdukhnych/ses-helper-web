'use client'

import { onAuthStateChanged } from "firebase/auth";
import { ReactNode, useEffect, useState } from "react"
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { getUserData } from "@/services";
import { IUserState } from "@/types";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/store/slices/userSlice";
import Spinner from "@/components/ui/Spinner/Spinner";


export default function AuthProvider({ children }: {children: ReactNode}) {  
  const [loading, setLoading] = useState<boolean>(true)

  const dispatch = useDispatch()
  const router = useRouter()
  
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const userData: IUserState = await getUserData(user.uid) as IUserState
        dispatch(setUser(userData))
        setLoading(false)
      } else {
        router.replace('/login')
        setLoading(false)
      }
    })
  }, [dispatch, router])

  return (
    <>
      {
        loading ? <Spinner size={100} borderWidth={10} center additionalStyles={{margin: "50px 0"}}/> : children
      }
    </>
  )
}
