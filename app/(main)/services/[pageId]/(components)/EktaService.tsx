'use client'

import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { EktaListItem, EktaServicesDataItem } from '@/types/services'
import React, { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { openModal } from '@/store/slices/modalSlice';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { formatPrice } from '@/utils';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { fetchEktaServicesData } from '@/store/slices/servicesSlice';
import PdfViewer from '@/components/shared/PdfViewer';
import useEktaService from '@/hooks/useEktaService';

export default function EktaService() {
  const store = useAppSelector(state => state.services.data.find(item => item.id === "ekta-services"))?.data as EktaServicesDataItem[];
  const role = useAppSelector(state => state.user.role);
  const [selectedDoc, setSelectedDoc] = useState<{ url: string, title: string } | null>(null);

  const dispatch = useAppDispatch();

  const { deleteEktaGroup, deleteEktaItem, clearEktaItems } = useEktaService();

  useEffect(() => {
    dispatch(fetchEktaServicesData());
  }, [dispatch])

  const renderRow = (service: EktaServicesDataItem, item: EktaListItem) => {
    const row = (
      <TableRow key={item.id} className="select-none cursor-pointer" onDoubleClick={() => {
        if (item.description) {
          setSelectedDoc({ url: item.description, title: item.title });
        } else {
          toast.error("Файл відсутній!");
        }
      }}>
        <TableCell className='w-[100px]'>{item.productCode}</TableCell>
        <TableCell className="font-medium border">
          <div className="flex items-center justify-between">
            {item.title}
          </div>
        </TableCell>
        <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
      </TableRow>
    );

    if (role !== "admin") return row;

    return (
      <ContextMenu key={item.id}>
        <ContextMenuTrigger asChild>
          {row}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => dispatch(openModal({type: "ekta-services", payload: {mode: "goods", data: {service: service, listItem: item}}}))}>
            Редагувати
          </ContextMenuItem>
          <ConfirmDialog 
            trigger={
              <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                Видалити
              </ContextMenuItem>
            }
            title={`Видалити ${item.title}?`}
            description='Скасувати операцію буде неможливо!'
            onConfirm={() => deleteEktaItem(service, item)}
          />
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const sortedItems = [...(store ?? [])].sort((a, b) => {
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;

    if (orderA === orderB) {
      return a.id.localeCompare(b.id);
    }

    return orderA - orderB;
  });

  if (!store) return <div><Spinner/></div>
  if (selectedDoc) {
    return (
      <PdfViewer 
        url={selectedDoc.url} 
        title={selectedDoc.title} 
        onBack={() => setSelectedDoc(null)} 
      />
    );
  }

  return (
    <div>
      { role === "admin" && <Button className='cursor-pointer' onClick={() => dispatch(openModal({type: "ekta-services", payload: {mode: "services", data: null}}))}>Додати групу</Button> }
      <Accordion type="single" collapsible>
        {
          sortedItems.map((service, i) => (
            <Card className='p-0 px-4 my-2' key={i}>
              <AccordionItem value={`item-${i}`}>
                <AccordionTrigger className='cursor-pointer' showChevron={true}>{service.title}</AccordionTrigger>
                <AccordionContent className='px-4'>
                  {
                    role === "admin" &&
                      <div className="mb-2 flex justify-end gap-2">
                        <Button className='cursor-pointer' type='button' onClick={() => dispatch(openModal({type: "ekta-services", payload: {mode: "services", data: service}}))}>Редактор групи</Button>
                        <ConfirmDialog 
                           trigger={<Button className='cursor-pointer' type='button'>Видалити групу</Button>} 
                           title={`Видалити групу: ${service.title}?`}
                           description='Скасувати операцію буде неможливо!'
                           onConfirm={() => deleteEktaGroup(service.id)}
                        />
                        <Button className='cursor-pointer' type='button' onClick={() => dispatch(openModal({type: "ekta-services", payload: {mode: "goods", data: {service: service, listItem: null}}}))}>Додати елемент</Button>
                        <ConfirmDialog 
                           trigger={<Button disabled={service.list.length === 0} className='cursor-pointer' type='button'>Очистити групу</Button>} 
                           title={`Очистити групу: ${service.title}?`}
                           description='Скасувати операцію буде неможливо!'
                           onConfirm={() => clearEktaItems(service.id)}
                        />
                      </div>
                  }
                  <span className='text-muted-foreground text-s my-2 block'>Натисніть двічі щоб відкрити: РЕГЛАМЕНТ ВИКОНАННЯ ПІДРЯДНИКОМ РОБІТ</span>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className='bg-sidebar-accent'>
                        <TableRow>
                          <TableHead className="border w-[100px]">Код товару</TableHead>
                          <TableHead className="border">Найменування</TableHead>
                          <TableHead className="text-right w-[200px]">ціна</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {
                          service.list.map(item => renderRow(service, item))
                        }
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
            </AccordionItem>
            </Card>
          ))
        }
      </Accordion>
    </div>
  )
}
