'use client'

import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '@/firebaseConfug';
import { setDataStore } from '@/store/slices/dataSlice';
import { setUserStore } from '@/store/slices/userSlice';
import { AppDispatch } from '@/store/store';
import { IUser } from '@/types/user';
import { onAuthStateChanged } from 'firebase/auth';
import {  collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

export default function AuthProvider({ children }: {children: React.ReactNode}) {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        try {
          const docRef = doc(FIREBASE_FIRESTORE, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data() as IUser;

            const querySnapshot = await getDocs(collection(FIREBASE_FIRESTORE, "data"));
            const data = querySnapshot.docs.map(item => item.data());

            dispatch(setUserStore(userData));
            dispatch(setDataStore(data));
          } else {
            toast('Дані користувача не знайдено', {position: "top-center"});
          }

        } catch (error) {
          toast("Виникла помилка при завантажені даних користувача", {position: "top-center"});
          console.log(error);
        }
      } else {
        router.replace('/login');
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch, router]);

  if (isLoading) return <p>Loading...</p>

  return (
    <div>{ children }</div>
  )
}
