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
import { WarrantyDataItem, WarrantyService } from '@/types/services';
import { openModal } from '@/store/slices/modalSlice';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { fetchWarrantyData } from '@/store/slices/servicesSlice';
import useWarrantyProtection from '@/hooks/useWarrantyProtection';
import { toast } from 'sonner';
import PdfViewer from '@/components/shared/PdfViewer';
import { WarrantyPdfTemplate } from '@/components/shared/WarrantyPdfTemplate';

export default function WarrantyProtection() {
  const dispatch = useAppDispatch();
  const [devicePrice, setDevicePrice] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<{ url: string, title: string } | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = async () => {
    if (sortedData.length === 0) {
      toast("Немає даних для генерації");
      return;
    }

    try {
      setIsGenerating(true);
      const { pdf } = await import('@react-pdf/renderer');
      
      const blob = await pdf(
        <WarrantyPdfTemplate 
          data={sortedData} 
          devicePrice={devicePrice} 
          itemsPerRow={3} 
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      setGeneratedPdfUrl(url);
    } catch (error) {
      console.error(error);
      toast("Помилка при генерації PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const closeGeneratedPdf = () => {
    if (generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl);
      setGeneratedPdfUrl(null);
    }
  };

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

  const store = useAppSelector(state => state.services.data.find(item => item.id === "warranty-protection")) as WarrantyService | undefined;
  const role = useAppSelector(state => state.user.role);

  const sortedData = React.useMemo(() => {
    if (!store) return [];
    return [...store.data].sort((a, b) => {
      const orderA = a.order ?? Infinity;
      const orderB = b.order ?? Infinity;
      return orderA - orderB;
    });
  }, [store]);

  if (!store) return <div className='flex w-full h-full items-center justify-center'><Spinner className='size-16' /></div> 

  if (selectedDoc) {
    return (
      <PdfViewer 
        url={selectedDoc.url} 
        title={selectedDoc.title} 
        onBack={() => setSelectedDoc(null)} 
      />
    );
  }

  if (generatedPdfUrl) {
  return (
    <PdfViewer 
      url={generatedPdfUrl} 
      title="Звіт: Гарантійні послуги" 
      onBack={closeGeneratedPdf} 
    />
  )}

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
        <div className="flex gap-2 items-center">
          {
            store.data.length > 0 &&
              <Button 
                type='button' 
                className='cursor-pointer' 
                onClick={handleGeneratePdf}
                disabled={isGenerating}
              >
                {isGenerating ? <Spinner className="mr-2 h-4 w-4" /> : null}
                {isGenerating ? 'Генерація...' : 'Згенерувати PDF'}
              </Button>
          }
          {
            role === "admin" && 
              <div className='flex gap-2'>
                <Button size={"icon"} type='button' className='cursor-pointer' title='Додати новий елемент' onClick={addButtonHandler}><Plus/></Button>
                {
                  sortedData.length > 0 &&
                    <ConfirmDialog 
                      trigger = {<Button size={"icon"} title='Видалити всі елементи' type='button' variant={"destructive"} className='cursor-pointer'><ListX/></Button>}
                      title = "Видалити всі гарантії?"
                      description="Скасувати операцію буде неможливо!"
                      onConfirm={clearWarrantyData}
                    />
                }
              </div>
          }
        </div>
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
                    <span className='bg-chart-2 p-2 px-4 rounded-bl-lg font-bold text-white'>{(item.price * 100).toFixed(0)}%</span>
                  </div>

                  <div className='p-4 pt-2' style={{whiteSpace: 'pre-wrap'}}>
                    { item.description }
                  </div>
                  <div className='border-t mt-4 p-4 pb-0 flex gap-2 items-center justify-end'>
                    <Button 
                      className='cursor-pointer'
                      type='button' 
                      disabled={item.fileURL.length <= 0}
                      onClick={() => item.fileURL ? setSelectedDoc({ url: item.fileURL, title: item.title }) : toast("Файл не знайдено!")}
                    >{"Пам'ятка"}</Button>
                    {
                      role === "admin" ? 
                        <>
                          <Button size={"icon"} type='button' variant={'default'} className='cursor-pointer' onClick={() => editButtonHandler(item)}><Pencil/></Button>
                          <ConfirmDialog 
                            trigger={<Button size={"icon"} type='button' variant={'destructive'} className='cursor-pointer'><Trash /></Button>} 
                            title='Точно видалити?' 
                            description='Скасувати операцію буде неможливо!'  
                            onConfirm={() => deleteWarranty(item)}
                          />
                        </>
                      : null
                    }
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