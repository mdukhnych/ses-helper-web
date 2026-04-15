'use client'

import { Card } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListX, Pencil, Plus, Trash, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { formatPrice } from '@/utils';
import { WarrantyDataItem } from '@/types/services';
import { openModal } from '@/store/slices/modalSlice';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { fetchWarrantyData } from '@/store/slices/servicesSlice';
import useWarrantyProtection from '@/hooks/useWarrantyProtection';

export default function WarrantyProtection() {
  const dispatch = useAppDispatch();
  const [devicePrice, setDevicePrice] = useState('');

  useEffect(() => {
    dispatch(fetchWarrantyData());
  }, [dispatch])

  const { deleteWarranty, clearWarrantyData } = useWarrantyProtection();

  const addButtonHandler = () => {
    dispatch(openModal({type: 'warranty-protection', payload: null}));
  }

  const editButtonHandler = (item: WarrantyDataItem) => {
    dispatch(openModal({type: "warranty-protection", payload: item}));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setDevicePrice(value);
    }
  };

  const data = useAppSelector(state => state.services.data.find(item => item.id === "warranty-protection"))?.data as WarrantyDataItem[];
  const role = useAppSelector(state => state.user.role);

  const sortedData = React.useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const orderA = a.order ?? Infinity;
      const orderB = b.order ?? Infinity;
      return orderA - orderB;
    });
  }, [data]);

  if (!data) return <div className='flex w-full h-full items-center justify-center'><Spinner className='size-16' /></div> 

  return (
    <div>
      <div className='flex items-center justify-between border-b pb-5'>
        <div className='flex items-center gap-2 w-[50%] '>
          <span className=''>Вартість:</span>
          <div className="relative w-full">
            <Input
              id="devicePrice"
              placeholder="Введіть вартість пристрою..."
              value={devicePrice}
              onChange={handleChange}
              inputMode="decimal"
              className="pr-10"
            />

            {devicePrice && (
              <button
                type="button"
                onClick={() => setDevicePrice("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive cursor-pointer" 
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        {
          role === "admin" && 
            <div className='flex gap-2'>
              <Button type='button' className='cursor-pointer' title='Додати новий елемент' onClick={addButtonHandler}><Plus/></Button>
              {
                sortedData.length > 0 &&
                  <ConfirmDialog 
                    trigger = {<Button title='Видалити всі елементи' type='button' variant={"destructive"} className='cursor-pointer'><ListX/></Button>}
                    title = "Видалити всі гарантії?"
                    description="Скасувати операцію буде неможливо!"
                    onConfirm={clearWarrantyData}
                  />
              }
            </div>
        }
      </div>
      <Accordion type="multiple" className="flex flex-wrap gap-3 items-start mt-5">
        {
          sortedData.map((item,i) => (
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
                  <div className="flex justify-end">
                    <span className='bg-chart-2 p-1 px-4 rounded-bl-lg font-bold text-white'>{(item.price * 100).toFixed(0)}%</span>
                  </div>

                  <div className='p-4 pt-2' style={{whiteSpace: 'pre-wrap'}}>
                    { item.description }
                  </div>
                  {
                    role === "admin" ? 
                      <div className='border-t mt-4 p-4 pb-0 flex gap-2 items-center justify-end'>
                        <Button type='button' variant={'default'} className='cursor-pointer' onClick={() => editButtonHandler(item)}><Pencil/></Button>
                        <ConfirmDialog 
                          trigger={<Button type='button' variant={'destructive'} className='cursor-pointer'><Trash /></Button>} 
                          title='Точно видалити?' 
                          description='Скасувати операцію буде неможливо!'  
                          onConfirm={() => deleteWarranty(item.id)}
                        />
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