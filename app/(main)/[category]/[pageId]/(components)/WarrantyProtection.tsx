'use client'

import { Card } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks'
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
import WarrantyModal from '@/components/shared/WarrantyModal';
import { Spinner } from '@/components/ui/spinner';
import { IServicesDataItem } from '@/types/data';
import useFirestore from '@/hooks/useFirestore';

export default function WarrantyProtection() {
  const [devicePrice, setDevicePrice] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IServicesDataItem | null>(null);

  const { modifyWarrantyService } = useFirestore();

  const addButtonHandler = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  }

  const edirButtonHandler = (item: IServicesDataItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }

  const data = useAppSelector(state => state.data.collections.services.find(item => item.id === "warranty-protection"))?.data as IServicesDataItem[];
  const role = useAppSelector(state => state.user.role);

  if (!data) return <div className='flex w-full h-full items-center justify-center'><Spinner className='size-16' /></div> 

  const ids = data.map(item => item.id);

  return (
    <div>
      <div className='flex items-center justify-between border-b-1 pb-5'>
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
                  className="p-4 h-[64px] flex justify-between items-center text-left text-base hover:no-underline cursor-pointer border-b-1"
                >
                  <span className="font-medium w-[70%]">{item.title}</span>
                  <span className="text-s font-bold">{devicePrice ? (+devicePrice * item.price).toFixed(2) : 0}</span>
                </AccordionTrigger>

                <AccordionContent className="text-sm leading-relaxed whitespace-pre-wrap relative">
                  <div className="flex justify-self-end bg-[var(--chart-2)] p-1 px-2 rounded-bl-lg font-bold">{(item.price * 100).toFixed(0)}%</div>

                  <div className='p-4 pt-2'>
                    { item.description.replace(/<br\s*\/?>/g, '\n') }
                  </div>
                  {
                    role === "admin" ? 
                      <div className='border-t-1 mt-4 p-4 pb-0 flex gap-2 items-center justify-end'>
                        <Button type='button' variant={'default'} className='cursor-pointer' onClick={() => edirButtonHandler(item)}><Pencil/></Button>
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
      {
      
        isModalOpen && (<WarrantyModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} data={selectedItem} ids={!selectedItem ? ids : null} />)
      }
    </div>
  )
}

