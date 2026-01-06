'use client'

import { Spinner } from '@/components/ui/spinner';
import { FIREBASE_AUTH, FIREBASE_FIRESTORE } from '@/firebaseConfug';
import { useAppDispatch } from '@/store/hooks';
import { fetchBreadcrumbs } from '@/store/slices/breadcrumbsSlice';
import { fetchServices } from '@/store/slices/servicesSlice';
import { setUserStore } from '@/store/slices/userSlice';
import { IUser } from '@/types/user';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AuthProvider({ children }: {children: React.ReactNode}) {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        try {
          const docRef = doc(FIREBASE_FIRESTORE, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data() as IUser;
            dispatch(setUserStore(userData));
            dispatch(fetchBreadcrumbs());
            dispatch(fetchServices());
            setIsLoading(false);
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

    });

    return () => unsubscribe();
  }, [dispatch, router]);

  if (isLoading) return <div className="flex w-full h-screen items-center justify-center"><Spinner className='size-20'/></div>

  return (
    <div>{ children }</div>
  )
}
