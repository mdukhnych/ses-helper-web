"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAppSelector } from '@/store/hooks'
import { ListRestart } from 'lucide-react';
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import useFirestore from '@/hooks/useFirestore';
import { formatPrice, textWrapping } from '@/utils';
import { EasyProData, EasyProDescription, EasyProPricelistItem } from '@/types/services';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EasyPro() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { updateEasyproPricelist } = useFirestore();

  const role = useAppSelector(state => state.user.role)

  const data = useAppSelector(state => state.services.data.find(item => item.id === "easy-pro"))?.data as EasyProData;
  if (!data) return <div className="w-full h-full flex items-center justify-center"><Spinner className='size-20' /></div>

  const filteredList = data.pricelist.filter(item =>
    item.model.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;

      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" }) as EasyProPricelistItem[];

      updateEasyproPricelist(jsonData, setLoading);
      e.target.value = "";  

    };
    reader.readAsArrayBuffer(file); 
  };

  return (
    <div className='w-full max-w-[1500px] h-full flex flex-col'>

      <div className='flex items-center gap-2 w-full pb-4'>
        <span>Модель:</span>
        <Input id='model' placeholder='Введіть модель пристрою...' value={search} onChange={e => setSearch(e.target.value)} />
        {
          role === "admin" &&
            <>
              <Button type='button' onClick={() => fileInputRef.current?.click()}><ListRestart/></Button>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </>
        }
      </div>

      {
        loading 
          ? <div className="flex items-center"><Spinner className='size-20' /></div>
          : <div className="flex gap-4 flex-1 overflow-hidden">
              <ScrollArea className='relative border w-full rounded-lg overflow-hidden '>
                <Accordion type="single" collapsible >
                  <AccordionItem value="item-1">
                    <AccordionTrigger className='m-0 p-0 cursor-pointer'>
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-sidebar-accent border-b font-semibold text-sm sticky top-0 z-20 w-full">
                        <div className="p-4 border-r">Модель</div>
                        <div className="p-4 border-r text-center">Easy Pro</div>
                        <div className="p-4 border-r text-center">Easy Pro +2</div>
                        <div className="p-4 text-center">Easy Pro +3</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='bg-accent'>
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-sidebar-accent border-b font-semibold text-sm sticky top-0 z-20 w-full">
                        <div className="p-4 border-r"></div>
                        <div className="p-4 border-r " style={{ whiteSpace: 'pre-line' }}>{textWrapping(data.description.easypro.text)}</div>
                        <div className="p-4 border-r " style={{ whiteSpace: 'pre-line' }}>{textWrapping(data.description.easypro2.text)}</div>
                        <div className="p-4 " style={{ whiteSpace: 'pre-line' }}>{textWrapping(data.description.easypro3.text)}</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex flex-col">
                  {filteredList.map((item, i) => (
                    <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                      <div className="p-4 border-r flex items-center font-medium">
                        {item.model}
                      </div>
                      <div className="p-4 border-r flex items-center justify-center">
                        {item.easypro ? formatPrice(item.easypro) : "—"}
                      </div>
                      <div className="p-4 border-r flex items-center justify-center">
                        {item.easypro2 ? formatPrice(item.easypro2) : "—"}
                      </div>
                      <div className="p-4 flex items-center justify-center">
                        {item.easypro3 ? formatPrice(item.easypro3) : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
      }
    </div>
  )
}