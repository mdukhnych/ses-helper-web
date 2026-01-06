'use client'

import React, { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAppSelector } from '@/store/hooks'

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbsData = useAppSelector(state => state.breadcrumbs.data);

  return (
    <Breadcrumb>
      <BreadcrumbList>
          {
            segments.length > 0 ?
              <Fragment>
                <BreadcrumbItem>
                    <BreadcrumbPage>{segments[0] && breadcrumbsData[segments[0]]?.title}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumbsData[segments[0]]?.list?.[segments[1]]}</BreadcrumbPage>
                </BreadcrumbItem>
              </Fragment>
            : <BreadcrumbItem>
                    <BreadcrumbPage>Головна</BreadcrumbPage>
                </BreadcrumbItem>
          }
      </BreadcrumbList>
    </Breadcrumb>
  )
}
