'use client'

import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAppSelector } from '@/store/hooks'
import { EktaServicesDataItem } from '@/types/services'
import React from 'react'

export default function EktaService() {
  const store = useAppSelector(state => state.services.data.find(item => item.id === "ekta-services"))?.data as EktaServicesDataItem[];

  if (!store) return <div><Spinner/></div>
  return (
    <div>
      {
        store.map(service => (
          <Card key={service.id}>{service.title}</Card>
        ))
      }
    </div>
  )
}
