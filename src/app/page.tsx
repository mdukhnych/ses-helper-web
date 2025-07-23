'use client'

import { useDispatch, useSelector } from "react-redux"
import styles from "./page.module.css"
import { RootState } from "@/store/store"
import { signOut } from "firebase/auth"
import { FIREBASE_AUTH } from "../../firebaseConfig"
import { resetUser } from "@/store/slices/userSlice"

export default function HomePage() {
  const user = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()

  return (
    <div className={styles.container}>
      {`Welcome ${user.firstName} ${user.lastName}`}
      <button onClick={() => { signOut(FIREBASE_AUTH); dispatch(resetUser()) }} >Вихід</button>
    </div>
  )
}
