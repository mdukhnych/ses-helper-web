'use client'

import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { EktaListItem, EktaServicesDataItem } from '@/types/services'
import React from 'react';

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
import useFirestore from '@/hooks/useFirestore';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { formatPrice } from '@/utils';
import { toast } from 'sonner';
import useFirebaseStorage from '@/hooks/useFirebaseStorage';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

export default function EktaService() {
  const store = useAppSelector(state => state.services.data.find(item => item.id === "ekta-services"))?.data as EktaServicesDataItem[];
  const role = useAppSelector(state => state.user.role);

  const dispatch = useAppDispatch();
  const { updateEktaServicesData } = useFirestore();
  const { deleteFile, deleteFolder } = useFirebaseStorage();

  const onDeleteService = async (item: EktaServicesDataItem) => {
    try {
      await deleteFolder(`/services/ekta/${item.id}`); 
      await updateEktaServicesData({ action: "delete", item });
      toast.success(`Група "${item.title}" видалена`, {position: "top-center"});
    } catch (err) {
      console.error(err);
      toast.error("Помилка при видаленні групи", {position: "top-center"});
    }
  };

  const onClearService = async (service: EktaServicesDataItem) => {
    try {
      await deleteFolder(`/services/ekta/${service.id}`); 
      await updateEktaServicesData({ action: "update", item: {...service, list: []} });
      toast.success(`Всі елементи видалено успішно!`, {position: "top-center"});
    } catch (error) {
      console.error(error);
      toast.error("Помилка при видаленні елементів групи", {position: "top-center"});
    }
  }

  const onDeleteServiceItem = async ({service, item}: {service: EktaServicesDataItem, item: EktaListItem}) => {
    try {
      if (item.description) {
        await deleteFile(item.description);
      }
      await updateEktaServicesData({ action: "update", item: {...service, list: service.list.filter(listItem => listItem.id !== item.id)} });
      toast.success(`Елемент видалено успішно!`, {position: "top-center"});
    } catch (error) {
      console.error(error);
      toast.error("Помилка при видаленні елементів групи", {position: "top-center"});
    }
  }

  const onShowWorkSchedule = (url: string) => {
    if (url.length === 0) {
      toast.error("Документ не знайдено!", { position: "top-center" });
      return;
    }

    window.open(url, '_blank', 'noreferrer');
  }

  const renderRow = (service: EktaServicesDataItem, item: EktaListItem) => {
    const row = (
      <TableRow key={item.id} className="select-none cursor-pointer" onDoubleClick={() => onShowWorkSchedule(item.description)}>
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
            onConfirm={() => onDeleteServiceItem({service, item})}
          />
          {/* <AlertDialogDemo
            trigger={
              <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                Видалити
              </ContextMenuItem>
            }
            title={`Видалити ${item.title}?`}
            submit={() => onDeleteServiceItem({service, item})}
          /> */}
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  if (!store) return <div><Spinner/></div>
  return (
    <div>
      { role === "admin" && <Button className='cursor-pointer' onClick={() => dispatch(openModal({type: "ekta-services", payload: {mode: "services", data: null}}))}>Додати групу</Button> }
      <Accordion type="single" collapsible>
        {
          store.map((service, i) => (
            <Card className='p-0 px-4 my-2' key={service.id}>
              <AccordionItem key={service.id} value={`item-${i}`}>
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
                           onConfirm={() => onDeleteService(service)}
                        />
                        {/* <AlertDialogDemo trigger={<Button className='cursor-pointer' type='button'>Видалити групу</Button>} title={`Видалити групу: ${service.title}?`} description="Після видалення інформації відновлення буде не можливе!" submit={() => onDeleteService(service)} /> */}
                        <Button className='cursor-pointer' type='button' onClick={() => dispatch(openModal({type: "ekta-services", payload: {mode: "goods", data: {service: service, listItem: null}}}))}>Додати елемент</Button>
                        <ConfirmDialog 
                           trigger={<Button disabled={service.list.length === 0} className='cursor-pointer' type='button'>Очистити групу</Button>} 
                           title={`Очистити групу: ${service.title}?`}
                           description='Скасувати операцію буде неможливо!'
                           onConfirm={() => onClearService(service)}
                        />
                        {/* <AlertDialogDemo trigger={<Button disabled={service.list.length === 0} className='cursor-pointer' type='button'>Очистити групу</Button>} title={`Очистити групу: ${service.title}?`} description="Після видалення інформації відновлення буде не можливе!" submit={() => onClearService(service)} /> */}
                      </div>
                  }
                  <span className='text-muted-foreground text-s my-2 block'>Натисніть двічі щоб відкрити: РЕГЛАМЕНТ ВИКОНАННЯ ПІДРЯДНИКОМ РОБІТ</span>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className='bg-sidebar-accent'>
                        <TableRow>
                          <TableHead className="border w-[100px]">Код товару</TableHead>
                          <TableHead className="border">Найменування</TableHead>
                          <TableHead className="text-right">ціна</TableHead>
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
