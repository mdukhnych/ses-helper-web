'use client'

import { Card } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import useFirestore from '@/hooks/useFirestore';
import { formatPrice } from '@/utils';
import { WarrantyDataItem } from '@/types/services';
import { openModal } from '@/store/slices/modalSlice';


export default function WarrantyProtection() {
  const [devicePrice, setDevicePrice] = useState('');

  const { modifyWarrantyService } = useFirestore();

  const dispatch = useAppDispatch();

  const addButtonHandler = () => {
    dispatch(openModal({type: 'warranty-protection', payload: null}));
  }

  const editButtonHandler = (item: WarrantyDataItem) => {
    dispatch(openModal({type: "warranty-protection", payload: item}));
  }

  const data = useAppSelector(state => state.services.data.find(item => item.id === "warranty-protection"))?.data as WarrantyDataItem[];
  const role = useAppSelector(state => state.user.role);

  if (!data) return <div className='flex w-full h-full items-center justify-center'><Spinner className='size-16' /></div> 

  return (
    <div>
      <div className='flex items-center justify-between border-b pb-5'>
        <div className='flex items-center gap-2 w-[50%] '>
          <span className=''>Вартість:</span>
          <Input id='devicePrice' placeholder='Введіть вартість пристрою...' type='number' value={devicePrice} onChange={e => setDevicePrice(e.target.value)}/>
        </div>
        <div>
          <Button type='button' className='cursor-pointer' onClick={addButtonHandler}><Plus/></Button>
        </div>
      </div>
      <Accordion type="multiple" className="flex flex-wrap gap-3 items-start mt-5">
        {
          data.map((item,i) => (
            <Card
              key={i}
              className="w-full sm:w-[48%] lg:w-[32%] p-0 relative"
            >
              <AccordionItem value={`item-${i}`}>
                <AccordionTrigger
                  className="p-4 h-16 flex justify-between items-center text-left text-base hover:no-underline cursor-pointer border-b"
                >
                  <span className="font-medium w-[70%]">{item.title}</span>
                  <span className="text-s font-bold">{devicePrice ? formatPrice(+devicePrice * item.price) : 0}</span>
                </AccordionTrigger>

                <AccordionContent className="text-sm leading-relaxed whitespace-pre-wrap relative">
                  <div className="flex justify-self-end bg-chart-2 p-1 px-2 rounded-bl-lg font-bold">{(item.price * 100).toFixed(0)}%</div>

                  <div className='p-4 pt-2'>
                    { item.description.replace(/<br\s*\/?>/g, '\n') }
                  </div>
                  {
                    role === "admin" ? 
                      <div className='border-t mt-4 p-4 pb-0 flex gap-2 items-center justify-end'>
                        <Button type='button' variant={'default'} className='cursor-pointer' onClick={() => editButtonHandler(item)}><Pencil/></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button type='button' variant={'destructive'} className='cursor-pointer'><Trash /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ви точно бажаєте видалити: {item.title}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Після видалення сервісу відновити дані буде не можливо.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Відміна</AlertDialogCancel>
                              <AlertDialogAction onClick={() => modifyWarrantyService("delete", item)}>Видалити</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    : null
                  }
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))
        }
      </Accordion>
    </div>
  )
}

