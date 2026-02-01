'use client'

import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { EktaServicesDataItem } from '@/types/services'
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
import AlertDialogDemo from '@/components/shared/AlertDialog';
import useFirestore from '@/hooks/useFirestore';

export default function EktaService() {
  const store = useAppSelector(state => state.services.data.find(item => item.id === "ekta-services"))?.data as EktaServicesDataItem[];
  const role = useAppSelector(state => state.user.role);

  const dispatch = useAppDispatch();
  const { updateEktaServicesData } = useFirestore();

  const onDeleteService = async (item: EktaServicesDataItem) => {
    await updateEktaServicesData({action: "delete", item: item})
  }

  if (!store) return <div><Spinner/></div>
  return (
    <div>
      { role === "admin" && <Button className='cursor-pointer' onClick={() => dispatch(openModal({type: "ekta-services", payload: null}))}>Додати</Button> }
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
                        <Button className='cursor-pointer' type='button' onClick={() => dispatch(openModal({type: "ekta-services", payload: service}))}>Редактор</Button>
                        <AlertDialogDemo trigger={<Button className='cursor-pointer' type='button'>Видалити</Button>} title={`Видалити групу: ${service.title}?`} description="Після видалення інформації відновлення буде не можливе!" submit={() => onDeleteService(service)} />
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
                          service.list.map(item => (
                            <TableRow key={item.id} className={`select-none cursor-pointer`}>
                              <TableCell className='w-[100px]'>{item.productCode}</TableCell>
                              <TableCell className="font-medium border">
                                <div className="flex items-center justify-between">
                                  { item.title }
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{item.price}</TableCell>
                            </TableRow>
                          ))
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
