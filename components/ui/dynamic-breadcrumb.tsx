'use client'

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const data = useAppSelector(state => state.data.data);
  let parentEl: string | null = null;
  let itemEl: string | null = null;

  for (const group of data) {
    if (group.data) {
      for (const item of group.data) {
        if (`/${item.id}` === pathname) {
          parentEl = group.title;
          itemEl = item.title;
        }
      }
    }
  }

  if (!parentEl && !itemEl) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="#">
            {
              parentEl
            }
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {
              itemEl
            }
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
