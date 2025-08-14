'use client'

import { onAuthStateChanged } from 'firebase/auth';
import React, { ReactNode, useEffect, useState } from 'react';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { getUserData } from '@/services/authServices';
import { setUserState } from '@/store/slices/userSlice';
import { IUser } from '@/types/user';
import Spinner from '@/components/ui/Spinner/Spinner';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const uid = user.uid;
        const userData = await getUserData(uid) as IUser;
        dispatch(setUserState(userData));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (pathname !== '/login') {
          router.replace('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router, dispatch]);

  if (loading) {
    return <Spinner size={200} additionalStyles={{ margin: "50px auto" }} color='blue' />;
  }

  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
