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

import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';
import { PromosPdfTemplate, PdfPromoItem, CellValue } from '@/components/shared/PromosPdfTemplate'; 
import { Download } from 'lucide-react';
import PdfViewer from '@/components/shared/PdfViewer';
import { getFileType } from "@/utils"

export default function Promos() {
  const store = useAppSelector(state => state.information.data.promos.items) as PromoItem[] | undefined;
  const role = useAppSelector(state => state.user.role);
  const [searchValue, setSearchValue] = useState<string>("");
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const {deletePromo, clearPromos} = usePromos();

  useEffect(() => {
    dispatch(fetchPromos());
  }, [dispatch]);

  const filteredStore = store?.filter(item => {
    const searchLower = searchValue.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(searchLower);
    const descMatch = item.description?.toLowerCase().includes(searchLower);
    return titleMatch || descMatch;
  }) || [];

  const handleGeneratePdf = async () => {
    if (!filteredStore || filteredStore.length === 0) return;
    
    setIsGeneratingPdf(true);

    try {
      const preparedData: PdfPromoItem[] = await Promise.all(
        filteredStore.map(async (item) => {
          const fileType = getFileType(item.sku || '');

          if (fileType === 'excel' && item.sku) {
            try {
              const response = await fetch(item.sku);
              const arrayBuffer = await response.arrayBuffer();
              const workbook = XLSX.read(arrayBuffer, { type: 'array' });
              const worksheet = workbook.Sheets[workbook.SheetNames[0]];
              
              const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
              const merges = worksheet['!merges'] || [];

              const jsonData = XLSX.utils.sheet_to_json<CellValue[]>(worksheet, { 
                header: 1, 
                defval: '', 
                blankrows: true 
              });
              
              return { 
                ...item, 
                parsedExcelData: jsonData,
                excelMerges: merges,
                excelRowOffset: range.s.r
              };
            } catch (error) {
              console.error(`Помилка парсингу Excel для ${item.title}:`, error);
              return item; 
            }
          }
          
          return item; 
        })
      );

      const blob = await pdf(<PromosPdfTemplate items={preparedData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);

    } catch (error) {
      console.error("Помилка генерації PDF:", error);
      alert("Сталася помилка при створенні PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!store) return <div className="flex w-full h-full items-center justify-center "><Spinner /></div>

  if (pdfPreviewUrl) {
    return (
      <div className="h-[calc(100vh-100px)] w-full border rounded-md overflow-hidden shadow-sm">
      <PdfViewer 
        url={pdfPreviewUrl} 
        title="Промо акції (Експорт)" 
        onBack={() => {
          URL.revokeObjectURL(pdfPreviewUrl);
          setPdfPreviewUrl(null);
        }} 
      />
    </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 justify-between border-b pb-4">
        <div className="flex gap-2 items-center w-full">
          <Label>Пошук:</Label>
          <Input className='w-full max-w-[500px]' placeholder='Введіть назву акції...' value={searchValue} onChange={e => setSearchValue(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={"outline"} 
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf || filteredStore.length === 0}
          >
            {isGeneratingPdf ? <Spinner className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
            {isGeneratingPdf ? 'Створення...' : 'Згенерувати PDF'}
          </Button>

          {role === "admin" && (
            <div className="flex gap-2">
              <Button onClick={() => dispatch(openModal({type: "promos", payload: null}))}>Додати</Button>
              <ConfirmDialog
                trigger={<Button disabled={store.length <= 0} variant={"destructive"}>Видалити всі</Button>}
                title='Видалити всі акції та промо?'
                description='Скасувати операцію буде неможливо!'
                onConfirm={async () => {
                  await clearPromos();
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {filteredStore.length > 0 ? (
          <Accordion type="single" collapsible className='flex flex-col gap-2'>
            {filteredStore.map((item, i) => (
              <Card className='p-0 px-4' key={item.id}>
                <AccordionItem value={`item-${i}`}>
                <AccordionTrigger className='cursor-pointer' showChevron={true}>{item.title}</AccordionTrigger>
                <AccordionContent className='pt-4 border-t'>
                  <div style={{whiteSpace: 'pre-wrap'}}>
                    { item.description }
                  </div>
                  {item.sku && (
                    <MediaViewer src={item.sku} alt={item.title} />
                  )}

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
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
            {searchValue ? (
              <>
                <span className="text-lg font-medium">За запитом &quot;{searchValue}&quot; нічого не знайдено</span>
                <p className="text-sm mt-2">Спробуйте змінити критерії пошуку</p>
              </>
            ) : (
              <>
                <span className="text-lg font-medium">Список акцій порожній</span>
                <p className="text-sm mt-2">Додайте першу акцію за допомогою кнопки вище</p>
              </>
            )}
          </div>
        )}
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