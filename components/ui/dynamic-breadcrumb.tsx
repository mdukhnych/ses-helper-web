'use client'

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { ICollections } from '@/types/data';

export default function DynamicBreadcrumb() {
  const pathname = usePathname();

  const { menu, collections } = useAppSelector(state => state.data);

  const segments = pathname.split('/').filter(Boolean);

  const items = segments.map((segment, idx) => {
    if (idx === 0) {
      const menuItem = menu.find(m => m.id === segment);
      return {
        title: menuItem?.title ?? segment,
        href: `/${segment}`,
      };
    }

    const parent = segments[0] as keyof ICollections;
    const col = collections[parent]?.find(c => c.id === segment);
    return {
      title: col?.title ?? segment,
      href: `/${segments.slice(0, idx + 1).join('/')}`
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <BreadcrumbItem>
              {idx === items.length - 1 ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {idx !== items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
