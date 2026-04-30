'use client'

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchPromos } from '@/store/slices/informationSlice';
import { PromoItem } from '@/types/information';
import React, { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from '@/components/ui/card';
import { Pencil, Trash } from 'lucide-react';
import { openModal } from '@/store/slices/modalSlice';
import Image from 'next/image';
import ExcelViewer from '@/components/shared/ExcelViewer';
import usePromos from '@/hooks/usePromos';

export default function Promos() {
  const store = useAppSelector(state => state.information.data.promos.items) as PromoItem[] | undefined;
  const role = useAppSelector(state => state.user.role);
  const [searchValue, setSearchValue] = useState<string>("");

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchPromos());
  }, [dispatch]);

  const {deletePromo, clearPromos} = usePromos();

  if (!store) return <div className="flex w-full h-full items-center justify-center "><Spinner /></div>

  return (
    <div>
      <div className="flex items-center gap-3 justify-between border-b pb-4">
        <div className="flex gap-2 items-center w-full">
          <Label>Пошук:</Label>
          <Input className='w-full max-w-[500px]' placeholder='Введіть назву акції...' value={searchValue} onChange={e => setSearchValue(e.target.value)} />
        </div>
        {
          role === "admin" &&
            <div className="flex gap-2">
              <Button onClick={() => dispatch(openModal({type: "promos", payload: null}))}>Додати</Button>
              <ConfirmDialog
                trigger={<Button disabled={store.length <= 0} variant={"destructive"}>Видалити всі</Button>}
                title='Видалити всі акції та промо?'
                description='Скасувати операцію бде неможливо!'
                onConfirm={async () => {
                  await clearPromos();
                }}
              />
            </div>
        }
      </div>

      <div className="mt-4">
        {
          store.length > 0
            ? <Accordion type="single" collapsible className='flex flex-col gap-2'>
                {
                  store.map((item, i) => (
                    <Card className='p-0 px-4' key={item.id}>
                      <AccordionItem value={`item-${i}`}>
                      <AccordionTrigger className='cursor-pointer' showChevron={true}>{item.title}</AccordionTrigger>
                      <AccordionContent className='pt-4 border-t'>
                        <div style={{whiteSpace: 'pre-wrap'}}>
                          { item.description }
                        </div>
                        {
                          item.sku && (
                            <MediaViewer src={item.sku} alt={item.title} />
                          )
                        }

                        <div className="flex gap-2 justify-end pt-4 border-t mt-4">
                          <Button onClick={() => dispatch(openModal({type: "promos", payload: item}))}><Pencil/></Button>
                          <ConfirmDialog 
                            trigger={<Button variant={"destructive"} ><Trash/></Button>}
                            title="Ви впевнені що хочете видалити?"
                            description='Скасувати операцію буде неможливо!'
                            onConfirm={async () => {
                              await deletePromo(item);
                            }}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    </Card>
                  ))
                }
              </Accordion>
            : (
                <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                  <span className="text-lg font-medium">Список акцій порожній</span>
                  <p className="text-sm">Додайте першу ацію за допомогою кнопки вище</p>
                </div>
              )
        }
      </div>

      

    </div>
  )
}

const ImageWithLoader = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative mt-4 w-full min-h-[200px] overflow-hidden rounded-md border bg-muted/10 flex items-center justify-center">
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Spinner />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        width={1200}
        height={600}
        className={`w-full h-auto object-contain transition-opacity duration-500 ease-in-out ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)} 
      />
    </div>
  );
};

const getFileType = (url: string) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.xls') || lowerUrl.includes('.xlsx') || lowerUrl.includes('.csv')) {
    return 'excel';
  }
  if (lowerUrl.includes('.png') || lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.webp')) {
    return 'image';
  }
  return 'unknown';
};

const MediaViewer = ({ src, alt }: { src: string; alt: string }) => {
  const fileType = getFileType(src);

  if (fileType === 'excel') {
    return <ExcelViewer url={src} />;
  }

  if (fileType === 'image') {
    return <ImageWithLoader src={src} alt={alt} />;
  }

  return (
    <div className="mt-4 p-4 border rounded-md flex items-center justify-between bg-muted/10">
      <span className="text-sm">Файл: Завантажений документ</span>
      <a href={src} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
        Завантажити / Відкрити
      </a>
    </div>
  );
};