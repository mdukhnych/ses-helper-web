'use client'

import { useAppDispatch } from '@/store/hooks'
import { fetchInstructions } from '@/store/slices/informationSlice';
import React, { useEffect } from 'react'

export default function Instructions() {

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchInstructions());
  }, [dispatch])

  return (
    <div>Інструкції</div>
  )
}
